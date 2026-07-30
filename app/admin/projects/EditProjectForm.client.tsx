'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PROJECT_TYPES } from '@/lib/constants/projectTypes';
import { Loader2, Upload, X } from 'lucide-react';
import { compressImage, validateFileSize, estimateCompressedSize } from '@/lib/utils/imageCompression';

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
  features?: string[];
  problemsSolved?: string[];
  deliverables?: string[];
  hashtags?: string[];
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
  const [compressing, setCompressing] = useState(false);

  const [availableImages, setAvailableImages] = useState<any[]>([]);
  const [selectedImageUrls, setSelectedImageUrls] = useState<string[]>(project.images || []);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(project.coverImage || null);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (key: keyof EditProjectDto, value: string | boolean) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const t = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      try {
        const res = await fetch('/api/images', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const imageData = await res.json();
        setAvailableImages(Array.isArray(imageData.data) ? imageData.data : []);
      } catch (err) {
        // ignore
      }
    };
    t();
  }, []);

  const toggleSelectImage = (url: string) => {
    setSelectedImageUrls(prev => {
      if (prev.includes(url)) {
        return prev.filter(u => u !== url);
      } else {
        const totalImages = prev.length + uploadingFiles.length;
        if (totalImages >= 20) {
          toast.error('Maximum 20 images allowed');
          return prev;
        }
        return [...prev, url];
      }
    });
  };

  const removeExistingImage = (url: string) => {
    setSelectedImageUrls(prev => prev.filter(u => u !== url));
    if (coverImageUrl === url) {
      setCoverImageUrl(null);
    }
  };

  useEffect(() => {
    const urls = uploadingFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [uploadingFiles]);

  const removeUploadingFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    const totalImages = selectedImageUrls.length + uploadingFiles.length + fileArray.length;
    if (totalImages > 20) {
      toast.error(`Maximum 20 total images allowed (currently ${selectedImageUrls.length + uploadingFiles.length}/20)`);
      return;
    }

    setCompressing(true);

    try {
      for (const file of fileArray) {
        if (!validateFileSize(file, 10)) {
          toast.error(`File "${file.name}" is too large (max 10MB)`);
          continue;
        }

        if (file.type.startsWith('image/')) {
          try {
            const compressed = await compressImage(file, 1280, 720, 0.7);
            const estimatedSize = estimateCompressedSize(file, 0.7);
            
            if (estimatedSize > 2 * 1024 * 1024) {
              toast.error(`File "${file.name}" would still be too large after compression`);
              continue;
            }

            validFiles.push(compressed);
          } catch (err) {
            console.error('Compression error:', err);
            toast.error(`Failed to compress "${file.name}", using original`);
            validFiles.push(file);
          }
        } else {
          validFiles.push(file);
        }
      }

      setUploadingFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} image(s) added`);
    } catch (err) {
      console.error('File processing error:', err);
      toast.error('Error processing files');
    } finally {
      setCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Not authenticated');
        router.push('/auth/admin/login');
        return;
      }

      const form = new FormData();
      form.append('title', data.title);
      form.append('slug', data.slug);
      form.append('shortSummary', data.shortSummary);
      form.append('description', data.description);
      form.append('projectType', data.projectType);
      form.append('isPublished', String(data.isPublished));
      form.append('isFeatured', String(data.isFeatured));
      form.append('coverImage', coverImageUrl || '');
      form.append('existingImages', JSON.stringify(selectedImageUrls || []));
      
      if (data.budgetScope) {
        form.append('budgetMin', String(data.budgetScope.min || 0));
        form.append('budgetMax', String(data.budgetScope.max || 0));
        form.append('currency', data.budgetScope.currency || 'NGN');
      }
      
      if (data.timeline) {
        form.append('timelineStart', data.timeline.startDate || '');
        form.append('timelineEnd', data.timeline.endDate || '');
      }
      
      if (data.features) {
        form.append('features', JSON.stringify(data.features));
      }
      if (data.problemsSolved) {
        form.append('problemsSolved', JSON.stringify(data.problemsSolved));
      }
      if (data.deliverables) {
        form.append('deliverables', JSON.stringify(data.deliverables));
      }
      if (data.hashtags) {
        form.append('hashtags', JSON.stringify(data.hashtags));
      }

      for (const file of uploadingFiles) {
        form.append('files', file);
      }

      const res = await fetch(`/api/projects/by-id/${project._id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
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
          value={(data.problemsSolved || []).join(', ')}
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

      <div>
        <label className="block text-sm font-medium mb-2">
          Current Project Images ({selectedImageUrls.length}/20)
        </label>
        <div className="flex flex-wrap gap-3">
          {selectedImageUrls.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No images selected.</p>
          ) : (
            selectedImageUrls.map((url, idx) => (
              <div
                key={idx}
                className={`relative border rounded-lg p-1.5 cursor-pointer transition-all ${
                  coverImageUrl === url ? 'ring-2 ring-primary border-primary' : 'border-border'
                }`}
                onClick={() => setCoverImageUrl(url)}
              >
                <img
                  src={url}
                  alt={`project image ${idx + 1}`}
                  className="w-28 h-24 object-cover rounded-md"
                  draggable={false}
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeExistingImage(url); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
                {coverImageUrl === url && (
                  <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-1.5 py-0.5 rounded">
                    Cover
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Add more images from library ({selectedImageUrls.length}/20)
        </label>
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" style={{ scrollSnapType: 'x mandatory' }}>
          {availableImages.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No images available in library.</p>
          ) : (
            availableImages
              .filter(img => !selectedImageUrls.includes(img.url))
              .map(img => (
                <div
                  key={img._id}
                  className="flex-shrink-0 border rounded-lg p-1.5 cursor-pointer transition-all hover:border-primary border-border"
                  style={{ scrollSnapAlign: 'start' }}
                  onClick={() => toggleSelectImage(img.url)}
                >
                  <img
                    src={img.url}
                    alt={img.fileName || 'image'}
                    className="w-28 h-24 object-cover rounded-md"
                    draggable={false}
                  />
                  <p className="text-[10px] text-muted-foreground truncate mt-1 max-w-28">{img.fileName || 'image'}</p>
                </div>
              ))
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Or upload new images ({uploadingFiles.length}/20)
        </label>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={e => {
              handleFileSelect(e.target.files);
              e.target.value = '';
            }}
            className="hidden"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={compressing}
              className="px-4 py-2 bg-card border rounded flex items-center gap-2 disabled:opacity-50"
            >
              {compressing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {compressing ? 'Compressing...' : 'Choose files'}
            </button>
            {uploadingFiles.length > 0 && <span>{uploadingFiles.length} file(s) selected</span>}
          </div>
        </div>

        {uploadingFiles.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
            {uploadingFiles.map((file, idx) => (
              <div key={idx} className="relative border rounded p-1">
                <img src={previewUrls[idx]} alt={file.name} className="w-full h-20 object-cover rounded" />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs truncate">{file.name}</span>
                  <button type="button" onClick={() => removeUploadingFile(idx)} className="text-sm text-red-600 ml-2">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
