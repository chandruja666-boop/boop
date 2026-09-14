import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Ruler,
  Layers,
  Sparkles,
  ShoppingBag,
  Check,
  Download,
  Info,
  Sliders,
  Sun,
  Palette,
  Grid,
  Move,
  Eye,
  User,
  Square,
  Compass,
  ArrowRight,
  ShieldCheck,
  Camera
} from 'lucide-react';
import { Product, ProductColor } from '../../types';
import { useApp } from '../../context/AppContext';

interface ARPreviewModalProps {
  product: Product;
  selectedColor: string;
  onColorChange: (colorName: string) => void;
  onClose: () => void;
  onAddToCart: () => void;
}

type RoomPreset = 'living' | 'bedroom' | 'dining' | 'office' | 'studio' | 'custom';
type ViewMode = 'perspective' | 'blueprint' | 'camera_sim';
type LightingMode = 'natural' | 'warm' | 'evening';

export const ARPreviewModal: React.FC<ARPreviewModalProps> = ({
  product,
  selectedColor,
  onColorChange,
  onClose,
  onAddToCart,
}) => {
  const { showToast } = useApp();

  // Visualizer States
  const [viewMode, setViewMode] = useState<ViewMode>('perspective');
  const [roomPreset, setRoomPreset] = useState<RoomPreset>('living');
  const [lighting, setLighting] = useState<LightingMode>('natural');
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showRuler, setShowRuler] = useState<boolean>(true);
  const [showHumanRef, setShowHumanRef] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [wallColor, setWallColor] = useState<string>('#EAE6DF');
  const [floorType, setFloorType] = useState<'oak' | 'teak' | 'marble' | 'concrete'>('oak');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<'room' | 'controls' | 'dimensions'>('room');
  const [cameraScanning, setCameraScanning] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Selected image based on color or default
  const currentColorObj = product.colors.find((c) => c.name === selectedColor);
  const displayImage = currentColorObj?.image || product.images[0];

  // Calculate real footprint in sq ft and sq meters
  const lengthInMeters = product.dimensions.unit === 'cm'
    ? product.dimensions.length / 100
    : (product.dimensions.length * 2.54) / 100;
  const widthInMeters = product.dimensions.unit === 'cm'
    ? product.dimensions.width / 100
    : (product.dimensions.width * 2.54) / 100;
  const heightInMeters = product.dimensions.unit === 'cm'
    ? product.dimensions.height / 100
    : (product.dimensions.height * 2.54) / 100;

  const areaSqMeters = (lengthInMeters * widthInMeters).toFixed(2);
  const areaSqFeet = ((lengthInMeters * 3.28084) * (widthInMeters * 3.28084)).toFixed(1);

  // Drag handlers for repositioning furniture
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Reset to original calibrated scale & position
  const handleResetCalibration = () => {
    setScale(1.0);
    setRotation(0);
    setIsFlipped(false);
    setPosition({ x: 0, y: 0 });
    showToast('Calibrated to True 1:1 Scale & Centered Position', 'info');
  };

  // Simulate snapshot export
  const handleSaveSnapshot = () => {
    showToast('Room AR composition snapshot saved to your gallery!', 'success');
  };

  // Camera AR Scan simulation trigger
  const handleToggleCameraAR = () => {
    setViewMode('camera_sim');
    setCameraScanning(true);
    setTimeout(() => {
      setCameraScanning(false);
      showToast('Surface detected! Furniture anchored to floor plane.', 'success');
    }, 2000);
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Room background styling classes
  const getRoomBackgroundStyle = () => {
    if (viewMode === 'camera_sim') {
      return {
        background: 'radial-gradient(circle at 50% 50%, #292524 0%, #1c1917 100%)',
      };
    }
    if (viewMode === 'blueprint') {
      return {
        backgroundColor: '#0F172A',
        backgroundImage: `
          linear-gradient(to right, rgba(56, 189, 248, 0.15) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(56, 189, 248, 0.15) 1px, transparent 1px),
          linear-gradient(to right, rgba(56, 189, 248, 0.05) 5px, transparent 5px),
          linear-gradient(to bottom, rgba(56, 189, 248, 0.05) 5px, transparent 5px)
        `,
        backgroundSize: '40px 40px, 40px 40px, 8px 8px, 8px 8px',
      };
    }

    if (roomPreset === 'custom') {
      return {
        backgroundColor: wallColor,
      };
    }

    return {};
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        ref={containerRef}
        className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-6xl h-[94vh] max-h-[920px] flex flex-col overflow-hidden shadow-2xl relative text-stone-100"
      >
        {/* Top Header Bar */}
        <header className="px-4 sm:px-6 py-3.5 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between gap-4 z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white font-serif-luxury tracking-wide">
                  AR Room Fit & Scale Visualizer
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-700/50">
                  Interactive 1:1
                </span>
              </div>
              <p className="text-[11px] text-stone-400 truncate max-w-[200px] sm:max-w-md">
                {product.name} &bull; {product.dimensions.length}×{product.dimensions.width}×{product.dimensions.height} {product.dimensions.unit}
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-stone-900/90 p-1 rounded-xl border border-stone-800 text-xs">
            <button
              onClick={() => setViewMode('perspective')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'perspective'
                  ? 'bg-amber-900 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">3D Room View</span>
            </button>
            <button
              onClick={() => setViewMode('blueprint')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'blueprint'
                  ? 'bg-cyan-900 text-cyan-200 shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Floor Blueprint</span>
            </button>
            <button
              onClick={handleToggleCameraAR}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'camera_sim'
                  ? 'bg-emerald-900 text-emerald-200 shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simulated AR</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close AR visualizer"
            className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Main Interactive Stage Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {/* Visual Canvas Area */}
          <div
            className="flex-1 relative overflow-hidden select-none cursor-grab active:cursor-grabbing flex items-center justify-center"
            style={getRoomBackgroundStyle()}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* 1. Perspective Room Backdrop Layers */}
            {viewMode === 'perspective' && (
              <div className="absolute inset-0 pointer-events-none flex flex-col">
                {/* Wall Background */}
                <div
                  className="h-[58%] w-full relative transition-colors duration-500 overflow-hidden"
                  style={{
                    backgroundColor:
                      roomPreset === 'living'
                        ? '#F4F1EA'
                        : roomPreset === 'bedroom'
                        ? '#E8E5DF'
                        : roomPreset === 'dining'
                        ? '#ECE8E1'
                        : roomPreset === 'office'
                        ? '#E2DDD5'
                        : roomPreset === 'studio'
                        ? '#FFFFFF'
                        : wallColor,
                  }}
                >
                  {/* Subtle Wall Crown & Baseboard moulding */}
                  <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-b from-stone-400/20 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 h-4 bg-stone-300/40 border-t border-stone-300/60" />

                  {/* Window Natural Ambient Light Glow */}
                  {lighting === 'natural' && (
                    <div className="absolute top-0 right-1/4 w-96 h-full bg-gradient-to-bl from-white/60 via-white/20 to-transparent transform -skew-x-12 pointer-events-none" />
                  )}
                  {lighting === 'warm' && (
                    <div className="absolute top-0 right-1/3 w-96 h-full bg-gradient-to-bl from-amber-300/30 via-amber-100/10 to-transparent transform -skew-x-6 pointer-events-none" />
                  )}
                  {lighting === 'evening' && (
                    <div className="absolute inset-0 bg-stone-900/30 backdrop-brightness-75 pointer-events-none" />
                  )}

                  {/* Room Decorative Accents per Preset */}
                  {roomPreset === 'living' && (
                    <div className="absolute bottom-4 left-8 flex items-end gap-6 opacity-40">
                      <div className="w-12 h-32 bg-stone-400/30 rounded-t-lg border-t-2 border-stone-400/50" />
                      <div className="w-20 h-44 bg-stone-400/25 rounded-t-xl" />
                      <div className="text-[10px] text-stone-600 font-medium">8ft Living Room Wall</div>
                    </div>
                  )}

                  {roomPreset === 'bedroom' && (
                    <div className="absolute bottom-4 right-12 opacity-40">
                      <div className="w-36 h-28 border-2 border-stone-400/40 rounded-t-lg bg-stone-300/20 flex items-center justify-center text-[10px] text-stone-600">
                        Bed Frame Clearance (200cm)
                      </div>
                    </div>
                  )}

                  {roomPreset === 'office' && (
                    <div className="absolute top-6 left-12 opacity-30 flex gap-2">
                      <div className="w-16 h-40 border border-stone-500 rounded bg-stone-400/20" />
                      <div className="w-16 h-40 border border-stone-500 rounded bg-stone-400/20" />
                    </div>
                  )}
                </div>

                {/* Floor Surface */}
                <div
                  className="h-[42%] w-full relative transition-all duration-500 overflow-hidden"
                  style={{
                    backgroundColor:
                      floorType === 'oak'
                        ? '#C29B64'
                        : floorType === 'teak'
                        ? '#8B5A2B'
                        : floorType === 'marble'
                        ? '#D9D9D6'
                        : '#9E9E9E',
                    backgroundImage:
                      floorType === 'oak' || floorType === 'teak'
                        ? 'repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 2px, transparent 2px, transparent 40px)'
                        : floorType === 'marble'
                        ? 'radial-gradient(circle, rgba(255,255,255,0.4) 10%, transparent 60%)'
                        : 'none',
                  }}
                >
                  {/* Perspective Depth Grid Overlay */}
                  {showGrid && (
                    <div
                      className="absolute inset-0 opacity-25 pointer-events-none"
                      style={{
                        backgroundImage: `
                          linear-gradient(to right, rgba(0,0,0,0.3) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(0,0,0,0.3) 1px, transparent 1px)
                        `,
                        backgroundSize: '48px 24px',
                        transform: 'perspective(400px) rotateX(45deg)',
                        transformOrigin: 'top center',
                      }}
                    />
                  )}

                  {/* Room Ambient Rug Silhouette */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[70%] max-w-lg h-36 rounded-2xl bg-stone-100/40 border border-stone-300/40 shadow-inner flex items-center justify-center">
                    <span className="text-[10px] text-stone-700/60 font-mono">
                      Standard Area Rug: 5×8 ft (150×240 cm)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Simulated Camera AR Mode Overlays */}
            {viewMode === 'camera_sim' && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
                {/* Simulated Camera Tracking Reticle & Dots */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border border-dashed border-emerald-400/40 animate-pulse flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border border-emerald-400/60" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                </div>

                {/* Tracking Dots Grid */}
                <div className="absolute inset-x-12 bottom-12 top-24 grid grid-cols-6 grid-rows-4 gap-12 opacity-30">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                  ))}
                </div>

                {/* Status HUD */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2 bg-stone-900/90 border border-emerald-500/40 px-3 py-1.5 rounded-full text-xs text-emerald-400 font-mono shadow-lg">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{cameraScanning ? 'Scanning floor plane...' : 'AR Plane Locked • 60 FPS'}</span>
                  </div>

                  <div className="bg-stone-900/90 border border-stone-700 px-3 py-1.5 rounded-full text-xs text-stone-300 font-mono">
                    Surface Elevation: 0.00m
                  </div>
                </div>

                <div className="text-center z-10">
                  <span className="text-xs bg-stone-950/80 px-4 py-2 rounded-full border border-stone-800 text-stone-300">
                    💡 Drag to move piece across your room floor &bull; Use scale slider below to match room perspective
                  </span>
                </div>
              </div>
            )}

            {/* 3. Architectural Blueprint Floor Plan View */}
            {viewMode === 'blueprint' && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
                {/* Blueprint Header */}
                <div className="flex items-center justify-between text-xs text-cyan-300 font-mono z-10">
                  <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-cyan-500/30">
                    <Grid className="w-4 h-4 text-cyan-400" />
                    <span>Scale: 1 grid square = 10 cm &bull; Metric Scale 1:10</span>
                  </div>

                  <div className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-cyan-500/30">
                    Room Footprint: <strong>{areaSqMeters} m²</strong> ({areaSqFeet} sq. ft.)
                  </div>
                </div>

                {/* Doorway clearance guide */}
                <div className="absolute top-12 left-12 border-l-2 border-b-2 border-cyan-400/40 w-32 h-32 rounded-bl-full flex items-center justify-center">
                  <span className="text-[10px] text-cyan-400/70 font-mono transform -rotate-45">
                    90cm Standard Door Clearance
                  </span>
                </div>

                {/* Walkway corridor guide */}
                <div className="absolute right-12 inset-y-16 w-24 border-x border-dashed border-cyan-400/30 flex items-center justify-center">
                  <span className="text-[10px] text-cyan-400/50 font-mono transform rotate-90 whitespace-nowrap">
                    75cm Walkway Buffer
                  </span>
                </div>
              </div>
            )}

            {/* Scale Reference Human Silhouette */}
            {showHumanRef && viewMode !== 'blueprint' && (
              <div
                className="absolute pointer-events-none z-10 transition-all duration-300 flex flex-col items-center"
                style={{
                  left: '18%',
                  bottom: '22%',
                  transform: `scale(${scale * 0.95})`,
                }}
              >
                <div className="w-14 h-48 bg-stone-950/70 backdrop-blur-sm rounded-t-full border border-stone-400/40 flex flex-col items-center justify-center p-1 text-center shadow-lg">
                  <User className="w-6 h-6 text-amber-300 mb-1" />
                  <span className="text-[9px] font-bold text-white leading-tight">
                    Avg Adult
                  </span>
                  <span className="text-[8px] font-mono text-stone-300">
                    5'10" (178cm)
                  </span>
                </div>
                <div className="w-16 h-2 rounded-full bg-stone-950/50 blur-[2px] mt-1" />
              </div>
            )}

            {/* Centered Draggable Furniture Object */}
            <div
              className="relative z-20 cursor-move transition-transform ease-out duration-75"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg) scaleX(${isFlipped ? -1 : 1})`,
              }}
            >
              {/* Dynamic Ground Shadow */}
              {viewMode !== 'blueprint' && (
                <div
                  className="absolute -bottom-4 inset-x-6 h-10 rounded-full blur-md transition-all duration-300 pointer-events-none"
                  style={{
                    backgroundColor:
                      lighting === 'natural'
                        ? 'rgba(28, 25, 23, 0.45)'
                        : lighting === 'warm'
                        ? 'rgba(67, 40, 24, 0.5)'
                        : 'rgba(12, 10, 9, 0.65)',
                    transform: `skewX(${lighting === 'natural' ? '-15deg' : '0deg'}) scaleY(0.7)`,
                  }}
                />
              )}

              {/* Product Image Frame */}
              <div className="relative group">
                <img
                  src={displayImage}
                  alt={product.name}
                  className={`max-w-[280px] sm:max-w-[360px] md:max-w-[420px] max-h-[300px] sm:max-h-[360px] object-contain drop-shadow-2xl transition-all duration-200 ${
                    viewMode === 'blueprint'
                      ? 'brightness-0 invert opacity-80 border-2 border-cyan-400/80 p-2 rounded-xl bg-cyan-950/40'
                      : ''
                  }`}
                  draggable={false}
                  referrerPolicy="no-referrer"
                />

                {/* Dimension Overlay Lines / Ruler Mode */}
                {showRuler && (
                  <div
                    className="absolute inset-0 pointer-events-none border-2 border-dashed border-amber-500/80 rounded-xl"
                    style={{ transform: isFlipped ? 'scaleX(-1)' : 'none' }}
                  >
                    {/* Width Top Dimension Tag */}
                    <div className="absolute -top-7 inset-x-0 flex items-center justify-center">
                      <span className="bg-amber-950/95 text-amber-300 border border-amber-500/60 font-mono text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                        ↔ Width / Length: {product.dimensions.length} {product.dimensions.unit}
                      </span>
                    </div>

                    {/* Height Right Dimension Tag */}
                    <div className="absolute -right-8 inset-y-0 flex items-center justify-center">
                      <span className="bg-amber-950/95 text-amber-300 border border-amber-500/60 font-mono text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap transform rotate-90">
                        ↕ Height: {product.dimensions.height} {product.dimensions.unit}
                      </span>
                    </div>

                    {/* Depth Bottom Dimension Tag */}
                    <div className="absolute -bottom-7 inset-x-0 flex items-center justify-center">
                      <span className="bg-amber-950/95 text-amber-300 border border-amber-500/60 font-mono text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                        ⤢ Depth: {product.dimensions.width} {product.dimensions.unit}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Floating Navigation Hint Overlay */}
            <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2 bg-stone-950/80 backdrop-blur-md border border-stone-800 text-stone-300 text-[11px] px-3 py-1.5 rounded-xl">
              <Move className="w-3.5 h-3.5 text-amber-400" />
              <span>Click & drag to reposition piece anywhere in room</span>
            </div>

            {/* Snapshot Quick Action */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <button
                onClick={handleSaveSnapshot}
                className="px-3 py-1.5 bg-stone-950/80 hover:bg-stone-900 border border-stone-700 hover:border-amber-500 text-stone-200 hover:text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
                title="Save this room mockup"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save Mockup</span>
              </button>
            </div>
          </div>

          {/* Right Controls & Customization Sidebar */}
          <aside className="w-full lg:w-80 bg-stone-950 border-t lg:border-t-0 lg:border-l border-stone-800 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto space-y-4">
            {/* Sidebar Tabs */}
            <div className="flex border-b border-stone-800 pb-2 gap-1 text-xs">
              <button
                onClick={() => setActiveTab('room')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'room'
                    ? 'bg-amber-900 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Room Style</span>
              </button>
              <button
                onClick={() => setActiveTab('controls')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'controls'
                    ? 'bg-amber-900 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Transform</span>
              </button>
              <button
                onClick={() => setActiveTab('dimensions')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'dimensions'
                    ? 'bg-amber-900 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Fit Specs</span>
              </button>
            </div>

            {/* TAB 1: ROOM PRESETS & LIGHTING */}
            {activeTab === 'room' && (
              <div className="space-y-4 text-xs">
                {/* Room Preset Grid */}
                <div className="space-y-2">
                  <span className="font-bold text-stone-300 uppercase tracking-wider text-[10px] block">
                    Select Generic Room Type
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'living', label: 'Living Room', icon: '🛋️' },
                      { id: 'bedroom', label: 'Master Bedroom', icon: '🛏️' },
                      { id: 'dining', label: 'Dining Area', icon: '🍷' },
                      { id: 'office', label: 'Home Office', icon: '💼' },
                      { id: 'studio', label: 'Loft / Studio', icon: '🏙️' },
                      { id: 'custom', label: 'Custom Palette', icon: '🎨' },
                    ].map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setRoomPreset(r.id as RoomPreset)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                          roomPreset === r.id
                            ? 'border-amber-500 bg-amber-950/40 text-amber-200 font-bold'
                            : 'border-stone-800 bg-stone-900/60 text-stone-300 hover:border-stone-700'
                        }`}
                      >
                        <span className="text-base">{r.icon}</span>
                        <span className="truncate">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Wall Color Picker (when custom is selected) */}
                {roomPreset === 'custom' && (
                  <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-2">
                    <span className="text-[11px] font-bold text-stone-300 block">Wall Paint Tone</span>
                    <div className="flex items-center gap-2">
                      {[
                        { color: '#EAE6DF', name: 'Warm Cream' },
                        { color: '#D6C7B2', name: 'Almond Beige' },
                        { color: '#A3B18A', name: 'Sage Olive' },
                        { color: '#C68B59', name: 'Terracotta' },
                        { color: '#4A5568', name: 'Slate Gray' },
                        { color: '#1E293B', name: 'Midnight' },
                      ].map((w) => (
                        <button
                          key={w.color}
                          onClick={() => setWallColor(w.color)}
                          className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                            wallColor === w.color ? 'border-amber-400 scale-110 shadow' : 'border-stone-600'
                          }`}
                          style={{ backgroundColor: w.color }}
                          title={w.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Floor Finish Selector */}
                <div className="space-y-2">
                  <span className="font-bold text-stone-300 uppercase tracking-wider text-[10px] block">
                    Flooring Material
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'oak', label: 'Light Oak Plank' },
                      { id: 'teak', label: 'Rich Teak Parquet' },
                      { id: 'marble', label: 'Polished Marble' },
                      { id: 'concrete', label: 'Microcement Gray' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFloorType(f.id as any)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer text-[11px] ${
                          floorType === f.id
                            ? 'border-amber-500 bg-amber-950/40 text-amber-200 font-bold'
                            : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lighting Atmosphere Mode */}
                <div className="space-y-2">
                  <span className="font-bold text-stone-300 uppercase tracking-wider text-[10px] block flex items-center gap-1.5">
                    <Sun className="w-3 h-3 text-amber-400" />
                    Ambient Lighting Simulation
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'natural', label: 'Daylight' },
                      { id: 'warm', label: 'Warm Glow' },
                      { id: 'evening', label: 'Dusk Accent' },
                    ].map((l) => (
                      <button
                        key={l.id}
                        onClick={() => setLighting(l.id as LightingMode)}
                        className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer text-[11px] ${
                          lighting === l.id
                            ? 'border-amber-500 bg-amber-950/40 text-amber-200 font-bold'
                            : 'border-stone-800 bg-stone-900 text-stone-400'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Color Switcher */}
                {product.colors && product.colors.length > 0 && (
                  <div className="pt-2 border-t border-stone-800 space-y-2">
                    <span className="font-bold text-stone-300 uppercase tracking-wider text-[10px] block">
                      Furniture Finish / Fabric
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => onColorChange(c.name)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] transition-all cursor-pointer ${
                            selectedColor === c.name
                              ? 'border-amber-400 bg-amber-950/40 text-amber-200 font-bold shadow-sm'
                              : 'border-stone-800 bg-stone-900 text-stone-300 hover:border-stone-700'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-stone-500 flex-shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: TRANSFORM & SCALE CONTROLS */}
            {activeTab === 'controls' && (
              <div className="space-y-4 text-xs">
                {/* Scale Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-stone-300">Room Depth Scale:</span>
                    <span className="font-mono text-amber-400 font-bold">{(scale * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[10px] text-stone-500">
                    <span>Far (50%)</span>
                    <span>True 1:1 Scale</span>
                    <span>Close-up (150%)</span>
                  </div>
                </div>

                {/* Rotation Wheel / Angle Buttons */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-stone-300">Rotate Angle:</span>
                    <span className="font-mono text-amber-400 font-bold">{rotation}°</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 90, 180, 270].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => setRotation(deg)}
                        className={`py-1.5 rounded-lg border text-center font-mono text-[11px] transition-colors cursor-pointer ${
                          rotation === deg
                            ? 'border-amber-500 bg-amber-950/40 text-amber-200 font-bold'
                            : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setRotation((prev) => (prev - 15 + 360) % 360)}
                      className="flex-1 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-lg text-stone-300 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>-15°</span>
                    </button>
                    <button
                      onClick={() => setRotation((prev) => (prev + 15) % 360)}
                      className="flex-1 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-lg text-stone-300 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>+15°</span>
                    </button>
                  </div>
                </div>

                {/* Flip & Alignment Toggles */}
                <div className="space-y-2 pt-2 border-t border-stone-800">
                  <span className="font-bold text-stone-300 uppercase tracking-wider text-[10px] block">
                    Perspective Guides & Toggles
                  </span>
                  <div className="space-y-1.5">
                    <label className="flex items-center justify-between p-2 rounded-xl bg-stone-900/70 border border-stone-800 cursor-pointer">
                      <span className="text-stone-300">Dimension Ruler Overlays</span>
                      <input
                        type="checkbox"
                        checked={showRuler}
                        onChange={(e) => setShowRuler(e.target.checked)}
                        className="accent-amber-500 rounded cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-stone-900/70 border border-stone-800 cursor-pointer">
                      <span className="text-stone-300">Human Scale Silhouette (5'10")</span>
                      <input
                        type="checkbox"
                        checked={showHumanRef}
                        onChange={(e) => setShowHumanRef(e.target.checked)}
                        className="accent-amber-500 rounded cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2 rounded-xl bg-stone-900/70 border border-stone-800 cursor-pointer">
                      <span className="text-stone-300">Perspective Floor Grid</span>
                      <input
                        type="checkbox"
                        checked={showGrid}
                        onChange={(e) => setShowGrid(e.target.checked)}
                        className="accent-amber-500 rounded cursor-pointer"
                      />
                    </label>

                    <button
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="w-full py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-300 text-xs font-semibold cursor-pointer text-center"
                    >
                      {isFlipped ? 'Reset Horizontal Orientation' : 'Flip Mirror Orientation'}
                    </button>
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  onClick={handleResetCalibration}
                  className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Reset Calibration (True 1:1)</span>
                </button>
              </div>
            )}

            {/* TAB 3: FIT & ROOM DIMENSIONS AUDIT */}
            {activeTab === 'dimensions' && (
              <div className="space-y-3.5 text-xs">
                <div className="p-3.5 bg-stone-900/80 rounded-2xl border border-stone-800 space-y-2.5">
                  <span className="font-bold text-amber-400 block text-xs uppercase tracking-wide">
                    Exact Physical Dimensions
                  </span>
                  <div className="space-y-1 text-stone-300">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Width / Length:</span>
                      <strong className="text-white font-mono">{product.dimensions.length} {product.dimensions.unit}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Depth / Breadth:</span>
                      <strong className="text-white font-mono">{product.dimensions.width} {product.dimensions.unit}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Total Height:</span>
                      <strong className="text-white font-mono">{product.dimensions.height} {product.dimensions.unit}</strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-stone-800">
                      <span className="text-stone-400">Floor Footprint:</span>
                      <strong className="text-amber-300 font-mono">{areaSqMeters} m² ({areaSqFeet} sq. ft.)</strong>
                    </div>
                  </div>
                </div>

                {/* Doorway & Walkway Fit Checklist */}
                <div className="p-3.5 bg-stone-900/80 rounded-2xl border border-stone-800 space-y-2">
                  <span className="font-bold text-stone-200 block text-xs">
                    Entryway & Room Fit Advice
                  </span>
                  <ul className="space-y-1.5 text-[11px] text-stone-400">
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Fits standard 30" (76cm) or larger doorways with box packaging.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Recommended minimum clearance: 60cm walkway perimeter.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>Complimentary white-glove assembly included with delivery.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Bottom Actions & Buy Now / Add to Cart */}
            <div className="pt-3 border-t border-stone-800 space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-stone-400">Selected Configuration:</span>
                <span className="text-white font-bold font-mono">₹{product.salePrice.toLocaleString()}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onAddToCart();
                    onClose();
                  }}
                  className="flex-1 py-3 bg-amber-800 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
