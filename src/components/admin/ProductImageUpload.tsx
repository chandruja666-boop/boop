import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Star,
  Plus,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  MoveUp,
  MoveDown
} from 'lucide-react';
import { compressImageFile } from '../../utils/imageOptimizer';

interface ProductImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
  images,
  onChange,
  maxImages = 4
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Curated Luxury Furniture Stock Presets for 1-Click Testing
  const SAMPLE_PRESETS = [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80'
  ];

  const handleFiles = (files: FileList | File[]) => {
    setErrorMessage(null);
    const fileArray = Array.from(files);

    if (fileArray.length === 0) return;

    // Check available slots
    const availableSlots = maxImages - images.length;
    if (availableSlots <= 0) {
      setErrorMessage(`Maximum limit of ${maxImages} images reached. Remove an image to upload another.`);
      return;
    }

    const filesToProcess = fileArray.slice(0, availableSlots);
    if (fileArray.length > availableSlots) {
      setErrorMessage(`Only ${availableSlots} more image(s) could be added (max ${maxImages}).`);
    }

    setIsProcessing(true);

    const processors = filesToProcess.map(async (file) => {
      if (!file.type.startsWith('image/')) {
        throw new Error(`"${file.name}" is not a valid image file.`);
      }
      return compressImageFile(file, { maxWidth: 1000, maxHeight: 1000, quality: 0.8 });
    });

    Promise.allSettled(processors)
      .then((results) => {
        const newImages: string[] = [];
        results.forEach((res) => {
          if (res.status === 'fulfilled') {
            newImages.push(res.value);
          } else {
            setErrorMessage((current) => current || 'One or more images could not be processed. Please try a smaller JPG, PNG, or WebP file.');
          }
        });

        if (newImages.length > 0) {
          const updated = [...images, ...newImages].slice(0, maxImages);
          onChange(updated);
        }
        setIsProcessing(false);
      })
      .catch(() => {
        setErrorMessage('Failed to process one or more images.');
        setIsProcessing(false);
      });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      // Reset input value so same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
    setErrorMessage(null);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const selected = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([selected, ...rest]);
  };

  const handleLoadSamplePresets = () => {
    onChange(SAMPLE_PRESETS.slice(0, maxImages));
    setErrorMessage(null);
  };

  const handleClearAll = () => {
    onChange([]);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-3 sm:col-span-2">
      {/* Header and counter */}
      <div className="flex items-center justify-between">
        <div>
          <label className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
            <span>Product Images (Upload 3-4 high-quality images)</span>
            <span className="text-amber-800 text-[11px]">*</span>
          </label>
          <p className="text-[11px] text-stone-600 mt-0.5 font-medium">
            Select or drag up to {maxImages} high-resolution photos. The first image serves as the main catalog cover.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {images.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
            >
              Clear all
            </button>
          )}
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${images.length >= 3
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-400'
                : images.length > 0
                  ? 'bg-amber-100 text-amber-950 border border-amber-400'
                  : 'bg-stone-200 text-stone-800 border border-stone-300'
              }`}
          >
            {images.length} / {maxImages} Images
          </span>
        </div>
      </div>

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        id="product-image-file-input"
        type="file"
        multiple
        accept="image/png,image/jpeg,image/jpg,image/webp,image/avif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Grid of Existing Image Thumbnails + Dropzone Tile */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {images.map((imgUrl, index) => (
          <div
            key={index}
            className={`relative group rounded-2xl overflow-hidden border-2 transition-all bg-stone-950 aspect-square shadow-md ${index === 0
                ? 'border-amber-500 ring-2 ring-amber-500/20'
                : 'border-stone-800 hover:border-amber-400/60'
              }`}
          >
            <img
              src={imgUrl}
              alt={`Product preview ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />

            {/* Dark gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

            {/* Badge: Primary Cover / Photo Number */}
            <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
              {index === 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 text-[9px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-current" /> Cover
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-md bg-stone-900/80 text-stone-300 text-[10px] font-mono border border-stone-700">
                  #{index + 1}
                </span>
              )}
            </div>

            {/* Quick Actions: Remove & Set Primary */}
            <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                title="Remove this photo"
                className="w-6 h-6 rounded-full bg-stone-900/90 hover:bg-rose-600 text-stone-300 hover:text-white flex items-center justify-center transition-colors border border-stone-700 shadow cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Bottom bar for non-primary images */}
            {index !== 0 && (
              <div className="absolute bottom-2 left-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => handleSetPrimary(index)}
                  className="w-full py-1 px-1.5 bg-amber-500/90 hover:bg-amber-400 text-stone-950 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 shadow"
                >
                  <Star className="w-2.5 h-2.5" />
                  <span>Set as Main Cover</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Upload Dropzone Tile (if under maxImages) */}
        {images.length < maxImages && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed transition-all aspect-square flex flex-col items-center justify-center p-3 text-center cursor-pointer group ${isDragging
                ? 'border-amber-400 bg-amber-950/40 scale-[1.02] shadow-lg shadow-amber-900/20'
                : 'border-stone-400 hover:border-amber-600 bg-stone-50 hover:bg-amber-50/50 text-stone-600 hover:text-stone-900'
              }`}
          >
            <div className="w-10 h-10 rounded-xl bg-stone-200 group-hover:bg-amber-100 text-stone-700 group-hover:text-amber-900 flex items-center justify-center mb-1.5 transition-colors shadow-sm">
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <UploadCloud className="w-5 h-5 group-hover:scale-110 transition-transform" />
              )}
            </div>

            <p className="text-xs font-bold text-stone-900">
              {isProcessing ? 'Processing files...' : isDragging ? 'Drop Photos Here' : 'Click to Upload'}
            </p>
            <p className="text-[11px] text-stone-600 mt-0.5 font-medium">or drag & drop</p>
            <span className="mt-1 text-[10px] text-amber-950 font-bold bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-md">
              +{maxImages - images.length} remaining
            </span>
          </div>
        )}
      </div>

      {/* Error / Warning Alert */}
      {errorMessage && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Helper Bar: Curated Studio Stock Presets */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5 text-[11px] text-stone-600 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>Images are converted to base64 Data URLs & stored locally</span>
        </div>

        <button
          type="button"
          onClick={handleLoadSamplePresets}
          className="text-xs text-amber-950 hover:text-black font-bold bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl border border-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>Load 4 Curated Studio Photos</span>
        </button>
      </div>
    </div>
  );
};
