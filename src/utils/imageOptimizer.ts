/**
 * Client-side image optimization utility.
 * Compresses uploaded images using HTML5 Canvas to prevent exceeding browser localStorage quota (5MB).
 * Downscales dimensions and applies JPEG compression to keep images sharp yet lightweight (~40KB - 150KB).
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
}

export async function compressImageFile(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 1400,
    maxHeight = 900,
    quality = 0.82,
    mimeType = 'image/jpeg'
  } = options;

  // If already SVG or tiny file, we don't need canvas downscaling
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        URL.revokeObjectURL(objectUrl);

        let { naturalWidth: width, naturalHeight: height } = img;

        if (width <= 0 || height <= 0) {
          width = 1200;
          height = 800;
        }

        // Calculate proportional scale
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to standard data URL
          const fallbackReader = new FileReader();
          fallbackReader.onload = (e) => resolve(e.target?.result as string);
          fallbackReader.onerror = reject;
          fallbackReader.readAsDataURL(file);
          return;
        }

        // Use high-quality bicubic image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw white background in case source had alpha when converting to jpeg
        if (mimeType === 'image/jpeg') {
          ctx.fillStyle = '#1c1917'; // luxury dark neutral
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        const targetMime = file.type === 'image/png' && file.size < 500 * 1024 ? 'image/png' : mimeType;
        const compressedDataUrl = canvas.toDataURL(targetMime, quality);

        resolve(compressedDataUrl);
      } catch (err) {
        // Fallback to FileReader if canvas conversion fails
        const fallbackReader = new FileReader();
        fallbackReader.onload = (e) => resolve(e.target?.result as string);
        fallbackReader.onerror = reject;
        fallbackReader.readAsDataURL(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback
      const fallbackReader = new FileReader();
      fallbackReader.onload = (e) => resolve(e.target?.result as string);
      fallbackReader.onerror = reject;
      fallbackReader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}
