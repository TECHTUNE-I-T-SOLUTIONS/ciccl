'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PROJECT_TYPES } from '@/lib/constants/projectTypes';
import { Loader2, Upload } from 'lucide-react';

export interface EditProjectDto {
  createdAt: string | number | Date;
  _id: string;
  title: string;
  slug: string;
  shortSummary: string;
  description: string;
  projectType: string;
  isPublished: boolean;
  isFeatured: boolean;
  coverImage?: string;
  images?: string[];
  budgetScope?: { min?: number; max?: number; currency?: string };
  timeline?: { startDate?: string; endDate?: string };
}

type Props = {
  project: EditProjectDto;
};

export default function EditProjectForm({ project }: Props) {
  const router = useRouter();
  const [data, setData] = useState<EditProjectDto>({ ...project });
  const [saving, setSaving] = useState(false);

  const handleChange = (key: keyof EditProjectDto, value: string | boolean) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: data.title,
      slug: data.slug,
      shortSummary: data.shortSummary,
      description: data.description,
      projectType: data.projectType,
      isPublished: data.isPublished,
      isFeatured: data.isFeatured,
      coverImage: data.coverImage,
      images: data.images || [],
      budgetScope: data.budgetScope || { min: 0, max: 0, currency: 'NGN' },
      timeline: data.timeline || { startDate: '', endDate: '' },
    };

    try {
      const res = await fetch(`/api/projects/by-id/${project._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Failed to update project');
      }

      toast.success('Project updated');
      router.push('/admin/projects');
    } catch (error) {
      toast.error((error as Error).message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1">
          <span className="text-sm font-medium">Title</span>
          <input
            value={data.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Slug</span>
          <input
            value={data.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </label>
      </div>

      <label className="space-y-1">
        <span className="text-sm font-medium">Short Summary</span>
        <input
          value={data.shortSummary}
          onChange={(e) => handleChange('shortSummary', e.target.value)}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </label>

      <label className="space-y-1">
        <span className="text-sm font-medium">Description</span>
        <textarea
          value={data.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={5}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="space-y-1">
          <span className="text-sm font-medium">Project Type</span>
          <select
            value={data.projectType}
            onChange={(e) => handleChange('projectType', e.target.value)}
            className="w-full px-3 py-2 border rounded bg-background"
            required
          >
            <option value="">Select type</option>
            {PROJECT_TYPES.map((pt) => (
              <option key={pt} value={pt}>
                {pt}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Budget Min</span>
          <input
            type="number"
            value={data.budgetScope?.min ?? ''}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                budgetScope: { ...prev.budgetScope, min: Number(e.target.value) },
              }))
            }
            className="w-full px-3 py-2 border rounded"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Budget Max</span>
          <input
            type="number"
            value={data.budgetScope?.max ?? ''}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                budgetScope: { ...prev.budgetScope, max: Number(e.target.value) },
              }))
            }
            className="w-full px-3 py-2 border rounded"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1">
          <span className="text-sm font-medium">Timeline Start</span>
          <input
            type="date"
            value={data.timeline?.startDate ?? ''}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                timeline: { ...prev.timeline, startDate: e.target.value },
              }))
            }
            className="w-full px-3 py-2 border rounded"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium">Timeline End</span>
          <input
            type="date"
            value={data.timeline?.endDate ?? ''}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                timeline: { ...prev.timeline, endDate: e.target.value },
              }))
            }
            className="w-full px-3 py-2 border rounded"
          />
        </label>
      </div>

      <label className="space-y-1">
        <span className="text-sm font-medium">Features (comma-separated)</span>
        <input
          type="text"
          value={(data.features || []).join(', ')}
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              features: e.target.value.split(',').map((item) => item.trim()).filter(Boolean),
            }))
          }
          className="w-full px-3 py-2 border rounded"
        />
      </label>

      <label className="space-y-1">
        <span className="text-sm font-medium">Problems Solved (comma-separated)</span>
        <input
          type="text"
          value={(data.images || []).join(', ')}
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              problemsSolved: e.target.value.split(',').map((item) => item.trim()).filter(Boolean),
            }))
          }
          className="w-full px-3 py-2 border rounded"
        />
      </label>

      <label className="space-y-1">
        <span className="text-sm font-medium">Deliverables (comma-separated)</span>
        <input
          type="text"
          value={(data.deliverables || []).join(', ')}
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              deliverables: e.target.value.split(',').map((item) => item.trim()).filter(Boolean),
            }))
          }
          className="w-full px-3 py-2 border rounded"
        />
      </label>

      <label className="space-y-1">
        <span className="text-sm font-medium">Hashtags (comma-separated)</span>
        <input
          type="text"
          value={(data.hashtags || []).join(', ')}
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              hashtags: e.target.value.split(',').map((item) => item.replace('#', '').trim()).filter(Boolean),
            }))
          }
          className="w-full px-3 py-2 border rounded"
        />
      </label>

      <div className="flex items-center gap-4">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.isPublished}
            onChange={(e) => handleChange('isPublished', e.target.checked)}
            className="accent-primary"
          />
          Published
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.isFeatured}
            onChange={(e) => handleChange('isFeatured', e.target.checked)}
            className="accent-primary"
          />
          Featured
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-primary text-white rounded flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
        </button>
        <button type="button" onClick={() => router.push('/admin/projects')} className="px-4 py-2 border rounded">
          Cancel
        </button>
      </div>
    </form>
  );
}
