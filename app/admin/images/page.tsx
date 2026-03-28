'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Trash2, Download, Upload } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';

interface Image {
  _id: string;
  url: string;
  fileName: string;
  size: number;
  uploadedAt: string;
  altText?: string;
}

export default function AdminImages() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    checkAuthAndFetchImages();
  }, []);

  const checkAuthAndFetchImages = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/auth/admin/login');
        return;
      }

      const response = await fetch('/api/images', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        router.push('/auth/admin/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch images');

      const data = await response.json();
      setImages(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error fetching images';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const response = await fetch('/api/images', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload images');

      const data = await response.json();
      setImages([...images, ...data.data]);
      toast.success(`${files.length} image(s) uploaded successfully`);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error uploading images';
      toast.error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/images/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete image');

      setImages(images.filter(img => img._id !== imageId));
      setSelectedImages(selectedImages.filter(id => id !== imageId));
      toast.success('Image deleted successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error deleting image';
      toast.error(errorMsg);
    }
  };

  const handleDownloadImage = (imageUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    link.click();
  };

  const toggleSelectImage = (imageId: string) => {
    setSelectedImages(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedImages.length === 0) {
      toast.error('No images selected');
      return;
    }

    if (!confirm(`Delete ${selectedImages.length} image(s)?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      await Promise.all(
        selectedImages.map(id =>
          fetch(`/api/images/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      setImages(images.filter(img => !selectedImages.includes(img._id)));
      setSelectedImages([]);
      toast.success(`${selectedImages.length} image(s) deleted successfully`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error deleting images';
      toast.error(errorMsg);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const totalSize = images.reduce((sum, img) => sum + img.size, 0);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

  return (
    <AdminLayout>
      <div className="w-full max-w-full min-h-screen bg-background p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Manage Images</h1>
          <p className="text-muted-foreground mt-2">Upload and manage portfolio project images</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Total Images</p>
            <p className="text-2xl font-bold">{images.length}</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Total Size</p>
            <p className="text-2xl font-bold">{totalSizeMB} MB</p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Selected</p>
            <p className="text-2xl font-bold">{selectedImages.length}</p>
          </div>
        </div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 border-2 border-dashed rounded-lg cursor-pointer transition ${
              dragActive
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary hover:bg-primary/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={e => handleFileSelect(e.target.files)}
              disabled={uploading}
              className="hidden"
            />

            <div className="text-center">
              <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {uploading ? 'Uploading...' : 'Drag images here or click to select'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Supports JPG, PNG, WebP and other image formats
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bulk Actions */}
        {selectedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-primary/10 border border-primary rounded-lg flex justify-between items-center"
          >
            <p className="text-sm font-medium">
              {selectedImages.length} image(s) selected
            </p>
            <button
              onClick={handleDeleteSelected}
              className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition"
            >
              Delete Selected
            </button>
          </motion.div>
        )}

        {/* Images Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
            {error}
          </div>
        ) : images.length === 0 ? (
          <div className="p-8 bg-card border border-border rounded-lg text-center text-muted-foreground">
            No images uploaded yet. Upload your first image to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <motion.div
                key={image._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative rounded-lg overflow-hidden border-2 transition cursor-pointer group ${
                  selectedImages.includes(image._id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary'
                }`}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedImages.includes(image._id)}
                  onChange={() => toggleSelectImage(image._id)}
                  className="absolute top-2 left-2 z-10 w-5 h-5 cursor-pointer"
                />

                {/* Image */}
                <div className="relative w-full aspect-video bg-muted overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.altText || image.fileName}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDownloadImage(image.url, image.fileName)}
                      className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-orange-700 transition"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteImage(image._id)}
                      className="p-2 bg-destructive text-white rounded-lg hover:bg-red-700 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 bg-card">
                  <p className="text-sm font-medium truncate">{image.fileName}</p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                    <span>{(image.size / 1024).toFixed(1)} KB</span>
                    <span>{new Date(image.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}
