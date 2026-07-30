/**
 * Compress an image file using Canvas API
 * @param file - The image file to compress
 * @param maxWidth - Maximum width of the compressed image (default: 1280)
 * @param maxHeight - Maximum height of the compressed image (default: 720)
 * @param quality - JPEG quality (0-1, default: 0.7)
 * @returns Promise<File> - Compressed image file
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1280,
  maxHeight: number = 720,
  quality: number = 0.7
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          // Create new File from blob
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validate file size before compression
 * @param file - The file to validate
 * @param maxSizeMB - Maximum size in MB (default: 15)
 * @returns boolean - Whether the file is within size limits
 */
export function validateFileSize(file: File, maxSizeMB: number = 15): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Get estimated compressed size (rough estimate)
 * @param file - Original file
 * @param quality - Compression quality
 * @returns Estimated size in bytes
 */
export function estimateCompressedSize(file: File, quality: number = 0.7): number {
  // Rough estimate: original size * quality * 0.5 (more aggressive dimension reduction)
  return Math.floor(file.size * quality * 0.5);
}
