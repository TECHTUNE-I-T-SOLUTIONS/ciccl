"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import { PROJECT_TYPES } from '@/lib/constants/projectTypes';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0000-\u007F\w\-]/g, '')
    .replace(/\-+/g, '-');
}

export default function NewProjectForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [shortSummary, setShortSummary] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('');

  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [currency, setCurrency] = useState('NGN');

  const [timelineStart, setTimelineStart] = useState('');
  const [timelineEnd, setTimelineEnd] = useState('');

  const [featuresInput, setFeaturesInput] = useState('');
  const [problemsInput, setProblemsInput] = useState('');
  const [deliverablesInput, setDeliverablesInput] = useState('');
  const [hashtagsInput, setHashtagsInput] = useState('');

  const [availableImages, setAvailableImages] = useState<any[]>([]);
  const [selectedImageUrls, setSelectedImageUrls] = useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  useEffect(() => {
    const t = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      try {
        const res = await fetch('/api/images', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setAvailableImages(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        // ignore
      }
    };
    t();
  }, []);

  const toggleSelectImage = (url: string) => {
    setSelectedImageUrls(prev => (prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]));
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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Not authenticated');
        router.push('/auth/admin/login');
        return;
      }

      if (!title || !shortSummary || !description || !projectType) {
        toast.error('Please fill required fields');
        return;
      }

      const form = new FormData();
      form.append('title', title);
      form.append('slug', slug || slugify(title));
      form.append('shortSummary', shortSummary);
      form.append('description', description);
      form.append('projectType', projectType);
      form.append('budgetMin', budgetMin || '0');
      form.append('budgetMax', budgetMax || '0');
      form.append('currency', currency || 'NGN');
      form.append('timelineStart', timelineStart || '');
      form.append('timelineEnd', timelineEnd || '');

      const features = featuresInput ? featuresInput.split(',').map(s => s.trim()).filter(Boolean) : [];
      const problems = problemsInput ? problemsInput.split(',').map(s => s.trim()).filter(Boolean) : [];
      const deliverables = deliverablesInput ? deliverablesInput.split(',').map(s => s.trim()).filter(Boolean) : [];
      const hashtags = hashtagsInput ? hashtagsInput.split(',').map(s => s.trim().replace(/#/g, '')).filter(Boolean) : [];

      form.append('features', JSON.stringify(features));
      form.append('problemsSolved', JSON.stringify(problems));
      form.append('deliverables', JSON.stringify(deliverables));
      form.append('hashtags', JSON.stringify(hashtags));

      form.append('existingImages', JSON.stringify(selectedImageUrls || []));
      form.append('coverImage', coverImageUrl || '');

      for (const file of uploadingFiles) form.append('files', file);

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to create project');
      }

      toast.success('Project created');
      router.push('/admin/projects');
    } catch (err: any) {
      toast.error(err?.message || 'Error creating project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Create Project</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input title="Project Title" placeholder="Project Title" value={title} onChange={e => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug (optional)</label>
            <input title="Project Slug" placeholder="Project Slug" value={slug} onChange={e => { setSlug(e.target.value); setSlugTouched(true); }} className="w-full px-3 py-2 border rounded" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Short Summary</label>
          <input title="Short Summary" placeholder="Short summary" value={shortSummary} onChange={e => setShortSummary(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea title="Description" placeholder="Project description" value={description} onChange={e => setDescription(e.target.value)} rows={6} className="w-full px-3 py-2 border rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Type</label>
            <select title="Project Type" value={projectType} onChange={e => setProjectType(e.target.value)} className="w-full px-3 py-2 border rounded">
              <option value="">Select type</option>
              {PROJECT_TYPES.map(pt => (
                <option key={pt} value={pt}>{pt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Budget Min</label>
            <input title="Budget Min" type="number" value={budgetMin} onChange={e => setBudgetMin(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Budget Max</label>
            <input title="Budget Max" type="number" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Timeline Start</label>
            <input title="Timeline Start" type="date" value={timelineStart} onChange={e => setTimelineStart(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Timeline End</label>
            <input title="Timeline End" type="date" value={timelineEnd} onChange={e => setTimelineEnd(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Features (comma separated)</label>
          <input title="Features" placeholder="e.g. Cost control, scheduling" value={featuresInput} onChange={e => setFeaturesInput(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Problems Solved (comma separated)</label>
          <input title="Problems Solved" placeholder="e.g. Reduced procurement delays" value={problemsInput} onChange={e => setProblemsInput(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Deliverables (comma separated)</label>
          <input title="Deliverables" placeholder="e.g. Bill of quantities" value={deliverablesInput} onChange={e => setDeliverablesInput(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Hashtags (comma separated)</label>
          <input title="Hashtags" placeholder="#quantitysurvey,#costcontrol" value={hashtagsInput} onChange={e => setHashtagsInput(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Select existing images</label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {availableImages.map(img => (
              <div key={img._id} className={`border rounded p-1 cursor-pointer ${selectedImageUrls.includes(img.url) ? 'ring-2 ring-primary' : ''}`} onClick={() => toggleSelectImage(img.url)}>
                <img src={img.url} alt={img.fileName || 'image'} className="w-full h-20 object-cover rounded" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Or upload new images</label>
          <div className="flex items-center gap-2">
            <input title="Upload Images" ref={fileInputRef} type="file" multiple accept="image/*" onChange={e => {
              const files = Array.from(e.target.files || []);
              setUploadingFiles(prev => [...prev, ...files]);
            }} className="hidden" />
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-card border rounded flex items-center gap-2">
                <Upload className="w-4 h-4" /> Choose files
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
                    <button type="button" onClick={() => removeUploadingFile(idx)} className="text-sm text-red-600 ml-2">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Project'}
          </button>
          <button type="button" onClick={() => router.push('/admin/projects')} className="px-4 py-2 border rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
}
