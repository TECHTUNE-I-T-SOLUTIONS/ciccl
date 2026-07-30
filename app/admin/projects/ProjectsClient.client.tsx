'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Loader2, Trash2, Star, Eye, Edit2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface AdminProjectRow {
  _id: string;
  title: string;
  slug: string;
  projectType: string;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
}

type Props = {
  initialProjects: AdminProjectRow[];
  initialFilter: 'all' | 'published' | 'draft' | 'featured';
};

const filterOptions: Array<{ value: Props['initialFilter']; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'featured', label: 'Featured' },
];

export default function ProjectsClient({ initialProjects, initialFilter }: Props) {
  const [projects, setProjects] = useState<AdminProjectRow[]>(initialProjects);
  const [selectedFilter, setSelectedFilter] = useState<Props['initialFilter']>(initialFilter);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<AdminProjectRow | null>(null);

  const filteredProjects = useMemo(() => {
    if (selectedFilter === 'published') return projects.filter((p) => p.isPublished);
    if (selectedFilter === 'draft') return projects.filter((p) => !p.isPublished);
    if (selectedFilter === 'featured') return projects.filter((p) => p.isFeatured);
    return projects;
  }, [projects, selectedFilter]);

  const handleToggleFeatured = async (id: string, current: boolean) => {
    setLoadingId(id);
    try {
      const token = localStorage.getItem('adminToken');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`/api/projects/by-id/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ isFeatured: !current }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const result = await res.json();
      setProjects((prev) => prev.map((p) => (p._id === id ? { ...p, isFeatured: result.data.isFeatured } : p)));
      toast.success(current ? 'Unfeatured' : 'Featured');
    } catch (error) {
      toast.error((error as Error).message || 'Failed to toggle feature');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteClick = (project: AdminProjectRow) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    setLoadingId(projectToDelete._id);
    try {
      const token = localStorage.getItem('adminToken');
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`/api/projects/by-id/${projectToDelete._id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Failed to delete');
      setProjects((prev) => prev.filter((p) => p._id !== projectToDelete._id));
      toast.success('Project deleted');
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to delete');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedFilter(opt.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedFilter === opt.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:border-primary hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <Link 
          href="/admin/projects/new" 
          className="px-5 py-2.5 bg-primary p-2 hover:bg-orange-600 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          Add New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full py-16 p-2 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground">
            <p className="text-lg font-medium">No projects found</p>
            <p className="text-sm">Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div 
              key={project._id} 
              className="group flex flex-col p-2 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-2 flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-foreground">
                    {project.title}
                  </h3>
                  <div className="flex shrink-0">
                    {project.isPublished ? (
                      <span className="px-2.5 py-1 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold tracking-wide uppercase">
                        Published
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-semibold tracking-wide uppercase">
                        Draft
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5 text-sm text-muted-foreground mt-auto">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground/70">Type</span>
                    <span className="truncate ml-4">{project.projectType || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground/70">Created</span>
                    <time suppressHydrationWarning className="truncate ml-4">
                      {new Date(project.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </time>
                  </div>
                </div>
              </div>

              <div className="px-2 py-4 bg-muted/30 border-t border-border flex items-center justify-end gap-1">
                <button
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                    project.isFeatured
                      ? 'border-orange-500/30 text-orange-600 dark:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20'
                      : 'border-border text-muted-foreground hover:border-primary hover:text-primary bg-background'
                  }`}
                  onClick={() => handleToggleFeatured(project._id, project.isFeatured)}
                  disabled={loadingId === project._id}
                >
                  {loadingId === project._id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Star className={`h-3.5 w-3.5 ${project.isFeatured ? 'fill-current' : ''}`} />
                  )}
                  {project.isFeatured ? 'Unfeature' : 'Feature'}
                </button>

                <Link 
                  href={`/projects/${project.slug}`} 
                  target="_blank" 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-background text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" /> 
                  {/* View */}
                </Link>

                <Link 
                  href={`/admin/projects/${project._id}`} 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-background text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" /> 
                  {/* Edit */}
                </Link>

                <button
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-background text-muted-foreground hover:border-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => handleDeleteClick(project)}
                  disabled={loadingId === project._id}
                >
                  {loadingId === project._id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  {/* Delete */}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Project
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">"{projectToDelete?.title}"</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingId === projectToDelete?._id}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={loadingId === projectToDelete?._id}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loadingId === projectToDelete?._id ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}