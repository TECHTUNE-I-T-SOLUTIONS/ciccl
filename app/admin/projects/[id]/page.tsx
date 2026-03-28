import AdminLayout from '@/components/AdminLayout';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import EditProjectForm, { EditProjectDto } from '../EditProjectForm.client';
import { notFound } from 'next/navigation';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const projectDoc = await Project.findById(id).lean();
  if (!projectDoc) return notFound();

  const project = JSON.parse(JSON.stringify(projectDoc)) as EditProjectDto;

  return (
    <AdminLayout>
      <div className="w-full max-w-3xl mx-auto p-4 md:p-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Edit Project</h1>
            <p className="text-sm text-muted-foreground">ID: {project._id}</p>
          </div>
          <a
            href={`/projects/${project.slug}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            View Live Project
          </a>
        </div>

        <div className="mb-6 bg-card border border-border p-4 rounded-lg">
          <p><span className="font-semibold">Project type:</span> {project.projectType}</p>
          <p><span className="font-semibold">Status:</span> {project.isPublished ? 'Published' : 'Draft'}</p>
          <p><span className="font-semibold">Featured:</span> {project.isFeatured ? 'Yes' : 'No'}</p>
          <p><span className="font-semibold">Created:</span> {new Date(project.createdAt).toLocaleString()}</p>
        </div>

        <EditProjectForm project={project} />
      </div>
    </AdminLayout>
  );
}

// export default function EditProjectPage() {
//   const params = useParams();
//   const id = (params as any)?.id;
//   const router = useRouter();

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [project, setProject] = useState<any>(null);

//   useEffect(() => {
//     if (!id) return;
//     const t = async () => {
//       try {
//         const token = localStorage.getItem('adminToken');
//         const res = await fetch(`/api/projects/by-id/${id}`, {
//           headers: token ? { Authorization: `Bearer ${token}` } : undefined,
//         });
//         if (!res.ok) throw new Error('Failed to fetch project');
//         const json = await res.json();
//         const data = json.data;
//         setProject({
//           title: data.title || '',
//           slug: data.slug || '',
//           shortSummary: data.shortSummary || '',
//           description: data.description || '',
//           projectType: data.projectType || '',
//           budgetMin: data.budgetScope?.min || 0,
//           budgetMax: data.budgetScope?.max || 0,
//           currency: data.budgetScope?.currency || 'NGN',
//           timelineStart: data.timeline?.startDate ? new Date(data.timeline.startDate).toISOString().slice(0,10) : '',
//           timelineEnd: data.timeline?.endDate ? new Date(data.timeline.endDate).toISOString().slice(0,10) : '',
//           isFeatured: !!data.isFeatured,
//           isPublished: !!data.isPublished,
//           coverImage: data.coverImage || '',
//           images: data.images || [],
//         });
//       } catch (err) {
//         toast.error('Failed to load project');
//       } finally {
//         setLoading(false);
//       }
//     };
//     t();
//   }, [id]);

//   const handleSave = async (e?: React.FormEvent) => {
//     e?.preventDefault();
//     if (!project) return;
//     setSaving(true);
//     try {
//       const token = localStorage.getItem('adminToken');
//       if (!token) {
//         toast.error('Not authenticated');
//         router.push('/auth/admin/login');
//         return;
//       }

//       const payload: any = {
//         title: project.title,
//         slug: project.slug,
//         shortSummary: project.shortSummary,
//         description: project.description,
//         projectType: project.projectType,
//         budgetScope: { min: Number(project.budgetMin || 0), max: Number(project.budgetMax || 0), currency: project.currency || 'NGN' },
//         timeline: { startDate: project.timelineStart || null, endDate: project.timelineEnd || null },
//         isFeatured: !!project.isFeatured,
//         isPublished: !!project.isPublished,
//         coverImage: project.coverImage || null,
//         images: project.images || [],
//       };

//       const res = await fetch(`/api/projects/by-id/${id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) throw new Error('Failed to update project');
//       toast.success('Project updated');
//       router.push('/admin/projects');
//     } catch (err: any) {
//       toast.error(err?.message || 'Error updating project');
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) return <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;

//   return (
//     <div className="w-full max-w-3xl mx-auto p-4 md:p-8">
//       <h1 className="text-2xl font-bold mb-4">Edit Project</h1>
//       <form onSubmit={handleSave} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium mb-1">Title</label>
//           <input value={project.title} onChange={e => setProject({ ...project, title: e.target.value })} className="w-full px-3 py-2 border rounded" />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-1">Short Summary</label>
//           <input value={project.shortSummary} onChange={e => setProject({ ...project, shortSummary: e.target.value })} className="w-full px-3 py-2 border rounded" />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-1">Description</label>
//           <textarea value={project.description} onChange={e => setProject({ ...project, description: e.target.value })} rows={6} className="w-full px-3 py-2 border rounded" />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-1">Project Type</label>
//           <select value={project.projectType} onChange={e => setProject({ ...project, projectType: e.target.value })} className="w-full px-3 py-2 border rounded">
//             <option value="">Select type</option>
//             {PROJECT_TYPES.map(pt => (
//               <option key={pt} value={pt}>{pt}</option>
//             ))}
//           </select>
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">Budget Min</label>
//             <input type="number" value={project.budgetMin} onChange={e => setProject({ ...project, budgetMin: e.target.value })} className="w-full px-3 py-2 border rounded" />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">Budget Max</label>
//             <input type="number" value={project.budgetMax} onChange={e => setProject({ ...project, budgetMax: e.target.value })} className="w-full px-3 py-2 border rounded" />
//           </div>
//         </div>

//         <div className="flex gap-2">
//           <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded">
//             {saving ? 'Saving...' : 'Save Changes'}
//           </button>
//           <button type="button" onClick={() => router.push('/admin/projects')} className="px-4 py-2 border rounded">Cancel</button>
//         </div>
//       </form>
//     </div>
//   );
// }
