'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Eye, FileText } from 'lucide-react';
import { ClientLayout } from '@/components/ClientLayout';

interface ClientProject {
  _id: string;
  projectName: string;
  serviceType: string;
  description: string;
  budget: number;
  status: 'submitted' | 'in-progress' | 'completed';
  submittedDate: string;
  lastUpdate: string;
}

export default function ClientProjects() {
  const router = useRouter();
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<ClientProject | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkAuthAndFetchProjects();
  }, []);

  const checkAuthAndFetchProjects = async () => {
    try {
      const token = localStorage.getItem('clientToken');
      if (!token) {
        router.push('/auth/client/login');
        return;
      }

      const response = await fetch('/api/clients/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem('clientToken');
        router.push('/auth/client/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch projects');

      const data = await response.json();
      setProjects(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error fetching projects';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-400';
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      default:
        return '';
    }
  };

  const content = (
    <div className="w-full max-w-full p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">My Projects</h1>
          <p className="text-muted-foreground mt-2">View all your submitted projects and track their progress</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
            {error}
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 bg-card border border-border rounded-lg text-center"
          >
            <p className="text-muted-foreground mb-4">No projects submitted yet</p>
            <button
              onClick={() => router.push('/client/submit-project')}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-orange-700 transition"
            >
              Submit Your First Project
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {projects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 bg-card border border-border rounded-lg hover:border-primary transition"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{project.projectName}</h3>
                      <span className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Service Type</p>
                        <p className="font-medium">{project.serviceType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Budget</p>
                        <p className="font-medium text-primary">₦{project.budget.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Submitted</p>
                        <p className="font-medium">{new Date(project.submittedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setShowDetails(true);
                    }}
                    className="p-2 hover:bg-primary/10 rounded-lg transition"
                  >
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Details Modal */}
        {showDetails && selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowDetails(false)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">{selectedProject.projectName}</h2>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${getStatusColor(selectedProject.status)}`}>
                    {selectedProject.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Service Type</p>
                  <p className="font-medium">{selectedProject.serviceType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{selectedProject.description}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Budget</p>
                  <p className="font-medium text-lg text-primary">₦{selectedProject.budget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Submitted Date</p>
                  <p className="text-sm">{new Date(selectedProject.submittedDate).toLocaleString()}</p>
                </div>
                {selectedProject.lastUpdate && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Last Update</p>
                    <p className="text-sm">{new Date(selectedProject.lastUpdate).toLocaleString()}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowDetails(false)}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-orange-700 transition"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );

  return <ClientLayout>{content}</ClientLayout>;
}
