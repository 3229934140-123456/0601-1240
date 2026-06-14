import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PixelButton from '@/components/ui/PixelButton';
import PixelCard from '@/components/ui/PixelCard';
import { useCanvasStore } from '@/store/canvasStore';
import { useProjectStore } from '@/store/projectStore';
import { CANVAS_RATIOS } from '@/data/ratios';
import { PRESET_PALETTES } from '@/data/palettes';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { cn } from '@/lib/utils';
import type { CanvasElement, TextElementData, ShapeElementData, BorderElementData } from '@/types';

const PosterEditor: React.FC = () => {
  const { projectId, currentProject } = useCurrentProject();
  const {
    width: canvasWidth,
    height: canvasHeight,
    ratio,
    zoom,
    gridVisible,
    elements,
    selectedId,
    setRatio,
    setZoom,
    toggleGrid,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    moveElement,
    resizeElement,
    bringForward,
    sendBackward,
    undo,
    redo,
    batchUpdateText,
  } = useCanvasStore();

  const {
    saveVersion,
    addComment,
    updatePalette,
    addCollaborator,
  } = useProjectStore();

  const [activeLeftTab, setActiveLeftTab] = useState<'elements' | 'layers'>('elements');
  const [activeRightTab, setActiveRightTab] = useState<'properties' | 'text' | 'palette' | 'border'>('properties');
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [showRatioDropdown, setShowRatioDropdown] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [showCommentMode, setShowCommentMode] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [collabEmail, setCollabEmail] = useState('');
  const [batchFind, setBatchFind] = useState('');
  const [batchReplace, setBatchReplace] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentPosition, setCommentPosition] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const selectedElement = elements.find((el) => el.id === selectedId);

  const getDisplayScale = () => {
    const maxWidth = 800;
    const maxHeight = 600;
    const scaleX = maxWidth / canvasWidth;
    const scaleY = maxHeight / canvasHeight;
    return Math.min(scaleX, scaleY) * zoom;
  };

  const displayScale = getDisplayScale();
  const displayWidth = canvasWidth * displayScale;
  const displayHeight = canvasHeight * displayScale;

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent, elementId?: string) => {
    if (showCommentMode) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left) / displayScale;
        const y = (e.clientY - rect.top) / displayScale;
        setCommentPosition({ x, y });
      }
      return;
    }

    if (elementId) {
      selectElement(elementId);
      const element = elements.find((el) => el.id === elementId);
      if (element && !element.locked) {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setElementStart({ x: element.x, y: element.y, width: element.width, height: element.height });
      }
    } else {
      selectElement(null);
    }
  }, [elements, selectElement, showCommentMode, displayScale]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && selectedId) {
      const dx = (e.clientX - dragStart.x) / displayScale;
      const dy = (e.clientY - dragStart.y) / displayScale;
      moveElement(selectedId, elementStart.x + dx, elementStart.y + dy);
    } else if (isResizing && selectedId && resizeHandle) {
      const dx = (e.clientX - dragStart.x) / displayScale;
      const dy = (e.clientY - dragStart.y) / displayScale;

      let newWidth = elementStart.width;
      let newHeight = elementStart.height;
      let newX = elementStart.x;
      let newY = elementStart.y;

      if (resizeHandle.includes('e')) newWidth = Math.max(20, elementStart.width + dx);
      if (resizeHandle.includes('w')) {
        newWidth = Math.max(20, elementStart.width - dx);
        newX = elementStart.x + dx;
      }
      if (resizeHandle.includes('s')) newHeight = Math.max(20, elementStart.height + dy);
      if (resizeHandle.includes('n')) {
        newHeight = Math.max(20, elementStart.height - dy);
        newY = elementStart.y + dy;
      }

      resizeElement(selectedId, newWidth, newHeight);
      moveElement(selectedId, newX, newY);
    }
  }, [isDragging, isResizing, selectedId, dragStart, elementStart, resizeHandle, displayScale, moveElement, resizeElement]);

  const handleMouseUp = useCallback(() => {
    if (isDragging || isResizing) {
      useCanvasStore.getState().saveState();
    }
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, [isDragging, isResizing]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    if (!selectedId) return;
    const element = elements.find((el) => el.id === selectedId);
    if (!element || element.locked) return;

    setIsResizing(true);
    setResizeHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    setElementStart({ x: element.x, y: element.y, width: element.width, height: element.height });
  };

  const handleAddText = () => {
    addElement({
      type: 'text',
      x: Math.round(canvasWidth / 2 - 100),
      y: Math.round(canvasHeight / 2 - 20),
      width: 200,
      height: 40,
      rotation: 0,
      visible: true,
      locked: false,
      data: {
        content: '双击编辑文字',
        fontFamily: 'Press Start 2P',
        fontSize: 24,
        color: '#FF6B9D',
        strokeColor: '#0D0B1F',
        strokeWidth: 2,
        pixelFont: true,
      } as TextElementData,
    });
  };

  const handleAddImage = () => {
    addElement({
      type: 'image',
      x: Math.round(canvasWidth / 2 - 100),
      y: Math.round(canvasHeight / 2 - 100),
      width: 200,
      height: 200,
      rotation: 0,
      visible: true,
      locked: false,
      data: {
        src: '/src/assets/react.svg',
        pixelPerfect: true,
      },
    });
  };

  const handleAddShape = (shape: 'rectangle' | 'circle' | 'pixel-border') => {
    addElement({
      type: 'shape',
      x: Math.round(canvasWidth / 2 - 75),
      y: Math.round(canvasHeight / 2 - 75),
      width: 150,
      height: 150,
      rotation: 0,
      visible: true,
      locked: false,
      data: {
        shape,
        fill: '#64FFDA',
        stroke: '#0D0B1F',
        strokeWidth: 4,
      } as ShapeElementData,
    });
  };

  const handleAddBorder = () => {
    addElement({
      type: 'border',
      x: 20,
      y: 20,
      width: canvasWidth - 40,
      height: canvasHeight - 40,
      rotation: 0,
      visible: true,
      locked: false,
      data: {
        style: 'neon',
        color: '#FF6B9D',
        thickness: 8,
        cornerSize: 16,
      } as BorderElementData,
    });
  };

  const handleApplyPalette = (paletteId: string) => {
    const palette = PRESET_PALETTES.find((p) => p.id === paletteId);
    if (palette && projectId) {
      updatePalette(projectId, palette);
    }
  };

  const handleBatchReplace = () => {
    if (batchFind) {
      batchUpdateText(batchFind, batchReplace);
      setBatchFind('');
      setBatchReplace('');
    }
  };

  const handleSaveVersion = () => {
    if (versionName && projectId) {
      saveVersion(projectId, versionName);
      setVersionName('');
      setShowVersionModal(false);
    }
  };

  const handleAddComment = () => {
    if (commentText && commentPosition && projectId) {
      addComment(projectId, {
        content: commentText,
        position: commentPosition,
        author: '我',
        avatar: '',
        resolved: false,
      });
      setCommentText('');
      setCommentPosition(null);
      setShowCommentMode(false);
    }
  };

  const handleAddCollaborator = () => {
    if (collabEmail && projectId) {
      const colors = ['#FF6B9D', '#64FFDA', '#FFE66D', '#C77DFF'];
      addCollaborator(projectId, {
        name: collabEmail.split('@')[0] || '协作者',
        avatar: '',
        role: 'editor',
      });
      setCollabEmail('');
      setShowCollabModal(false);
    }
  };

  const handleDoubleClick = (element: CanvasElement) => {
    if (element.type === 'text') {
      const newContent = prompt('编辑文字内容:', (element.data as TextElementData).content);
      if (newContent !== null) {
        updateElement(element.id, {
          data: { ...element.data, content: newContent } as TextElementData,
        });
      }
    }
  };

  const getCurrentRatio = () => CANVAS_RATIOS.find((r) => r.id === ratio) || CANVAS_RATIOS[0];

  const groupedRatios = CANVAS_RATIOS.reduce((acc, r) => {
    const group = r.platform || '通用';
    if (!acc[group]) acc[group] = [];
    acc[group].push(r);
    return acc;
  }, {} as Record<string, typeof CANVAS_RATIOS>);

  const renderElement = (element: CanvasElement) => {
    const isSelected = element.id === selectedId;
    const scale = displayScale;
    const commonTransform = `translate(${element.x * scale}px, ${element.y * scale}px) rotate(${element.rotation}deg)`;

    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: element.width * scale,
      height: element.height * scale,
      transform: commonTransform,
      cursor: element.locked ? 'not-allowed' : 'move',
      opacity: element.visible ? (element.opacity ?? 100) / 100 : 0.3,
      zIndex: element.layer,
      display: element.visible ? 'block' : 'none',
    };

    const renderContent = () => {
      switch (element.type) {
        case 'text': {
          const data = element.data as TextElementData;
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
                wordBreak: 'break-word',
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
          const data = element.data as ShapeElementData;
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
          if (data.shape === 'pixel-border') {
            return (
              <div
                className="w-full h-full relative"
                style={{
                  backgroundColor: data.fill,
                  border: `${data.strokeWidth * scale}px solid ${data.stroke}`,
                  boxShadow: `${4 * scale}px ${4 * scale}px 0 0 ${data.stroke}`,
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
              }}
            />
          );
        }
        case 'border': {
          const data = element.data as BorderElementData;
          const borderStyles: React.CSSProperties = {};

          if (data.style === 'solid') {
            borderStyles.border = `${data.thickness * scale}px solid ${data.color}`;
          } else if (data.style === 'double') {
            borderStyles.border = `${data.thickness * scale}px double ${data.color}`;
          } else if (data.style === 'retro') {
            borderStyles.border = `${data.thickness * scale}px solid ${data.color}`;
            borderStyles.boxShadow = `inset 0 0 0 ${data.thickness * scale}px #0D0B1F, ${data.thickness * scale}px ${data.thickness * scale}px 0 0 ${data.color}`;
          } else if (data.style === 'neon') {
            borderStyles.border = `${data.thickness * scale}px solid ${data.color}`;
            borderStyles.boxShadow = `0 0 ${10 * scale}px ${data.color}, 0 0 ${20 * scale}px ${data.color}, inset 0 0 ${10 * scale}px ${data.color}`;
          }

          borderStyles.borderRadius = `${data.cornerSize * scale}px`;
          return <div className="w-full h-full" style={borderStyles} />;
        }
        default:
          return null;
      }
    };

    return (
      <div
        key={element.id}
        style={baseStyle}
        onMouseDown={(e) => {
          e.stopPropagation();
          handleCanvasMouseDown(e, element.id);
        }}
        onDoubleClick={() => handleDoubleClick(element)}
      >
        {renderContent()}
        {isSelected && !element.locked && (
          <>
            <div className="absolute inset-0 border-2 border-pixel-neon-cyan pointer-events-none" style={{ boxShadow: '0 0 10px rgba(100, 255, 218, 0.5)' }} />
            {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((handle) => (
              <div
                key={handle}
                className="absolute w-3 h-3 bg-pixel-neon-cyan border-2 border-pixel-bg cursor-pointer"
                style={{
                  left: handle.includes('w') ? -6 : handle.includes('e') ? 'auto' : '50%',
                  right: handle.includes('e') ? -6 : undefined,
                  top: handle.includes('n') ? -6 : handle.includes('s') ? 'auto' : '50%',
                  bottom: handle.includes('s') ? -6 : undefined,
                  transform: handle.length === 1 ? (handle === 'n' || handle === 's' ? 'translateX(-50%)' : 'translateY(-50%)') : 'none',
                  cursor: `${handle}-resize`,
                }}
                onMouseDown={(e) => handleResizeStart(e, handle)}
              />
            ))}
            <div
              className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-pixel-neon-pink border-2 border-pixel-bg rounded-full cursor-crosshair"
              onMouseDown={(e) => {
                e.stopPropagation();
                const startAngle = Math.atan2(
                  e.clientY - (canvasRef.current?.getBoundingClientRect().top || 0) - (element.y + element.height / 2) * scale,
                  e.clientX - (canvasRef.current?.getBoundingClientRect().left || 0) - (element.x + element.width / 2) * scale
                );
                const handleRotate = (moveE: MouseEvent) => {
                  const angle = Math.atan2(
                    moveE.clientY - (canvasRef.current?.getBoundingClientRect().top || 0) - (element.y + element.height / 2) * scale,
                    moveE.clientX - (canvasRef.current?.getBoundingClientRect().left || 0) - (element.x + element.width / 2) * scale
                  );
                  const delta = (angle - startAngle) * (180 / Math.PI);
                  updateElement(element.id, { rotation: Math.round(element.rotation + delta) });
                };
                const handleUp = () => {
                  window.removeEventListener('mousemove', handleRotate);
                  window.removeEventListener('mouseup', handleUp);
                  useCanvasStore.getState().saveState();
                };
                window.addEventListener('mousemove', handleRotate);
                window.addEventListener('mouseup', handleUp);
              }}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-pixel-bg overflow-hidden">
      <div className="h-14 bg-pixel-surface border-b-4 border-pixel-border flex items-center px-4 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-pixel-neon-pink text-pixel-sm pixel-text-shadow">PIXEL</span>
          <span className="text-pixel-neon-cyan text-pixel-sm pixel-text-shadow">STUDIO</span>
        </div>

        <div className="h-8 w-px bg-pixel-border mx-2" />

        <div className="relative">
          <PixelButton
            size="sm"
            variant="default"
            onClick={() => setShowRatioDropdown(!showRatioDropdown)}
          >
            <span className="flex items-center gap-2">
              {getCurrentRatio().name}
              <span className="text-pixel-text-muted">▼</span>
            </span>
          </PixelButton>
          <AnimatePresence>
            {showRatioDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-2 w-64 bg-pixel-card border-4 border-pixel-border z-50 max-h-96 overflow-y-auto"
                style={{ boxShadow: '4px 4px 0 0 #0D0B1F' }}
              >
                {Object.entries(groupedRatios).map(([group, ratios]) => (
                  <div key={group}>
                    <div className="px-3 py-2 bg-pixel-surface text-pixel-xs text-pixel-neon-pink font-pixel border-b-2 border-pixel-border">
                      {group}
                    </div>
                    {ratios.map((r) => (
                      <button
                        key={r.id}
                        className={cn(
                          'w-full px-3 py-2 text-left text-vt-base hover:bg-pixel-surface transition-colors border-b border-pixel-border/30',
                          ratio === r.id && 'bg-pixel-surface text-pixel-neon-cyan'
                        )}
                        onClick={() => {
                          setRatio(r.id);
                          setShowRatioDropdown(false);
                        }}
                      >
                        <span>{r.name}</span>
                        <span className="text-pixel-text-muted text-sm ml-2">
                          {r.width}×{r.height}
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1">
          <PixelButton size="sm" variant="ghost" onClick={undo} title="撤销">
            ↶
          </PixelButton>
          <PixelButton size="sm" variant="ghost" onClick={redo} title="重做">
            ↷
          </PixelButton>
        </div>

        <div className="flex items-center gap-1 bg-pixel-card border-2 border-pixel-border px-2 py-1">
          <button
            className="w-6 h-6 text-pixel-text-muted hover:text-pixel-text-primary transition-colors"
            onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
          >
            −
          </button>
          <span className="text-vt-sm text-pixel-text-primary w-16 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            className="w-6 h-6 text-pixel-text-muted hover:text-pixel-text-primary transition-colors"
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
          >
            +
          </button>
        </div>

        <PixelButton
          size="sm"
          variant={gridVisible ? 'secondary' : 'ghost'}
          onClick={toggleGrid}
        >
          <span className="flex items-center gap-1">
            <span className="text-lg">⊞</span>
            网格
          </span>
        </PixelButton>

        <div className="flex-1" />

        <PixelButton size="sm" variant="default" onClick={() => setShowCommentMode(!showCommentMode)} className={showCommentMode ? 'ring-2 ring-pixel-neon-yellow' : ''}>
          💬 评论
        </PixelButton>

        <PixelButton size="sm" variant="default" onClick={() => setShowCollabModal(true)}>
          👥 协作
        </PixelButton>

        <PixelButton size="sm" variant="warning" onClick={() => setShowVersionModal(true)}>
          💾 保存版本
        </PixelButton>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 bg-pixel-surface border-r-4 border-pixel-border flex flex-col">
          <div className="flex border-b-4 border-pixel-border">
            {(['elements', 'layers'] as const).map((tab) => (
              <button
                key={tab}
                className={cn(
                  'flex-1 py-2 text-pixel-xs font-pixel transition-colors',
                  activeLeftTab === tab
                    ? 'bg-pixel-card text-pixel-neon-pink'
                    : 'text-pixel-text-muted hover:text-pixel-text-primary'
                )}
                onClick={() => setActiveLeftTab(tab)}
              >
                {tab === 'elements' ? '元素' : '图层'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {activeLeftTab === 'elements' ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-pixel-xs text-pixel-neon-cyan mb-2 font-pixel">添加元素</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <PixelButton size="sm" variant="default" onClick={handleAddText} className="flex flex-col items-center py-3">
                      <span className="text-xl mb-1">T</span>
                      <span className="text-pixel-xs">文字</span>
                    </PixelButton>
                    <PixelButton size="sm" variant="default" onClick={handleAddImage} className="flex flex-col items-center py-3">
                      <span className="text-xl mb-1">🖼</span>
                      <span className="text-pixel-xs">图片</span>
                    </PixelButton>
                  </div>
                </div>

                <div>
                  <h3 className="text-pixel-xs text-pixel-neon-cyan mb-2 font-pixel">形状</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <PixelButton size="sm" variant="default" onClick={() => handleAddShape('rectangle')} className="flex flex-col items-center py-2">
                      <span className="text-lg">⬜</span>
                      <span className="text-pixel-xs">矩形</span>
                    </PixelButton>
                    <PixelButton size="sm" variant="default" onClick={() => handleAddShape('circle')} className="flex flex-col items-center py-2">
                      <span className="text-lg">⭕</span>
                      <span className="text-pixel-xs">圆形</span>
                    </PixelButton>
                    <PixelButton size="sm" variant="default" onClick={() => handleAddShape('pixel-border')} className="flex flex-col items-center py-2">
                      <span className="text-lg">▣</span>
                      <span className="text-pixel-xs">像素</span>
                    </PixelButton>
                  </div>
                </div>

                <div>
                  <h3 className="text-pixel-xs text-pixel-neon-cyan mb-2 font-pixel">边框</h3>
                  <PixelButton size="sm" variant="default" onClick={handleAddBorder} className="w-full flex items-center justify-center gap-2 py-3">
                    <span className="text-lg">🔲</span>
                    <span className="text-pixel-xs">添加像素边框</span>
                  </PixelButton>
                </div>

                <div>
                  <h3 className="text-pixel-xs text-pixel-neon-cyan mb-2 font-pixel">批量替换</h3>
                  <PixelCard hover={false} className="p-3">
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="查找文字..."
                        className="input-pixel text-sm"
                        value={batchFind}
                        onChange={(e) => setBatchFind(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="替换为..."
                        className="input-pixel text-sm"
                        value={batchReplace}
                        onChange={(e) => setBatchReplace(e.target.value)}
                      />
                      <PixelButton
                        size="sm"
                        variant="primary"
                        onClick={handleBatchReplace}
                        disabled={!batchFind}
                        className="w-full"
                      >
                        替换全部
                      </PixelButton>
                    </div>
                  </PixelCard>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {[...elements].sort((a, b) => b.layer - a.layer).map((element) => (
                  <motion.div
                    key={element.id}
                    className={cn(
                      'p-2 border-2 cursor-pointer transition-all',
                      selectedId === element.id
                        ? 'bg-pixel-card border-pixel-neon-cyan'
                        : 'bg-pixel-surface border-pixel-border hover:border-pixel-text-muted'
                    )}
                    onClick={() => selectElement(element.id)}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {element.type === 'text' && 'T'}
                        {element.type === 'image' && '🖼'}
                        {element.type === 'shape' && '⬜'}
                        {element.type === 'border' && '🔲'}
                      </span>
                      <span className="flex-1 text-vt-sm truncate">
                        {element.type === 'text' ? (element.data as TextElementData).content : element.type}
                      </span>
                      <div className="flex gap-1">
                        <button
                          className="w-5 h-5 text-xs hover:text-pixel-neon-cyan transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateElement(element.id, { visible: !element.visible });
                          }}
                        >
                          {element.visible ? '👁' : '👁‍🗨'}
                        </button>
                        <button
                          className="w-5 h-5 text-xs hover:text-pixel-neon-yellow transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateElement(element.id, { locked: !element.locked });
                          }}
                        >
                          {element.locked ? '🔒' : '🔓'}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-1 justify-end">
                      <button
                        className="px-2 py-1 text-pixel-xs bg-pixel-surface hover:bg-pixel-border transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          bringForward(element.id);
                        }}
                      >
                        ↑
                      </button>
                      <button
                        className="px-2 py-1 text-pixel-xs bg-pixel-surface hover:bg-pixel-border transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          sendBackward(element.id);
                        }}
                      >
                        ↓
                      </button>
                      <button
                        className="px-2 py-1 text-pixel-xs bg-pixel-surface hover:bg-red-900 text-red-400 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteElement(element.id);
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  </motion.div>
                ))}
                {elements.length === 0 && (
                  <div className="text-center py-8 text-pixel-text-muted">
                    <div className="text-4xl mb-2">📋</div>
                    <div className="text-vt-base">暂无图层</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 overflow-auto bg-pixel-bg relative">
          <div
            className="absolute inset-0 opacity-20 pixel-grid-bg"
            style={{ backgroundSize: `${16 * displayScale}px ${16 * displayScale}px` }}
          />

          {showCommentMode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-pixel-neon-yellow text-pixel-bg px-4 py-2 font-pixel text-pixel-xs animate-pulse">
              点击画布添加评论点
            </div>
          )}

          <div
            ref={canvasRef}
            className={cn(
              'relative bg-pixel-card border-4 border-pixel-border',
              showCommentMode && 'cursor-crosshair'
            )}
            style={{
              width: displayWidth,
              height: displayHeight,
              boxShadow: '8px 8px 0 0 #0D0B1F, 0 0 40px rgba(255, 107, 157, 0.2)',
            }}
            onMouseDown={(e) => handleCanvasMouseDown(e)}
          >
            {gridVisible && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(74, 58, 107, 0.5) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(74, 58, 107, 0.5) 1px, transparent 1px)
                  `,
                  backgroundSize: `${16 * displayScale}px ${16 * displayScale}px`,
                }}
              />
            )}

            {elements.map(renderElement)}

            {currentProject?.comments.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  'absolute w-6 h-6 flex items-center justify-center text-xs cursor-pointer z-40 transition-transform hover:scale-125',
                  comment.resolved ? 'bg-green-500' : 'bg-pixel-neon-yellow'
                )}
                style={{
                  left: comment.position.x * displayScale - 12,
                  top: comment.position.y * displayScale - 12,
                  border: '2px solid #0D0B1F',
                }}
                title={comment.content}
              >
                {comment.resolved ? '✓' : '!'}
              </div>
            ))}

            {commentPosition && (
              <div className="absolute z-50" style={{ left: commentPosition.x * displayScale, top: commentPosition.y * displayScale }}>
                <PixelCard className="p-3 w-64">
                  <textarea
                    className="input-pixel text-sm h-20 resize-none mb-2"
                    placeholder="输入评论内容..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <PixelButton size="sm" variant="primary" onClick={handleAddComment} disabled={!commentText} className="flex-1">
                      添加
                    </PixelButton>
                    <PixelButton
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setCommentPosition(null);
                        setCommentText('');
                        setShowCommentMode(false);
                      }}
                    >
                      取消
                    </PixelButton>
                  </div>
                </PixelCard>
              </div>
            )}
          </div>

          <div className="absolute bottom-4 right-4 text-vt-sm text-pixel-text-muted">
            {canvasWidth} × {canvasHeight}px | {ratio}
          </div>
        </div>

        <div className="w-72 bg-pixel-surface border-l-4 border-pixel-border flex flex-col">
          <div className="flex border-b-4 border-pixel-border">
            {(['properties', 'text', 'palette', 'border'] as const).map((tab) => (
              <button
                key={tab}
                className={cn(
                  'flex-1 py-2 text-pixel-xs font-pixel transition-colors',
                  activeRightTab === tab
                    ? 'bg-pixel-card text-pixel-neon-cyan'
                    : 'text-pixel-text-muted hover:text-pixel-text-primary'
                )}
                onClick={() => setActiveRightTab(tab)}
              >
                {tab === 'properties' && '属性'}
                {tab === 'text' && '文字'}
                {tab === 'palette' && '调色板'}
                {tab === 'border' && '边框'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {activeRightTab === 'properties' && (
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
                            onChange={(e) => updateElement(selectedId!, { x: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <label className="text-pixel-xs text-pixel-text-muted block mb-1">Y</label>
                          <input
                            type="number"
                            className="input-pixel text-sm"
                            value={selectedElement.y}
                            onChange={(e) => updateElement(selectedId!, { y: parseInt(e.target.value) || 0 })}
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
                            onChange={(e) => resizeElement(selectedId!, parseInt(e.target.value) || 20, selectedElement.height)}
                          />
                        </div>
                        <div>
                          <label className="text-pixel-xs text-pixel-text-muted block mb-1">高</label>
                          <input
                            type="number"
                            className="input-pixel text-sm"
                            value={selectedElement.height}
                            onChange={(e) => resizeElement(selectedId!, selectedElement.width, parseInt(e.target.value) || 20)}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-pixel-xs text-pixel-neon-pink mb-2 font-pixel">变换</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-pixel-xs text-pixel-text-muted block mb-1">旋转</label>
                          <input
                            type="number"
                            className="input-pixel text-sm"
                            value={selectedElement.rotation}
                            onChange={(e) => updateElement(selectedId!, { rotation: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <label className="text-pixel-xs text-pixel-text-muted block mb-1">透明度</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            className="w-full accent-pixel-neon-pink"
                            value={selectedElement.opacity !== undefined ? selectedElement.opacity : 100}
                            onChange={(e) => updateElement(selectedId!, { opacity: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>

                    <PixelButton
                      size="sm"
                      variant="danger"
                      onClick={() => deleteElement(selectedId!)}
                      className="w-full"
                    >
                      删除元素
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

            {activeRightTab === 'text' && (
              <div className="space-y-4">
                {selectedElement?.type === 'text' ? (
                  <>
                    <div>
                      <h3 className="text-pixel-xs text-pixel-neon-pink mb-2 font-pixel">字体</h3>
                      <select
                        className="input-pixel text-sm"
                        value={(selectedElement.data as TextElementData).fontFamily}
                        onChange={(e) =>
                          updateElement(selectedId!, {
                            data: { ...selectedElement.data, fontFamily: e.target.value } as TextElementData,
                          })
                        }
                      >
                        <option value="Press Start 2P">Press Start 2P</option>
                        <option value="VT323">VT323</option>
                        <option value="Zpix">Zpix</option>
                      </select>
                    </div>

                    <div>
                      <h3 className="text-pixel-xs text-pixel-neon-pink mb-2 font-pixel">字号</h3>
                      <input
                        type="number"
                        className="input-pixel text-sm"
                        value={(selectedElement.data as TextElementData).fontSize}
                        onChange={(e) =>
                          updateElement(selectedId!, {
                            data: { ...selectedElement.data, fontSize: parseInt(e.target.value) || 12 } as TextElementData,
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
                          value={(selectedElement.data as TextElementData).color}
                          onChange={(e) =>
                            updateElement(selectedId!, {
                              data: { ...selectedElement.data, color: e.target.value } as TextElementData,
                            })
                          }
                        />
                        <input
                          type="text"
                          className="input-pixel text-sm flex-1"
                          value={(selectedElement.data as TextElementData).color}
                          onChange={(e) =>
                            updateElement(selectedId!, {
                              data: { ...selectedElement.data, color: e.target.value } as TextElementData,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-pixel-xs text-pixel-neon-pink mb-2 font-pixel">描边</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-pixel-xs text-pixel-text-muted block mb-1">颜色</label>
                          <input
                            type="color"
                            className="w-full h-10 border-2 border-pixel-border cursor-pointer"
                            value={(selectedElement.data as TextElementData).strokeColor || '#000000'}
                            onChange={(e) =>
                              updateElement(selectedId!, {
                                data: { ...selectedElement.data, strokeColor: e.target.value } as TextElementData,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-pixel-xs text-pixel-text-muted block mb-1">宽度</label>
                          <input
                            type="number"
                            className="input-pixel text-sm"
                            value={(selectedElement.data as TextElementData).strokeWidth || 0}
                            onChange={(e) =>
                              updateElement(selectedId!, {
                                data: { ...selectedElement.data, strokeWidth: parseInt(e.target.value) || 0 } as TextElementData,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-pixel-xs text-pixel-neon-pink mb-2 font-pixel">内容</h3>
                      <textarea
                        className="input-pixel text-sm h-24 resize-none"
                        value={(selectedElement.data as TextElementData).content}
                        onChange={(e) =>
                          updateElement(selectedId!, {
                            data: { ...selectedElement.data, content: e.target.value } as TextElementData,
                          })
                        }
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-pixel-text-muted">
                    <div className="text-4xl mb-2">✏️</div>
                    <div className="text-vt-base">选择文字元素</div>
                    <div className="text-vt-sm mt-1">以编辑文字样式</div>
                  </div>
                )}
              </div>
            )}

            {activeRightTab === 'palette' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-pixel-xs text-pixel-neon-pink mb-2 font-pixel">预设调色板</h3>
                  <div className="space-y-2">
                    {PRESET_PALETTES.map((palette) => (
                      <motion.div
                        key={palette.id}
                        className={cn(
                          'p-2 border-2 cursor-pointer transition-all',
                          currentProject?.palette.id === palette.id
                            ? 'border-pixel-neon-cyan bg-pixel-card'
                            : 'border-pixel-border hover:border-pixel-text-muted'
                        )}
                        onClick={() => handleApplyPalette(palette.id)}
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-vt-sm">{palette.name}</span>
                          {currentProject?.palette.id === palette.id && (
                            <span className="text-pixel-neon-cyan text-xs">✓</span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {palette.colors.map((color, i) => (
                            <div
                              key={i}
                              className="flex-1 h-6 border-2 border-pixel-bg"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-pixel-xs text-pixel-neon-pink mb-2 font-pixel">当前调色板</h3>
                  <PixelCard hover={false} className="p-3">
                    <div className="flex gap-2 mb-2">
                      {currentProject?.palette.colors.map((color, i) => (
                        <input
                          key={i}
                          type="color"
                          className="flex-1 h-10 border-2 border-pixel-border cursor-pointer"
                          value={color}
                          onChange={(e) => {
                            if (currentProject) {
                              const newColors = [...currentProject.palette.colors];
                              newColors[i] = e.target.value;
                              updatePalette(currentProject.id, {
                                ...currentProject.palette,
                                colors: newColors,
                              });
                            }
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {currentProject?.palette.colors.map((color, i) => (
                        <div
                          key={i}
                          className="flex-1 text-center text-pixel-xs text-pixel-text-muted font-mono"
                        >
                          {color.toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </PixelCard>
                </div>

                {currentProject?.palette.colors.map((color, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-8 h-8 border-2 border-pixel-border" style={{ backgroundColor: color }} />
                    <span className="text-vt-sm text-pixel-text-muted">{color}</span>
                    <PixelButton
                      size="sm"
                      variant="ghost"
                      className="ml-auto"
                      onClick={() => {
                        if (selectedElement) {
                          if (selectedElement.type === 'text') {
                            updateElement(selectedId!, {
                              data: { ...selectedElement.data, color } as TextElementData,
                            });
                          } else if (selectedElement.type === 'shape') {
                            updateElement(selectedId!, {
                              data: { ...selectedElement.data, fill: color } as ShapeElementData,
                            });
                          } else if (selectedElement.type === 'border') {
                            updateElement(selectedId!, {
                              data: { ...selectedElement.data, color } as BorderElementData,
                            });
                          }
                        }
                      }}
                      disabled={!selectedElement}
                    >
                      应用
                    </PixelButton>
                  </div>
                ))}
              </div>
            )}

            {activeRightTab === 'border' && (
              <div className="space-y-4">
                {selectedElement?.type === 'border' ? (
                  <>
                    <div>
                      <h3 className="text-pixel-xs text-pixel-neon-pink mb-2 font-pixel">边框样式</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {(['solid', 'double', 'retro', 'neon'] as const).map((style) => (
                          <button
                            key={style}
                            className={cn(
                              'p-3 border-2 transition-all text-vt-sm',
                              (selectedElement.data as BorderElementData).style === style
                                ? 'border-pixel-neon-cyan bg-pixel-card text-pixel-neon-cyan'
                                : 'border-pixel-border hover:border-pixel-text-muted'
                            )}
                            onClick={() =>
                              updateElement(selectedId!, {
                                data: { ...selectedElement.data, style } as BorderElementData,
                              })
                            }
                          >
                            {style === 'solid' && '实线'}
                            {style === 'double' && '双线'}
                            {style === 'retro' && '复古'}
                            {style === 'neon' && '霓虹'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-pixel-xs text-pixel-neon-pink mb-2 font-pixel">颜色</h3>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          className="w-12 h-10 border-2 border-pixel-border cursor-pointer"
                          value={(selectedElement.data as BorderElementData).color}
                          onChange={(e) =>
                            updateElement(selectedId!, {
                              data: { ...selectedElement.data, color: e.target.value } as BorderElementData,
                            })
                          }
                        />
                        <input
                          type="text"
                          className="input-pixel text-sm flex-1"
                          value={(selectedElement.data as BorderElementData).color}
                          onChange={(e) =>
                            updateElement(selectedId!, {
                              data: { ...selectedElement.data, color: e.target.value } as BorderElementData,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-pixel-xs text-pixel-neon-pink mb-2 font-pixel">厚度</h3>
                      <input
                        type="range"
                        min="1"
                        max="32"
                        className="w-full accent-pixel-neon-pink"
                        value={(selectedElement.data as BorderElementData).thickness}
                        onChange={(e) =>
                          updateElement(selectedId!, {
                            data: { ...selectedElement.data, thickness: parseInt(e.target.value) } as BorderElementData,
                          })
                        }
                      />
                      <div className="text-center text-vt-sm text-pixel-text-muted mt-1">
                        {(selectedElement.data as BorderElementData).thickness}px
                      </div>
                    </div>

                    <div>
                      <h3 className="text-pixel-xs text-pixel-neon-pink mb-2 font-pixel">圆角</h3>
                      <input
                        type="range"
                        min="0"
                        max="64"
                        className="w-full accent-pixel-neon-cyan"
                        value={(selectedElement.data as BorderElementData).cornerSize}
                        onChange={(e) =>
                          updateElement(selectedId!, {
                            data: { ...selectedElement.data, cornerSize: parseInt(e.target.value) } as BorderElementData,
                          })
                        }
                      />
                      <div className="text-center text-vt-sm text-pixel-text-muted mt-1">
                        {(selectedElement.data as BorderElementData).cornerSize}px
                      </div>
                    </div>

                    <PixelCard hover={false} className="p-4">
                      <div className="text-center text-pixel-xs text-pixel-text-muted mb-2 font-pixel">预览</div>
                      <div
                        className="h-20 mx-auto max-w-xs"
                        style={{
                          border: `${(selectedElement.data as BorderElementData).thickness}px ${(selectedElement.data as BorderElementData).style} ${(selectedElement.data as BorderElementData).color}`,
                          borderRadius: `${(selectedElement.data as BorderElementData).cornerSize}px`,
                          boxShadow: (selectedElement.data as BorderElementData).style === 'neon'
                            ? `0 0 10px ${(selectedElement.data as BorderElementData).color}, 0 0 20px ${(selectedElement.data as BorderElementData).color}`
                            : (selectedElement.data as BorderElementData).style === 'retro'
                            ? `inset 0 0 0 ${(selectedElement.data as BorderElementData).thickness}px #0D0B1F, ${(selectedElement.data as BorderElementData).thickness}px ${(selectedElement.data as BorderElementData).thickness}px 0 0 ${(selectedElement.data as BorderElementData).color}`
                            : undefined,
                        }}
                      />
                    </PixelCard>
                  </>
                ) : (
                  <div className="text-center py-8 text-pixel-text-muted">
                    <div className="text-4xl mb-2">🔲</div>
                    <div className="text-vt-base">选择边框元素</div>
                    <div className="text-vt-sm mt-1">以编辑边框样式</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showVersionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setShowVersionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <PixelCard hover={false} className="p-6 w-96">
                <h2 className="text-pixel-lg text-pixel-neon-pink mb-4 font-pixel pixel-text-shadow">保存版本</h2>
                <input
                  type="text"
                  placeholder="版本名称..."
                  className="input-pixel mb-4"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <PixelButton size="sm" variant="ghost" onClick={() => setShowVersionModal(false)}>
                    取消
                  </PixelButton>
                  <PixelButton size="sm" variant="primary" onClick={handleSaveVersion} disabled={!versionName}>
                    保存
                  </PixelButton>
                </div>

                {currentProject?.versions && currentProject.versions.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-pixel-xs text-pixel-neon-cyan mb-2 font-pixel">历史版本</h3>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {currentProject.versions.slice().reverse().map((v) => (
                        <div key={v.id} className="p-2 bg-pixel-surface border-2 border-pixel-border">
                          <div className="flex justify-between items-center">
                            <span className="text-vt-sm">{v.name}</span>
                            <span className="text-pixel-xs text-pixel-text-muted">{v.author}</span>
                          </div>
                          <div className="text-pixel-xs text-pixel-text-muted mt-1">
                            {new Date(v.createdAt).toLocaleString('zh-CN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </PixelCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCollabModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setShowCollabModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <PixelCard hover={false} className="p-6 w-96">
                <h2 className="text-pixel-lg text-pixel-neon-cyan mb-4 font-pixel pixel-text-shadow">邀请协作</h2>
                <input
                  type="email"
                  placeholder="输入协作者邮箱..."
                  className="input-pixel mb-4"
                  value={collabEmail}
                  onChange={(e) => setCollabEmail(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <PixelButton size="sm" variant="ghost" onClick={() => setShowCollabModal(false)}>
                    取消
                  </PixelButton>
                  <PixelButton size="sm" variant="secondary" onClick={handleAddCollaborator} disabled={!collabEmail}>
                    发送邀请
                  </PixelButton>
                </div>

                {currentProject?.collaborators && currentProject.collaborators.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-pixel-xs text-pixel-neon-pink mb-2 font-pixel">协作者</h3>
                    <div className="space-y-2">
                      {currentProject.collaborators.map((c) => (
                        <div key={c.id} className="p-2 bg-pixel-surface border-2 border-pixel-border flex items-center gap-3">
                          <div className="w-8 h-8 bg-pixel-neon-pink flex items-center justify-center text-pixel-xs font-pixel border-2 border-pixel-bg">
                            {c.name[0].toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="text-vt-sm">{c.name}</div>
                            <div className="text-pixel-xs text-pixel-text-muted">
                              {c.role === 'owner' && '所有者'}
                              {c.role === 'editor' && '编辑者'}
                              {c.role === 'viewer' && '查看者'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </PixelCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showRatioDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowRatioDropdown(false)} />
      )}
    </div>
  );
};

export default PosterEditor;
