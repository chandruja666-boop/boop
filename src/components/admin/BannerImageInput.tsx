import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Eye,
  Link2,
  Maximize2,
  Copy,
  Check
} from 'lucide-react';
import { compressImageFile } from '../../utils/imageOptimizer';

export interface BannerPreset {
  name: string;
  url: string;
  tag?: string;
}

export interface BannerImageInputProps {
  value: string;
  onChange: (imageUrl: string) => void;
  label?: string;
  required?: boolean;
  recommendedDimensions?: string; // e.g., "1200 × 800 pixels for landscape showcase banners / 800 × 800 pixels for square cards"
  aspectRatioHint?: string; // e.g., "16:9 Landscape" | "3:2 Showcase" | "1:1 Square"
  aspectRatioClass?: string; // e.g., "aspect-[16/9]" | "aspect-[3/2]" | "aspect-[16/10]" | "aspect-square"
  presets?: BannerPreset[];
  helperNotes?: string;
  idPrefix?: string;
}

export const BannerImageInput: React.FC<BannerImageInputProps> = ({
  value,
  onChange,
  label = 'Banner / Showcase Image',
  required = false,
  recommendedDimensions = '1200 × 800 pixels for landscape showcase banners / 800 × 800 pixels for square cards',
  aspectRatioHint = 'Landscape Showcase (3:2 or 16:9)',
  aspectRatioClass = 'aspect-[16/10]',
  presets,
  helperNotes,
  idPrefix = 'banner-img'
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'url'>(
    value?.startsWith('data:image/') ? 'upload' : 'url'
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(value || '');
  const [detectedDimensions, setDetectedDimensions] = useState<{ width: number; height: number } | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync internal url state if parent value updates externally
  useEffect(() => {
    setUrlInput(value || '');
    setImageLoadError(false);
  }, [value]);

  // Load natural dimensions when image changes
  useEffect(() => {
    if (!value) {
      setDetectedDimensions(null);
      setImageLoadError(false);
      return;
    }

    const img = new Image();
    img.src = value;
    img.onload = () => {
      setDetectedDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setImageLoadError(false);
    };
    img.onerror = () => {
      setDetectedDimensions(null);
      setImageLoadError(true);
    };
  }, [value]);

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    setImageLoadError(false);

    if (!file.type.startsWith('image/')) {
      setErrorMessage(`"${file.name}" is not a valid image file. Please choose a JPG, PNG, WebP, or SVG.`);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('Image file exceeds 15MB size limit. Please choose a suitable photo.');
      return;
    }

    setIsProcessing(true);

    try {
      // Compress and optimize image on client side to guarantee high visual clarity
      // and prevent exceeding browser localStorage quota limits
      const optimizedDataUrl = await compressImageFile(file, {
        maxWidth: 1400,
        maxHeight: 900,
        quality: 0.82
      });

      onChange(optimizedDataUrl);
      setUrlInput(optimizedDataUrl);
      setErrorMessage(null);
    } catch (err) {
      // Reliable fallback: read via FileReader
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          const dataUrl = e.target.result;
          onChange(dataUrl);
          setUrlInput(dataUrl);
          setErrorMessage(null);
        } else {
          setErrorMessage('Failed to process image file from local device.');
        }
      };
      reader.onerror = () => {
        setErrorMessage('An error occurred while reading the file from your computer.');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessing(false);
      // Reset input value so re-uploading the same file still triggers onChange
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (trimmed) {
      onChange(trimmed);
      setErrorMessage(null);
      setImageLoadError(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('data:image/'))) {
          setUrlInput(text.trim());
          onChange(text.trim());
          setErrorMessage(null);
          setImageLoadError(false);
        } else if (text) {
          setUrlInput(text.trim());
        }
      }
    } catch {
      // Clipboard access not available in iframe sandbox
    }
  };

  const handleClearImage = () => {
    onChange('');
    setUrlInput('');
    setDetectedDimensions(null);
    setErrorMessage(null);
    setImageLoadError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isDataUrl = value?.startsWith('data:image/');

  return (
    <div className="space-y-3">
      {/* Header with Label and Interactive Dual Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
          <span>{label}</span>
          {required && <span className="text-rose-500">*</span>}
        </label>

        {/* Working Dual Input Option Switcher */}
        <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-[11px] self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            id={`${idPrefix}-tab-upload`}
            onClick={() => {
              setActiveMode('upload');
              // Directly trigger file dialog on click for immediate user experience
              fileInputRef.current?.click();
            }}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'upload'
                ? 'bg-white text-stone-950 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-amber-700" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            id={`${idPrefix}-tab-url`}
            onClick={() => setActiveMode('url')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'url'
                ? 'bg-white text-stone-950 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Link2 className="w-3.5 h-3.5 text-amber-700" />
            <span>Image URL Link</span>
          </button>
        </div>
      </div>

      {/* BANNER SIZE GUIDELINES HELPER CARD */}
      <div className="p-3 bg-amber-500/10 border border-amber-400/40 rounded-xl text-stone-800 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
            <Maximize2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Recommended Banner Specifications:</span>
          </div>
          {aspectRatioHint && (
            <span className="text-[10px] font-mono font-bold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300/60">
              {aspectRatioHint}
            </span>
          )}
        </div>
        <p className="text-[11px] text-amber-900/90 font-medium leading-relaxed">
          <strong>Recommended:</strong> {recommendedDimensions}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-amber-950/70 pt-0.5 border-t border-amber-400/20">
          <span>Supported: JPG, PNG, WebP, SVG</span>
          <span>&bull;</span>
          <span>Max file size: 15MB</span>
          <span>&bull;</span>
          <span>Auto-Optimized for Instant Storage</span>
          {helperNotes && (
            <>
              <span>&bull;</span>
              <span className="italic">{helperNotes}</span>
            </>
          )}
        </div>
      </div>

      {/* ACTIVE MODE INPUT VIEW: LOCAL FILE UPLOADER OR URL INPUT */}
      <div className="space-y-3">
        {activeMode === 'upload' ? (
          /* LOCAL FILE UPLOADER VIEW */
          <div
            id={`${idPrefix}-dropzone`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-5 sm:p-6 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-amber-600 bg-amber-50/80 scale-[0.99]'
                : 'border-stone-300 hover:border-amber-600 hover:bg-stone-50/80 bg-stone-50/50'
            }`}
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-900 mx-auto flex items-center justify-center mb-2.5 shadow-inner">
              {isProcessing ? (
                <RefreshCw className="w-5 h-5 animate-spin text-amber-700" />
              ) : (
                <UploadCloud className="w-5 h-5 text-amber-800" />
              )}
            </div>
            <p className="text-xs font-bold text-stone-900">
              {isProcessing ? 'Optimizing & reading local image...' : 'Click to Upload or Drag & Drop Banner Image'}
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Select high-resolution JPG, PNG, WebP, or SVG directly from your device
            </p>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-stone-300 rounded-lg text-[11px] font-bold text-stone-800 shadow-2xs hover:bg-stone-100">
              <UploadCloud className="w-3.5 h-3.5 text-amber-700" />
              <span>Browse Device Files</span>
            </div>
          </div>
        ) : (
          /* EXTERNAL URL TEXT INPUT VIEW */
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                Paste Direct Image URL
              </label>
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="text-[10px] text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Paste From Clipboard</span>
              </button>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    if (e.target.value.trim().startsWith('http')) {
                      onChange(e.target.value.trim());
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyUrl();
                    }
                  }}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-2xs font-mono"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-4 py-2 bg-stone-900 hover:bg-amber-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm shrink-0"
              >
                Apply URL
              </button>
            </div>
            <p className="text-[10px] text-stone-500 italic">
              Paste direct image link from Unsplash, Cloudinary, Imgur, or your custom CDN.
            </p>
          </div>
        )}
      </div>

      {/* Hidden File Input for Local Device Upload */}
      <input
        id={`${idPrefix}-file-input`}
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* CURRENT LIVE STOREFRONT PREVIEW (Shown whenever an image value is active) */}
      {value && (
        <div className="space-y-2 pt-1">
          <div className="relative rounded-2xl overflow-hidden border-2 border-stone-200 bg-stone-950 group shadow-sm">
            <div className={`w-full ${aspectRatioClass} overflow-hidden relative flex items-center justify-center`}>
              <img
                src={value}
                alt="Banner Live Preview"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />

              {/* Gradient Scrim for readable badges and controls */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/25 to-black/40 flex flex-col justify-between p-3.5 sm:p-4">
                {/* Top Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-stone-900/90 text-amber-400 border border-amber-400/40 backdrop-blur-sm shadow-xs">
                    {isDataUrl ? (
                      <>
                        <UploadCloud className="w-3 h-3 text-amber-400" />
                        <span>Uploaded Device File</span>
                      </>
                    ) : (
                      <>
                        <Link2 className="w-3 h-3 text-amber-400" />
                        <span>External URL Link</span>
                      </>
                    )}
                  </span>

                  {detectedDimensions && (
                    <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-md bg-stone-900/90 text-stone-200 border border-stone-700 backdrop-blur-sm">
                      {detectedDimensions.width} &times; {detectedDimensions.height} px
                    </span>
                  )}
                </div>

                {/* Bottom Bar: Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                  <div className="text-white">
                    <span className="text-[10px] font-bold text-amber-300 block uppercase tracking-wider">
                      Live Storefront Banner Preview
                    </span>
                    <p className="text-[11px] text-stone-300 truncate max-w-xs font-mono">
                      {isDataUrl ? 'Local Custom Image (Optimized & Ready)' : value}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setShowFullPreview(true)}
                      className="px-2.5 py-1.5 bg-stone-800/90 hover:bg-stone-800 text-stone-200 hover:text-white text-xs font-bold rounded-lg border border-stone-700 transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                      title="Inspect High-Res View"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Inspect</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode('upload');
                        fileInputRef.current?.click();
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg shadow transition-colors cursor-pointer flex items-center gap-1"
                      title="Upload or Replace Local Image"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Replace</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="p-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg shadow transition-colors cursor-pointer"
                      title="Remove Current Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {imageLoadError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Warning: The provided image link could not be loaded. Please verify the URL or upload another file.</span>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Curated Luxury Stock Presets */}
      {presets && presets.length > 0 && (
        <div className="pt-2 border-t border-stone-200/70 space-y-1.5">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>One-Click Curated Luxury Presets:</span>
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presets.map((preset) => {
              const isSelected = value === preset.url;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    onChange(preset.url);
                    setUrlInput(preset.url);
                    setErrorMessage(null);
                    setImageLoadError(false);
                  }}
                  className={`group relative rounded-xl overflow-hidden border-2 transition-all text-left aspect-[16/10] bg-stone-900 cursor-pointer shadow-2xs ${
                    isSelected
                      ? 'border-amber-500 shadow-md ring-2 ring-amber-400/30'
                      : 'border-stone-200 hover:border-amber-500'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent flex items-end justify-between p-1.5">
                    <span className="text-[9px] font-bold text-white leading-tight truncate drop-shadow-sm">
                      {preset.name}
                    </span>
                    {isSelected && (
                      <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* FULL-SIZE IMAGE INSPECT MODAL */}
      {showFullPreview && value && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowFullPreview(false)}
        >
          <div
            className="bg-stone-900 border border-stone-800 rounded-3xl max-w-4xl w-full p-4 sm:p-6 overflow-hidden shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 text-white">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm font-serif-luxury text-stone-100">
                  High-Resolution Banner Preview & Spec Verification
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFullPreview(false)}
                className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Close (ESC)
              </button>
            </div>

            <div className="max-h-[65vh] overflow-auto rounded-2xl bg-stone-950 flex items-center justify-center p-2">
              <img
                src={value}
                alt="Full resolution banner preview"
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-lg"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400 pt-2 border-t border-stone-800">
              <div>
                <span>Source: </span>
                <strong className="text-stone-200">
                  {isDataUrl ? 'Direct Local File (Base64)' : 'External Web URL'}
                </strong>
                {detectedDimensions && (
                  <span className="ml-2 font-mono text-amber-400">
                    &bull; {detectedDimensions.width} &times; {detectedDimensions.height} px
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowFullPreview(false);
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Replace with Another File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
