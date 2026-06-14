import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Plus,
  Trash2,
  Copy,
  Download,
  Upload,
  Settings,
  Layers,
  Eye,
  EyeOff,
  RotateCcw,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Maximize2,
  DownloadCloud,
  Film,
  Clock,
  Zap,
  Grid3X3,
  RefreshCw,
  ArrowRightLeft,
  CircleStop,
  Check,
} from 'lucide-react';
import PixelButton from '@/components/ui/PixelButton';
import PixelCard from '@/components/ui/PixelCard';
import { cn } from '@/lib/utils';

type LoopMode = 'loop' | 'once' | 'pingpong';
type ExportFormat = 'gif' | 'mp4' | 'png';

interface FrameElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  visible: boolean;
  data: Record<string, unknown>;
}

interface Frame {
  id: string;
  duration: number;
  elements: FrameElement[];
  thumbnail: string;
}

const CANVAS_PRESETS = [
  { name: '128×128', width: 128, height: 128 },
  { name: '256×256', width: 256, height: 256 },
  { name: '320×240', width: 320, height: 240 },
  { name: '512×384', width: 512, height: 384 },
  { name: '640×480', width: 640, height: 480 },
];

const generateId = () => Math.random().toString(36).substring(2, 11);

const createSampleFrame = (index: number): Frame => ({
  id: generateId(),
  duration: 100,
  elements: [
    {
      id: generateId(),
      type: 'shape',
      x: 80 + index * 20,
      y: 80,
      width: 64,
      height: 64,
      rotation: index * 15,
      visible: true,
      data: { shape: 'rectangle', fill: index % 2 === 0 ? '#FF6B9D' : '#64FFDA', stroke: '#0D0B1F', strokeWidth: 4 },
    },
    {
      id: generateId(),
      type: 'text',
      x: 60,
      y: 180,
      width: 120,
      height: 30,
      rotation: 0,
      visible: true,
      data: { content: `FRAME ${index + 1}`, fontFamily: 'Press Start 2P', fontSize: 12, color: '#FFE66D', strokeColor: '#0D0B1F', strokeWidth: 2 },
    },
  ],
  thumbnail: '',
});

const AnimationEditor: React.FC = () => {
  const [canvasWidth, setCanvasWidth] = useState(256);
  const [canvasHeight, setCanvasHeight] = useState(256);
  const [fps, setFps] = useState(12);
  const [loopMode, setLoopMode] = useState<LoopMode>('loop');
  const [onionSkin, setOnionSkin] = useState(true);
  const [frames, setFrames] = useState<Frame[]>(() => [
    createSampleFrame(0),
    createSampleFrame(1),
    createSampleFrame(2),
    createSampleFrame(3),
  ]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [draggedFrameIndex, setDraggedFrameIndex] = useState<number | null>(null);
  const [dragOverFrameIndex, setDragOverFrameIndex] = useState<number | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('gif');
  const [exportQuality, setExportQuality] = useState(80);
  const [exportScale, setExportScale] = useState(2);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [rightPanelTab, setRightPanelTab] = useState<'frame' | 'element' | 'export'>('frame');
  const [timelineScroll, setTimelineScroll] = useState(0);

  const timelineRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const pingpongDirectionRef = useRef<1 | -1>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentFrame = frames[currentFrameIndex];
  const selectedElement = currentFrame?.elements.find((el) => el.id === selectedElementId);
  const totalDuration = useMemo(() => frames.reduce((sum, f) => sum + f.duration, 0), [frames]);

  const getDisplayScale = useCallback(() => {
    const maxWidth = 500;
    const maxHeight = 400;
    const scaleX = maxWidth / canvasWidth;
    const scaleY = maxHeight / canvasHeight;
    return Math.min(scaleX, scaleY);
  }, [canvasWidth, canvasHeight]);

  const displayScale = getDisplayScale();
  const displayWidth = canvasWidth * displayScale;
  const displayHeight = canvasHeight * displayScale;

  const playAnimation = useCallback(() => {
    if (!isPlaying || frames.length === 0) return;

    const animate = (timestamp: number) => {
      const frame = frames[currentFrameIndex];
      const frameDuration = frame.duration / playbackSpeed;

      if (timestamp - lastFrameTimeRef.current >= frameDuration) {
        lastFrameTimeRef.current = timestamp;

        if (loopMode === 'loop') {
          setCurrentFrameIndex((prev) => (prev + 1) % frames.length);
        } else if (loopMode === 'once') {
          if (currentFrameIndex < frames.length - 1) {
            setCurrentFrameIndex((prev) => prev + 1);
          } else {
            setIsPlaying(false);
            return;
          }
        } else if (loopMode === 'pingpong') {
          const nextIndex = currentFrameIndex + pingpongDirectionRef.current;
          if (nextIndex >= frames.length || nextIndex < 0) {
            pingpongDirectionRef.current *= -1;
            setCurrentFrameIndex(currentFrameIndex + pingpongDirectionRef.current);
          } else {
            setCurrentFrameIndex(nextIndex);
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [isPlaying, frames, currentFrameIndex, loopMode, playbackSpeed]);

  useEffect(() => {
    if (isPlaying) {
      lastFrameTimeRef.current = performance.now();
      playAnimation();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, playAnimation]);

  const handlePlayPause = () => {
    if (!isPlaying && currentFrameIndex === frames.length - 1 && loopMode === 'once') {
      setCurrentFrameIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handlePrevFrame = () => {
    setIsPlaying(false);
    setCurrentFrameIndex((prev) => (prev - 1 + frames.length) % frames.length);
  };

  const handleNextFrame = () => {
    setIsPlaying(false);
    setCurrentFrameIndex((prev) => (prev + 1) % frames.length);
  };

  const handleAddFrame = () => {
    const newFrame: Frame = {
      id: generateId(),
      duration: 100,
      elements: JSON.parse(JSON.stringify(currentFrame?.elements || [])),
      thumbnail: '',
    };
    const newFrames = [...frames];
    newFrames.splice(currentFrameIndex + 1, 0, newFrame);
    setFrames(newFrames);
    setCurrentFrameIndex(currentFrameIndex + 1);
  };

  const handleDeleteFrame = () => {
    if (frames.length <= 1) return;
    const newFrames = frames.filter((_, i) => i !== currentFrameIndex);
    setFrames(newFrames);
    setCurrentFrameIndex(Math.min(currentFrameIndex, newFrames.length - 1));
  };

  const handleDuplicateFrame = () => {
    const newFrame: Frame = {
      ...JSON.parse(JSON.stringify(currentFrame)),
      id: generateId(),
    };
    const newFrames = [...frames];
    newFrames.splice(currentFrameIndex + 1, 0, newFrame);
    setFrames(newFrames);
    setCurrentFrameIndex(currentFrameIndex + 1);
  };

  const handleFrameDurationChange = (frameId: string, duration: number) => {
    setFrames(frames.map((f) => (f.id === frameId ? { ...f, duration: Math.max(20, Math.min(5000, duration)) } : f)));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedFrameIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverFrameIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedFrameIndex !== null && dragOverFrameIndex !== null && draggedFrameIndex !== dragOverFrameIndex) {
      const newFrames = [...frames];
      const [draggedFrame] = newFrames.splice(draggedFrameIndex, 1);
      newFrames.splice(dragOverFrameIndex, 0, draggedFrame);
      setFrames(newFrames);
      if (currentFrameIndex === draggedFrameIndex) {
        setCurrentFrameIndex(dragOverFrameIndex);
      } else if (draggedFrameIndex < currentFrameIndex && dragOverFrameIndex >= currentFrameIndex) {
        setCurrentFrameIndex(currentFrameIndex - 1);
      } else if (draggedFrameIndex > currentFrameIndex && dragOverFrameIndex <= currentFrameIndex) {
        setCurrentFrameIndex(currentFrameIndex + 1);
      }
    }
    setDraggedFrameIndex(null);
    setDragOverFrameIndex(null);
  };

  const handleImportFrames = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFrames: Frame[] = Array.from(files).map((file) => ({
        id: generateId(),
        duration: 100,
        elements: [
          {
            id: generateId(),
            type: 'image',
            x: 0,
            y: 0,
            width: canvasWidth,
            height: canvasHeight,
            rotation: 0,
            visible: true,
            data: { src: URL.createObjectURL(file), pixelPerfect: true },
          },
        ],
        thumbnail: '',
      }));
      setFrames([...frames, ...newFrames]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    for (let i = 0; i <= 100; i += 5) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setExportProgress(i);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsExporting(false);
    setExportProgress(0);
  };

  const handleUpdateElement = (elementId: string, updates: Partial<FrameElement>) => {
    setFrames(
      frames.map((f, i) =>
        i === currentFrameIndex
          ? {
              ...f,
              elements: f.elements.map((el) => (el.id === elementId ? { ...el, ...updates } : el)),
            }
          : f
      )
    );
  };

  const handleAddElement = (type: 'text' | 'shape') => {
    const newElement: FrameElement = {
      id: generateId(),
      type,
      x: canvasWidth / 2 - 40,
      y: canvasHeight / 2 - 20,
      width: type === 'text' ? 120 : 60,
      height: type === 'text' ? 30 : 60,
      rotation: 0,
      visible: true,
      data:
        type === 'text'
          ? { content: 'NEW TEXT', fontFamily: 'Press Start 2P', fontSize: 12, color: '#FF6B9D', strokeColor: '#0D0B1F', strokeWidth: 2 }
          : { shape: 'rectangle', fill: '#64FFDA', stroke: '#0D0B1F', strokeWidth: 4 },
    };
    setFrames(
      frames.map((f, i) => (i === currentFrameIndex ? { ...f, elements: [...f.elements, newElement] } : f))
    );
    setSelectedElementId(newElement.id);
  };

  const handleDeleteElement = (elementId: string) => {
    setFrames(
      frames.map((f, i) =>
        i === currentFrameIndex ? { ...f, elements: f.elements.filter((el) => el.id !== elementId) } : f
      )
    );
    if (selectedElementId === elementId) setSelectedElementId(null);
  };

  const renderElement = (element: FrameElement, isOnion = false, onionOpacity = 0.3) => {
    const scale = displayScale;
    const commonTransform = `translate(${element.x * scale}px, ${element.y * scale}px) rotate(${element.rotation}deg)`;

    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: element.width * scale,
      height: element.height * scale,
      transform: commonTransform,
      cursor: 'move',
      opacity: isOnion ? onionOpacity : element.visible ? 1 : 0.3,
      pointerEvents: isOnion ? 'none' : 'auto',
    };

    const renderContent = () => {
      switch (element.type) {
        case 'text': {
          const data = element.data as { content: string; fontFamily: string; fontSize: number; color: string; strokeColor: string; strokeWidth: number };
          return (
            <div
              className="w-full h-full flex items-center justify-center overflow-hidden"
              style={{
                fontFamily: data.fontFamily,
                fontSize: data.fontSize * scale,
                color: data.color,
                WebkitTextStroke: data.strokeWidth ? `${data.strokeWidth * scale}px ${data.strokeColor}` : undefined,
                paintOrder: 'stroke fill',
                whiteSpace: 'pre-wrap',
                textAlign: 'center',
              }}
            >
              {data.content}
            </div>
          );
        }
        case 'image': {
          const data = element.data as { src: string; pixelPerfect?: boolean };
          return (
            <img
              src={data.src}
              alt=""
              className="w-full h-full object-contain"
              style={{ imageRendering: data.pixelPerfect ? 'pixelated' : 'auto' }}
            />
          );
        }
        case 'shape': {
          const data = element.data as { shape: string; fill: string; stroke: string; strokeWidth: number };
          if (data.shape === 'circle') {
            return (
              <div
                className="w-full h-full"
                style={{
                  backgroundColor: data.fill,
                  borderRadius: '50%',
                  border: `${data.strokeWidth * scale}px solid ${data.stroke}`,
                }}
              />
            );
          }
          return (
            <div
              className="w-full h-full"
              style={{
                backgroundColor: data.fill,
                border: `${data.strokeWidth * scale}px solid ${data.stroke}`,
                boxShadow: `${4 * scale}px ${4 * scale}px 0 0 ${data.stroke}`,
              }}
            />
          );
        }
        default:
          return null;
      }
    };

    const isSelected = element.id === selectedElementId && !isOnion;

    return (
      <div
        key={element.id + (isOnion ? '-onion' : '')}
        style={baseStyle}
        onClick={(e) => {
          e.stopPropagation();
          if (!isOnion) setSelectedElementId(element.id);
        }}
      >
        {renderContent()}
        {isSelected && (
          <>
            <div
              className="absolute inset-0 border-2 border-pixel-neon-cyan pointer-events-none"
              style={{ boxShadow: '0 0 10px rgba(100, 255, 218, 0.5)' }}
            />
            {['nw', 'ne', 'sw', 'se'].map((handle) => (
              <div
                key={handle}
                className="absolute w-3 h-3 bg-pixel-neon-cyan border-2 border-pixel-bg"
                style={{
                  left: handle.includes('w') ? -6 : 'auto',
                  right: handle.includes('e') ? -6 : undefined,
                  top: handle.includes('n') ? -6 : 'auto',
                  bottom: handle.includes('s') ? -6 : undefined,
                  cursor: `${handle}-resize`,
                }}
              />
            ))}
          </>
        )}
      </div>
    );
  };

  const renderFrameThumbnail = (frame: Frame, index: number) => {
    const thumbScale = 60 / Math.max(canvasWidth, canvasHeight);
    return (
      <div className="relative w-full h-full bg-pixel-bg overflow-hidden">
        {frame.elements.map((element) => (
          <div
            key={element.id}
            style={{
              position: 'absolute',
              left: element.x * thumbScale,
              top: element.y * thumbScale,
              width: element.width * thumbScale,
              height: element.height * thumbScale,
              transform: `rotate(${element.rotation}deg)`,
              backgroundColor: element.type === 'shape' ? (element.data as { fill: string }).fill : 'transparent',
              border: element.type === 'shape' ? `${Math.max(1, (element.data as { strokeWidth: number }).strokeWidth * thumbScale)}px solid ${(element.data as { stroke: string }).stroke}` : 'none',
              borderRadius: (element.data as { shape: string }).shape === 'circle' ? '50%' : 'none',
              fontSize: (element.data as { fontSize?: number }).fontSize ? `${(element.data as { fontSize: number }).fontSize * thumbScale}px` : undefined,
              color: (element.data as { color?: string }).color || '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: (element.data as { fontFamily?: string }).fontFamily || 'monospace',
              overflow: 'hidden',
              textAlign: 'center',
            }}
          >
            {element.type === 'text' && (element.data as { content: string }).content}
            {element.type === 'image' && <div className="w-full h-full bg-pixel-neon-purple/30" />}
          </div>
        ))}
      </div>
    );
  };

  const timelineFrameWidth = 80;
  const playheadPosition = currentFrameIndex * timelineFrameWidth + timelineFrameWidth / 2 - timelineScroll;

  return (
    <div className="h-screen flex flex-col bg-pixel-bg overflow-hidden font-vt">
      {/* Top Toolbar */}
      <div className="h-14 bg-pixel-surface border-b-4 border-pixel-border flex items-center px-4 gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Film className="w-6 h-6 text-pixel-neon-pink" />
          <span className="text-pixel-neon-pink text-pixel-sm pixel-text-shadow">PIXEL</span>
          <span className="text-pixel-neon-cyan text-pixel-sm pixel-text-shadow">ANIMATOR</span>
        </div>

        <div className="h-8 w-px bg-pixel-border mx-2" />

        {/* Canvas Size */}
        <div className="relative">
          <PixelButton size="sm" variant="default" onClick={() => setShowSizeDropdown(!showSizeDropdown)}>
            <span className="flex items-center gap-2">
              <Maximize2 className="w-4 h-4" />
              {canvasWidth}×{canvasHeight}
              <ChevronDown className="w-3 h-3 text-pixel-text-muted" />
            </span>
          </PixelButton>
          <AnimatePresence>
            {showSizeDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-2 w-48 bg-pixel-card border-4 border-pixel-border z-50"
                style={{ boxShadow: '4px 4px 0 0 #0D0B1F' }}
              >
                {CANVAS_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    className={cn(
                      'w-full px-3 py-2 text-left text-vt-base hover:bg-pixel-surface transition-colors border-b border-pixel-border/30',
                      canvasWidth === preset.width && canvasHeight === preset.height && 'bg-pixel-surface text-pixel-neon-cyan'
                    )}
                    onClick={() => {
                      setCanvasWidth(preset.width);
                      setCanvasHeight(preset.height);
                      setShowSizeDropdown(false);
                    }}
                  >
                    {preset.name}
                  </button>
                ))}
                <div className="p-2 border-t-2 border-pixel-border">
                  <div className="flex gap-2 items-center mb-2">
                    <input
                      type="number"
                      className="input-pixel text-sm w-full"
                      value={canvasWidth}
                      onChange={(e) => setCanvasWidth(Math.max(32, Math.min(1024, parseInt(e.target.value) || 32)))}
                    />
                    <span className="text-pixel-text-muted">×</span>
                    <input
                      type="number"
                      className="input-pixel text-sm w-full"
                      value={canvasHeight}
                      onChange={(e) => setCanvasHeight(Math.max(32, Math.min(1024, parseInt(e.target.value) || 32)))}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FPS */}
        <div className="flex items-center gap-2 bg-pixel-card border-2 border-pixel-border px-3 py-1">
          <Zap className="w-4 h-4 text-pixel-neon-yellow" />
          <span className="text-pixel-xs text-pixel-text-muted">FPS</span>
          <input
            type="number"
            min="1"
            max="30"
            value={fps}
            onChange={(e) => setFps(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
            className="w-12 bg-transparent text-vt-base text-pixel-neon-yellow text-center border-none outline-none"
          />
        </div>

        {/* Loop Mode */}
        <div className="flex items-center gap-1 bg-pixel-card border-2 border-pixel-border p-1">
          <PixelButton
            size="sm"
            variant={loopMode === 'loop' ? 'primary' : 'ghost'}
            onClick={() => setLoopMode('loop')}
            className="px-2"
          >
            <RefreshCw className="w-4 h-4" />
          </PixelButton>
          <PixelButton
            size="sm"
            variant={loopMode === 'once' ? 'primary' : 'ghost'}
            onClick={() => setLoopMode('once')}
            className="px-2"
          >
            <CircleStop className="w-4 h-4" />
          </PixelButton>
          <PixelButton
            size="sm"
            variant={loopMode === 'pingpong' ? 'primary' : 'ghost'}
            onClick={() => setLoopMode('pingpong')}
            className="px-2"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </PixelButton>
        </div>

        {/* Onion Skin */}
        <PixelButton
          size="sm"
          variant={onionSkin ? 'secondary' : 'ghost'}
          onClick={() => setOnionSkin(!onionSkin)}
        >
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            洋葱皮
          </span>
        </PixelButton>

        {/* Import */}
        <PixelButton size="sm" variant="default" onClick={handleImportFrames}>
          <span className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            导入帧序列
          </span>
        </PixelButton>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="flex-1" />

        <div className="text-vt-sm text-pixel-text-muted">
          {frames.length} 帧 | {totalDuration / 1000}s | {fps} FPS
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Frame List */}
        <div className="w-48 bg-pixel-surface border-r-4 border-pixel-border flex flex-col flex-shrink-0">
          <div className="p-3 border-b-4 border-pixel-border">
            <h3 className="text-pixel-xs text-pixel-neon-pink font-pixel mb-3">帧列表</h3>
            <div className="grid grid-cols-3 gap-1">
              <PixelButton size="sm" variant="secondary" onClick={handleAddFrame} className="flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </PixelButton>
              <PixelButton size="sm" variant="default" onClick={handleDuplicateFrame} className="flex items-center justify-center">
                <Copy className="w-4 h-4" />
              </PixelButton>
              <PixelButton
                size="sm"
                variant="danger"
                onClick={handleDeleteFrame}
                disabled={frames.length <= 1}
                className="flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </PixelButton>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {frames.map((frame, index) => (
              <motion.div
                key={frame.id}
                draggable
                onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, index)}
                onDragOver={(e) => handleDragOver(e as unknown as React.DragEvent, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'relative border-4 cursor-pointer transition-all',
                  currentFrameIndex === index
                    ? 'border-pixel-neon-cyan bg-pixel-card shadow-neon-cyan'
                    : 'border-pixel-border bg-pixel-surface hover:border-pixel-text-muted',
                  dragOverFrameIndex === index && draggedFrameIndex !== index && 'border-pixel-neon-pink',
                  draggedFrameIndex === index && 'opacity-50'
                )}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentFrameIndex(index);
                }}
                whileHover={{ x: 4 }}
                layout
              >
                <div className="absolute top-1 left-1 z-10 flex items-center gap-1">
                  <div
                    className={cn(
                      'px-1.5 py-0.5 text-pixel-xs font-pixel',
                      currentFrameIndex === index ? 'bg-pixel-neon-cyan text-pixel-bg' : 'bg-pixel-bg/80 text-pixel-text-primary'
                    )}
                  >
                    {index + 1}
                  </div>
                  <GripVertical className="w-3 h-3 text-pixel-text-muted cursor-grab" />
                </div>

                <div className="aspect-square p-1 pt-6">
                  {renderFrameThumbnail(frame, index)}
                </div>

                <div className="p-2 border-t-2 border-pixel-border/50">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-pixel-text-muted" />
                    <input
                      type="number"
                      value={frame.duration}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleFrameDurationChange(frame.id, parseInt(e.target.value) || 100);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-transparent text-vt-sm text-pixel-neon-yellow text-center border-none outline-none"
                    />
                    <span className="text-pixel-xs text-pixel-text-muted">ms</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Center - Preview Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Preview Canvas */}
          <div className="flex-1 flex items-center justify-center p-6 overflow-auto bg-pixel-bg relative">
            <div
              className="absolute inset-0 opacity-20 pixel-grid-bg"
              style={{ backgroundSize: `${16 * displayScale}px ${16 * displayScale}px` }}
            />

            <div
              className={cn(
                'relative bg-pixel-card border-4 border-pixel-border scanline-overlay crt-effect',
                isPlaying && 'animate-flicker'
              )}
              style={{
                width: displayWidth,
                height: displayHeight,
                boxShadow: '8px 8px 0 0 #0D0B1F, 0 0 40px rgba(255, 107, 157, 0.2)',
              }}
              onClick={() => setSelectedElementId(null)}
            >
              {/* Grid overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(74, 58, 107, 0.5) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(74, 58, 107, 0.5) 1px, transparent 1px)
                  `,
                  backgroundSize: `${16 * displayScale}px ${16 * displayScale}px`,
                }}
              />

              {/* Onion skin - previous frame */}
              {onionSkin && currentFrameIndex > 0 && frames[currentFrameIndex - 1]?.elements.map((el) => renderElement(el, true, 0.2))}

              {/* Onion skin - next frame */}
              {onionSkin && currentFrameIndex < frames.length - 1 && frames[currentFrameIndex + 1]?.elements.map((el) => renderElement(el, true, 0.2))}

              {/* Current frame elements */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFrameIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="absolute inset-0"
                >
                  {currentFrame?.elements.map((element) => renderElement(element))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="bg-pixel-surface border-t-4 border-pixel-border p-3 flex items-center justify-center gap-4 flex-shrink-0">
            <PixelButton size="sm" variant="ghost" onClick={handlePrevFrame} disabled={isPlaying}>
              <SkipBack className="w-5 h-5" />
            </PixelButton>

            <PixelButton
              size="lg"
              variant={isPlaying ? 'warning' : 'primary'}
              onClick={handlePlayPause}
              className="w-20"
            >
              <span className="flex items-center justify-center gap-2">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span className="text-pixel-xs">{isPlaying ? '暂停' : '播放'}</span>
              </span>
            </PixelButton>

            <PixelButton size="sm" variant="ghost" onClick={handleNextFrame} disabled={isPlaying}>
              <SkipForward className="w-5 h-5" />
            </PixelButton>

            <div className="w-px h-8 bg-pixel-border mx-2" />

            <div className="flex items-center gap-2 bg-pixel-card border-2 border-pixel-border px-3 py-2">
              <RotateCcw className="w-4 h-4 text-pixel-text-muted" />
              <span className="text-pixel-xs text-pixel-text-muted">速度</span>
              <input
                type="range"
                min="0.25"
                max="4"
                step="0.25"
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="w-24 accent-pixel-neon-pink"
              />
              <span className="text-vt-base text-pixel-neon-pink w-12 text-center">{playbackSpeed}x</span>
            </div>

            <div className="w-px h-8 bg-pixel-border mx-2" />

            <div className="text-vt-sm text-pixel-text-muted">
              帧 <span className="text-pixel-neon-cyan">{currentFrameIndex + 1}</span> / {frames.length}
            </div>
          </div>

          {/* Timeline */}
          <div className="h-28 bg-pixel-surface border-t-4 border-pixel-border flex flex-col flex-shrink-0">
            {/* Timeline ruler */}
            <div className="h-6 bg-pixel-card border-b-2 border-pixel-border flex items-center px-4 overflow-hidden relative">
              {Array.from({ length: Math.ceil(frames.length * timelineFrameWidth / 100) + 2 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 flex flex-col justify-end"
                  style={{ left: i * 100 - (timelineScroll % 100) }}
                >
                  <div className="w-px h-2 bg-pixel-border" />
                  <span className="text-pixel-xs text-pixel-text-muted ml-1">
                    {Math.floor((i * 100 + timelineScroll) / timelineFrameWidth) * 100}ms
                  </span>
                </div>
              ))}
            </div>

            {/* Timeline frames */}
            <div
              ref={timelineRef}
              className="flex-1 overflow-x-auto overflow-y-hidden relative"
              onScroll={(e) => setTimelineScroll(e.currentTarget.scrollLeft)}
              style={{ scrollbarWidth: 'thin' }}
            >
              <div
                className="relative h-full flex items-center px-4"
                style={{ width: frames.length * timelineFrameWidth + 32 }}
              >
                {/* Playhead */}
                <motion.div
                  className="absolute top-0 bottom-0 z-20 pointer-events-none"
                  animate={{ left: playheadPosition + 16 }}
                  transition={{ type: 'tween', duration: 0.1 }}
                >
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-pixel-neon-pink -translate-x-1/2" />
                  <div className="w-0.5 h-full bg-pixel-neon-pink -translate-x-1/2" style={{ boxShadow: '0 0 10px rgba(255, 107, 157, 0.8)' }} />
                </motion.div>

                {/* Frame blocks */}
                {frames.map((frame, index) => {
                  const frameWidth = (frame.duration / 100) * timelineFrameWidth;
                  return (
                    <motion.div
                      key={frame.id}
                      className={cn(
                        'h-16 border-4 mr-1 cursor-pointer transition-all flex-shrink-0',
                        currentFrameIndex === index
                          ? 'border-pixel-neon-cyan bg-pixel-card'
                          : 'border-pixel-border bg-pixel-surface hover:border-pixel-text-muted'
                      )}
                      style={{ width: frameWidth }}
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentFrameIndex(index);
                      }}
                      whileHover={{ y: -2 }}
                      layout
                    >
                      <div className="w-full h-full p-1">
                        <div className="w-full h-full bg-pixel-bg overflow-hidden relative">
                          {frame.elements.slice(0, 3).map((element, i) => (
                            <div
                              key={element.id}
                              className="absolute"
                              style={{
                                left: `${(element.x / canvasWidth) * 100}%`,
                                top: `${(element.y / canvasHeight) * 100}%`,
                                width: `${(element.width / canvasWidth) * 100}%`,
                                height: `${(element.height / canvasHeight) * 100}%`,
                                backgroundColor: element.type === 'shape' ? (element.data as { fill: string }).fill : element.type === 'text' ? (element.data as { color: string }).color : '#C77DFF',
                                opacity: 0.8 - i * 0.2,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 text-center text-pixel-xs text-pixel-text-muted bg-pixel-bg/80 py-0.5">
                        {index + 1}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-64 bg-pixel-surface border-l-4 border-pixel-border flex flex-col flex-shrink-0">
          <div className="flex border-b-4 border-pixel-border">
            {(['frame', 'element', 'export'] as const).map((tab) => (
              <button
                key={tab}
                className={cn(
                  'flex-1 py-2 text-pixel-xs font-pixel transition-colors',
                  rightPanelTab === tab
                    ? 'bg-pixel-card text-pixel-neon-pink'
                    : 'text-pixel-text-muted hover:text-pixel-text-primary'
                )}
                onClick={() => setRightPanelTab(tab)}
              >
                {tab === 'frame' && <span className="flex items-center justify-center gap-1"><Film className="w-3 h-3" />帧</span>}
                {tab === 'element' && <span className="flex items-center justify-center gap-1"><Settings className="w-3 h-3" />元素</span>}
                {tab === 'export' && <span className="flex items-center justify-center gap-1"><Download className="w-3 h-3" />导出</span>}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {/* Frame Tab */}
            {rightPanelTab === 'frame' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-pixel-xs text-pixel-neon-cyan mb-2 font-pixel">帧属性</h3>
                  <PixelCard hover={false} className="p-3">
                    <div className="space-y-3">
                      <div>
                        <label className="text-pixel-xs text-pixel-text-muted block mb-1">帧时长 (ms)</label>
                        <input
                          type="number"
                          min="20"
                          max="5000"
                          className="input-pixel text-sm"
                          value={currentFrame?.duration || 100}
                          onChange={(e) => handleFrameDurationChange(currentFrame!.id, parseInt(e.target.value) || 100)}
                        />
                      </div>
                      <div className="text-vt-sm text-pixel-text-muted">
                        当前帧: <span className="text-pixel-neon-cyan">{currentFrameIndex + 1}</span> / {frames.length}
                      </div>
                      <div className="text-vt-sm text-pixel-text-muted">
                        元素数量: <span className="text-pixel-neon-yellow">{currentFrame?.elements.length || 0}</span>
                      </div>
                    </div>
                  </PixelCard>
                </div>

                <div>
                  <h3 className="text-pixel-xs text-pixel-neon-cyan mb-2 font-pixel">添加元素</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <PixelButton size="sm" variant="default" onClick={() => handleAddElement('text')} className="flex flex-col items-center py-3">
                      <span className="text-xl mb-1">T</span>
                      <span className="text-pixel-xs">文字</span>
                    </PixelButton>
                    <PixelButton size="sm" variant="default" onClick={() => handleAddElement('shape')} className="flex flex-col items-center py-3">
                      <span className="text-xl mb-1">⬜</span>
                      <span className="text-pixel-xs">形状</span>
                    </PixelButton>
                  </div>
                </div>

                <div>
                  <h3 className="text-pixel-xs text-pixel-neon-cyan mb-2 font-pixel">图层列表</h3>
                  <div className="space-y-1">
                    {[...(currentFrame?.elements || [])].reverse().map((element) => (
                      <motion.div
                        key={element.id}
                        className={cn(
                          'p-2 border-2 cursor-pointer transition-all',
                          selectedElementId === element.id
                            ? 'bg-pixel-card border-pixel-neon-cyan'
                            : 'bg-pixel-surface border-pixel-border hover:border-pixel-text-muted'
                        )}
                        onClick={() => setSelectedElementId(element.id)}
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {element.type === 'text' && 'T'}
                            {element.type === 'image' && '🖼'}
                            {element.type === 'shape' && '⬜'}
                          </span>
                          <span className="flex-1 text-vt-sm truncate">
                            {element.type === 'text' ? (element.data as { content: string }).content : element.type}
                          </span>
                          <button
                            className="w-5 h-5 text-xs hover:text-pixel-neon-cyan transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateElement(element.id, { visible: !element.visible });
                            }}
                          >
                            {element.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                    {(!currentFrame?.elements || currentFrame.elements.length === 0) && (
                      <div className="text-center py-8 text-pixel-text-muted">
                        <div className="text-4xl mb-2">📋</div>
                        <div className="text-vt-base">暂无元素</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Element Tab */}
            {rightPanelTab === 'element' && (
              <div className="space-y-4">
                {selectedElement ? (
                  <>
                    <div>
                      <h3 className="text-pixel-xs text-pixel-neon-pink mb-2 font-pixel">位置</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-pixel-xs text-pixel-text-muted block mb-1">X</label>
                          <input
                            type="number"
                            className="input-pixel text-sm"
                            value={selectedElement.x}
                            onChange={(e) => handleUpdateElement(selectedElementId!, { x: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <label className="text-pixel-xs text-pixel-text-muted block mb-1">Y</label>
                          <input
                            type="number"
                            className="input-pixel text-sm"
                            value={selectedElement.y}
                            onChange={(e) => handleUpdateElement(selectedElementId!, { y: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-pixel-xs text-pixel-neon-pink mb-2 font-pixel">大小</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-pixel-xs text-pixel-text-muted block mb-1">宽</label>
                          <input
                            type="number"
                            className="input-pixel text-sm"
                            value={selectedElement.width}
                            onChange={(e) => handleUpdateElement(selectedElementId!, { width: parseInt(e.target.value) || 20 })}
                          />
                        </div>
                        <div>
                          <label className="text-pixel-xs text-pixel-text-muted block mb-1">高</label>
                          <input
                            type="number"
                            className="input-pixel text-sm"
                            value={selectedElement.height}
                            onChange={(e) => handleUpdateElement(selectedElementId!, { height: parseInt(e.target.value) || 20 })}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-pixel-xs text-pixel-neon-pink mb-2 font-pixel">变换</h3>
                      <div>
                        <label className="text-pixel-xs text-pixel-text-muted block mb-1">旋转角度</label>
                        <input
                          type="number"
                          className="input-pixel text-sm"
                          value={selectedElement.rotation}
                          onChange={(e) => handleUpdateElement(selectedElementId!, { rotation: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    {selectedElement.type === 'text' && (
                      <>
                        <div>
                          <h3 className="text-pixel-xs text-pixel-neon-pink mb-2 font-pixel">文字内容</h3>
                          <textarea
                            className="input-pixel text-sm h-16 resize-none"
                            value={(selectedElement.data as { content: string }).content}
                            onChange={(e) =>
                              handleUpdateElement(selectedElementId!, {
                                data: { ...selectedElement.data, content: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div>
                          <h3 className="text-pixel-xs text-pixel-neon-pink mb-2 font-pixel">颜色</h3>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              className="w-12 h-10 border-2 border-pixel-border cursor-pointer"
                              value={(selectedElement.data as { color: string }).color}
                              onChange={(e) =>
                                handleUpdateElement(selectedElementId!, {
                                  data: { ...selectedElement.data, color: e.target.value },
                                })
                              }
                            />
                            <input
                              type="text"
                              className="input-pixel text-sm flex-1"
                              value={(selectedElement.data as { color: string }).color}
                              onChange={(e) =>
                                handleUpdateElement(selectedElementId!, {
                                  data: { ...selectedElement.data, color: e.target.value },
                                })
                              }
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {selectedElement.type === 'shape' && (
                      <>
                        <div>
                          <h3 className="text-pixel-xs text-pixel-neon-pink mb-2 font-pixel">填充色</h3>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              className="w-12 h-10 border-2 border-pixel-border cursor-pointer"
                              value={(selectedElement.data as { fill: string }).fill}
                              onChange={(e) =>
                                handleUpdateElement(selectedElementId!, {
                                  data: { ...selectedElement.data, fill: e.target.value },
                                })
                              }
                            />
                            <input
                              type="text"
                              className="input-pixel text-sm flex-1"
                              value={(selectedElement.data as { fill: string }).fill}
                              onChange={(e) =>
                                handleUpdateElement(selectedElementId!, {
                                  data: { ...selectedElement.data, fill: e.target.value },
                                })
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-pixel-xs text-pixel-neon-pink mb-2 font-pixel">描边色</h3>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              className="w-12 h-10 border-2 border-pixel-border cursor-pointer"
                              value={(selectedElement.data as { stroke: string }).stroke}
                              onChange={(e) =>
                                handleUpdateElement(selectedElementId!, {
                                  data: { ...selectedElement.data, stroke: e.target.value },
                                })
                              }
                            />
                            <input
                              type="text"
                              className="input-pixel text-sm flex-1"
                              value={(selectedElement.data as { stroke: string }).stroke}
                              onChange={(e) =>
                                handleUpdateElement(selectedElementId!, {
                                  data: { ...selectedElement.data, stroke: e.target.value },
                                })
                              }
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <PixelButton
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteElement(selectedElementId!)}
                      className="w-full"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        删除元素
                      </span>
                    </PixelButton>
                  </>
                ) : (
                  <div className="text-center py-8 text-pixel-text-muted">
                    <div className="text-4xl mb-2">🎨</div>
                    <div className="text-vt-base">选择一个元素</div>
                    <div className="text-vt-sm mt-1">以编辑其属性</div>
                  </div>
                )}
              </div>
            )}

            {/* Export Tab */}
            {rightPanelTab === 'export' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-pixel-xs text-pixel-neon-cyan mb-2 font-pixel">导出格式</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {(['gif', 'mp4', 'png'] as const).map((format) => (
                      <PixelButton
                        key={format}
                        size="sm"
                        variant={exportFormat === format ? 'primary' : 'default'}
                        onClick={() => setExportFormat(format)}
                        className={cn(
                          'flex flex-col items-center py-3',
                          exportFormat === format && 'ring-2 ring-pixel-neon-pink'
                        )}
                      >
                        <span className="text-xl mb-1">
                          {format === 'gif' && '🎞'}
                          {format === 'mp4' && '🎬'}
                          {format === 'png' && '🖼'}
                        </span>
                        <span className="text-pixel-xs uppercase">{format}</span>
                      </PixelButton>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-pixel-xs text-pixel-neon-pink mb-2 font-pixel">画质</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={exportQuality}
                      onChange={(e) => setExportQuality(parseInt(e.target.value))}
                      className="flex-1 accent-pixel-neon-cyan"
                    />
                    <span className="text-vt-base text-pixel-neon-cyan w-12 text-right">{exportQuality}%</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-pixel-xs text-pixel-neon-pink mb-2 font-pixel">缩放</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((scale) => (
                      <PixelButton
                        key={scale}
                        size="sm"
                        variant={exportScale === scale ? 'secondary' : 'default'}
                        onClick={() => setExportScale(scale)}
                        className="text-vt-base"
                      >
                        {scale}x
                      </PixelButton>
                    ))}
                  </div>
                </div>

                <PixelCard hover={false} className="p-3">
                  <h3 className="text-pixel-xs text-pixel-neon-cyan mb-2 font-pixel">导出信息</h3>
                  <div className="space-y-1 text-vt-sm">
                    <div className="flex justify-between">
                      <span className="text-pixel-text-muted">尺寸</span>
                      <span className="text-pixel-text-primary">
                        {canvasWidth * exportScale} × {canvasHeight * exportScale}px
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pixel-text-muted">帧数</span>
                      <span className="text-pixel-text-primary">{frames.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pixel-text-muted">帧率</span>
                      <span className="text-pixel-text-primary">{fps} FPS</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pixel-text-muted">时长</span>
                      <span className="text-pixel-text-primary">{totalDuration / 1000}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pixel-text-muted">循环</span>
                      <span className="text-pixel-text-primary">
                        {loopMode === 'loop' && '循环'}
                        {loopMode === 'once' && '单次'}
                        {loopMode === 'pingpong' && '往返'}
                      </span>
                    </div>
                  </div>
                </PixelCard>

                {isExporting && (
                  <PixelCard hover={false} className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-pixel-xs text-pixel-neon-yellow font-pixel">导出中...</span>
                      <span className="text-vt-base text-pixel-neon-yellow">{exportProgress}%</span>
                    </div>
                    <div className="h-4 bg-pixel-bg border-2 border-pixel-border overflow-hidden">
                      <motion.div
                        className="h-full bg-pixel-neon-cyan"
                        initial={{ width: 0 }}
                        animate={{ width: `${exportProgress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </PixelCard>
                )}

                <PixelButton
                  size="lg"
                  variant={isExporting ? 'warning' : 'primary'}
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full"
                >
                  <span className="flex items-center justify-center gap-2">
                    {isExporting ? (
                      <>
                        <DownloadCloud className="w-5 h-5 animate-bounce" />
                        <span className="text-pixel-xs">导出中...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span className="text-pixel-xs">
                          导出 {exportFormat.toUpperCase()}
                        </span>
                      </>
                    )}
                  </span>
                </PixelButton>

                {!isExporting && exportProgress === 100 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-pixel-neon-cyan text-vt-base"
                  >
                    <Check className="w-5 h-5" />
                    导出完成！
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationEditor;
