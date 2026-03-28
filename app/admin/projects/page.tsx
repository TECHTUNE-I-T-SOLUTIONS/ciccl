import AdminLayout from '@/components/AdminLayout';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import ProjectsClient, { AdminProjectRow } from './ProjectsClient.client';

export default async function AdminProjectsPage({ searchParams }: { searchParams?: Promise<{ filter?: string }> }) {
  await connectDB();

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const filter = (resolvedSearchParams?.filter as 'all' | 'published' | 'draft' | 'featured') || 'all';
  const query: any = {};
  if (filter === 'published') query.isPublished = true;
  if (filter === 'draft') query.isPublished = false;
  if (filter === 'featured') query.isFeatured = true;

  const rawProjects = (await Project.find(query)
    .select('_id title slug projectType isPublished isFeatured createdAt')
    .sort({ createdAt: -1 })
    .lean()) as any[];

  const projects: AdminProjectRow[] = rawProjects.map((p) => ({
    _id: p._id.toString(),
    title: p.title ?? '',
    slug: p.slug ?? '',
    projectType: p.projectType ?? '',
    isPublished: Boolean(p.isPublished),
    isFeatured: Boolean(p.isFeatured),
    createdAt: (p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString()) as any,
  }));

  return (
    <AdminLayout>
      <div className="w-full max-w-[1260px] mx-auto px-4 md:px-8 pt-8 pb-12">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-4xl font-bold">Manage Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">Create, edit, and manage your portfolio projects.</p>
          </div>
        </div>

        <ProjectsClient initialProjects={projects} initialFilter={filter} />
      </div>
    </AdminLayout>
  );
}
//   projectType: string;
//   isPublished: boolean;
//   isFeatured: boolean;
//   createdAt: Date;
// };

// const formatDate = (date?: string | Date) => {
//   if (!date) return '—';
//   const d = typeof date === 'string' ? new Date(date) : date;
//   return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
// };

// async function fetchAdminProjects(filter?: 'all' | 'published' | 'draft' | 'featured') {
//   await connectDB();

//   const query: any = {};
//   if (filter === 'published') query.isPublished = true;
//   if (filter === 'draft') query.isPublished = false;
//   if (filter === 'featured') query.isFeatured = true;

//   const projects = await Project.find(query)
//     .select('title slug shortSummary projectType isPublished isFeatured createdAt')
//     .sort({ createdAt: -1 })
//     .lean();

//   return projects as AdminProject[];
// }

// export default async function AdminProjectsPage({ searchParams }: { searchParams?: { filter?: string } }) {
//   const filter = (searchParams?.filter as 'all' | 'published' | 'draft' | 'featured') || 'all';
//   const projects = await fetchAdminProjects(filter);

//   return (
//     <AdminLayout>
//       <div className="w-full max-w-full p-4 md:p-8">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
//           <div>
//             <h1 className="text-3xl md:text-4xl font-bold">Manage Projects</h1>
//             <p className="text-muted-foreground mt-2">Create, edit, and manage your portfolio projects</p>
//           </div>
//           <Link href="/admin/projects/new" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-orange-700 transition">
//             Add New Project
//           </Link>
//         </div>

//         <div className="mb-6 flex flex-wrap items-center gap-2">
//           {['all', 'published', 'draft', 'featured'].map((tab) => (
//             <Link
//               key={tab}
//               href={`/admin/projects?filter=${tab}`}
//               className={`px-4 py-2 rounded-lg transition ${filter === tab ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:border-primary'}`}
//             >
//               {tab.charAt(0).toUpperCase() + tab.slice(1)}
//             </Link>
//           ))}
//         </div>

//         {projects.length === 0 ? (
//           <div className="p-8 bg-card border border-border rounded-lg text-center text-muted-foreground">
//             No projects found for filter "{filter}".
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full border border-border rounded-lg overflow-hidden">
//               <thead className="bg-card">
//                 <tr>
//                   <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-muted-foreground">Title</th>
//                   <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-muted-foreground">Type</th>
//                   <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-muted-foreground">Status</th>
//                   <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-muted-foreground">Featured</th>
//                   <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-muted-foreground">Created</th>
//                   <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-muted-foreground">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {projects.map((project) => (
//                   <tr key={project._id} className="border-t border-border">
//                     <td className="px-3 py-2 text-sm">{project.title}</td>
//                     <td className="px-3 py-2 text-sm">{project.projectType || 'N/A'}</td>
//                     <td className="px-3 py-2 text-sm">{project.isPublished ? 'Published' : 'Draft'}</td>
//                     <td className="px-3 py-2 text-sm">{project.isFeatured ? 'Yes' : 'No'}</td>
//                     <td className="px-3 py-2 text-sm">{formatDate(project.createdAt)}</td>
//                     <td className="px-3 py-2 text-sm space-x-2">
//                       <Link href={`/admin/projects/${project._id}`} className="text-primary hover:underline">Edit</Link>
//                       <Link href={`/projects/${project.slug}`} className="text-primary hover:underline" target="_blank" rel="noreferrer">View</Link>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </AdminLayout>
//   );
// }
