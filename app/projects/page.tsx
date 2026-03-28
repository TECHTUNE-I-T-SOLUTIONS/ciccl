'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';

interface Project {
  _id: string;
  title: string;
  slug: string;
  shortSummary: string;
  coverImage?: string;
  hashtags: string[];
  projectType: string;
  budgetScope: {
    min: number;
    max: number;
    currency: string;
  };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [allHashtags, setAllHashtags] = useState<string[]>([]);
  const [allTypes, setAllTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchProjects();
  }, [selectedHashtag, selectedType]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let url = '/api/projects?limit=20';
      if (selectedHashtag) url += `&hashtag=${selectedHashtag}`;
      if (selectedType) url += `&type=${selectedType}`;

      const response = await fetch(url);
      const data = await response.json();
      setProjects(data.data);

      // Extract unique hashtags and types
      const hashtags = new Set<string>();
      const types = new Set<string>();
      data.data.forEach((project: Project) => {
        project.hashtags.forEach((tag) => hashtags.add(tag));
        types.add(project.projectType);
      });
      setAllHashtags(Array.from(hashtags));
      setAllTypes(Array.from(types));
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full bg-background">
      <Navbar />
      <div className="w-full max-w-full pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">Projects Portfolio</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Explore our completed quantity surveying projects across diverse sectors in Nigeria.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Project Type Filter */}
          {allTypes.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-3">Project Type</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedType(null)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !selectedType
                      ? 'bg-primary text-background'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All Types
                </button>
                {allTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedType === type
                        ? 'bg-primary text-background'
                        : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hashtag Filter */}
          {allHashtags.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-3">Filter by Tags</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedHashtag(null)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !selectedHashtag
                      ? 'bg-primary text-background'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All Tags
                </button>
                {allHashtags.slice(0, 8).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedHashtag(tag)}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                      selectedHashtag === tag
                        ? 'bg-primary text-background'
                        : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-80 bg-card rounded-lg border border-border"
              />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {projects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Link href={`/projects/${project.slug}`}>
                  <div className="h-80 rounded-lg overflow-hidden bg-card border border-border hover-glow cursor-pointer">
                    {project.coverImage && (
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        className="w-full h-1/2 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    <div className="p-4 h-1/2 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{project.title}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">{project.shortSummary}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.hashtags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {project.budgetScope.currency} {project.budgetScope.min.toLocaleString()} - {project.budgetScope.max.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No projects found matching your filters.</p>
          </div>
        )}
      </div>
      <Footer />
      <MobileNav />
    </main>
  );
}
