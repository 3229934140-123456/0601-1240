import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Download,
  RotateCcw,
  Save,
  Wand2,
  Type,
  Image,
  Shield,
  XCircle,
  Ruler,
  Monitor,
  Smartphone,
  Share2,
  Sparkles,
  Zap,
  Copy,
  Check,
  GripVertical,
} from 'lucide-react';
import PixelButton from '@/components/ui/PixelButton';
import PixelCard from '@/components/ui/PixelCard';
import { useProjectStore } from '@/store/projectStore';
import { PRESET_PALETTES } from '@/data/palettes';
import type { ColorPalette } from '@/types';
import { cn } from '@/lib/utils';

const LOGO_ICONS = [
  { id: 'gamepad', name: '游戏手柄', char: '🎮' },
  { id: 'controller', name: '控制器', char: '🕹️' },
  { id: 'star', name: '星星', char: '⭐' },
  { id: 'pixel', name: '像素', char: '👾' },
  { id: 'rocket', name: '火箭', char: '🚀' },
  { id: 'diamond', name: '钻石', char: '💎' },
  { id: 'crown', name: '皇冠', char: '👑' },
  { id: 'fire', name: '火焰', char: '🔥' },
];

const FONT_SIZES = [
  { name: '超小', size: 8, usage: '辅助文字、版权信息' },
  { name: '小', size: 10, usage: '正文、标签' },
  { name: '中', size: 12, usage: '小标题、按钮' },
  { name: '大', size: 16, usage: '大标题' },
  { name: '超大', size: 24, usage: '页面标题' },
  { name: '巨型', size: 32, usage: 'Hero 标题' },
];

export default function Brand() {
  const { projects, currentProjectId, updatePalette, getCurrentProject } = useProjectStore();
  const currentProject = getCurrentProject();

  const [selectedPalette, setSelectedPalette] = useState<ColorPalette>(
    currentProject?.palette || PRESET_PALETTES[0]
  );
  const [customColors, setCustomColors] = useState<string[]>(
    currentProject?.palette.colors || PRESET_PALETTES[0].colors
  );
  const [logoText, setLogoText] = useState('PIXELFORGE');
  const [selectedIcon, setSelectedIcon] = useState(LOGO_ICONS[0]);
  const [effects, setEffects] = useState({
    pixelBorder: true,
    neonGlow: true,
    scanline: false,
  });
  const [draggedColorIndex, setDraggedColorIndex] = useState<number | null>(null);
  const [flippedCard, setFlippedCard] = useState<number | null>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handlePresetSelect = (palette: ColorPalette) => {
    setSelectedPalette(palette);
    setCustomColors([...palette.colors]);
  };

  const handleColorChange = (index: number, color: string) => {
    const newColors = [...customColors];
    newColors[index] = color;
    setCustomColors(newColors);
    setSelectedPalette({
      ...selectedPalette,
      id: 'custom',
      name: '自定义',
      colors: newColors,
    });
  };

  const handleSavePalette = () => {
    if (currentProjectId) {
      const newPalette: ColorPalette = {
        ...selectedPalette,
        colors: customColors,
      };
      updatePalette(currentProjectId, newPalette);
    }
  };

  const handleResetPalette = () => {
    const original = currentProject?.palette || PRESET_PALETTES[0];
    setSelectedPalette(original);
    setCustomColors([...original.colors]);
  };

  const handleExportPalette = () => {
    const paletteData = {
      name: selectedPalette.name,
      colors: customColors,
      css: customColors.map((c, i) => `--color-${i + 1}: ${c};`).join('\n'),
    };
    const blob = new Blob([JSON.stringify(paletteData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPalette.name}-palette.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyToAll = () => {
    projects.forEach((project) => {
      updatePalette(project.id, {
        ...selectedPalette,
        colors: customColors,
      });
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedColorIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedColorIndex === null || draggedColorIndex === index) return;

    const newColors = [...customColors];
    const [draggedColor] = newColors.splice(draggedColorIndex, 1);
    newColors.splice(index, 0, draggedColor);
    setCustomColors(newColors);
    setDraggedColorIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedColorIndex(null);
  };

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const LogoPreview = ({
    variant = 'main',
    size = 'md',
  }: {
    variant?: 'main' | 'simplified' | 'mono' | 'inverted';
    size?: 'sm' | 'md' | 'lg';
  }) => {
    const sizeClasses = {
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
    };

    const textSizes = {
      sm: 'text-pixel-xs',
      md: 'text-pixel-sm',
      lg: 'text-pixel-base',
    };

    const getColors = () => {
      if (variant === 'mono') {
        return { bg: 'bg-pixel-bg', text: '#F5F3FF', border: '#F5F3FF' };
      }
      if (variant === 'inverted') {
        return { bg: 'bg-pixel-text-primary', text: '#0D0B1F', border: '#0D0B1F' };
      }
      return {
        bg: 'bg-pixel-card',
        text: customColors[0],
        border: customColors[1],
      };
    };

    const colors = getColors();
    const displayIcon = variant !== 'simplified';
    const displayText = variant !== 'simplified';

    return (
      <motion.div
        className={cn(
          'relative inline-flex items-center justify-center border-4',
          sizeClasses[size],
          colors.bg,
          effects.pixelBorder && 'pixel-border'
        )}
        style={{
          borderColor: colors.border,
          boxShadow: effects.neonGlow
            ? `4px 4px 0 0 #0D0B1F, 0 0 20px ${customColors[0]}40`
            : '4px 4px 0 0 #0D0B1F',
        }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        {effects.scanline && <div className="absolute inset-0 scanline-overlay pointer-events-none" />}
        <div className="relative z-10 flex items-center gap-2">
          {displayIcon && (
            <span
              className={textSizes[size]}
              style={{
                color: variant === 'inverted' ? colors.text : customColors[1],
                textShadow: effects.neonGlow ? `0 0 10px ${customColors[1]}` : 'none',
              }}
            >
              {selectedIcon.char}
            </span>
          )}
          {displayText && (
            <span
              className={cn('font-pixel', textSizes[size])}
              style={{
                color: colors.text,
                textShadow: effects.neonGlow
                  ? `0 0 10px ${colors.text}, 2px 2px 0 #0D0B1F`
                  : '2px 2px 0 #0D0B1F',
              }}
            >
              {logoText}
            </span>
          )}
          {variant === 'simplified' && (
            <div
              className="w-4 h-4"
              style={{
                backgroundColor: customColors[0],
                boxShadow: `2px 2px 0 0 ${customColors[1]}`,
              }}
            />
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-pixel-bg pixel-grid-bg">
      <header className="bg-pixel-card border-b-4 border-pixel-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 bg-pixel-bg border-4 border-pixel-neon-pink px-3 py-2">
                  <span className="text-2xl">🎮</span>
                  <div>
                    <h1 className="font-pixel text-pixel-sm text-pixel-neon-pink pixel-text-shadow">
                      {currentProject?.name || 'PIXELFORGE'}
                    </h1>
                    <p className="font-vt text-vt-sm text-pixel-text-secondary">
                      品牌套件 | Brand Kit
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="flex items-center gap-3">
              <motion.div
                className="flex items-center gap-2 bg-pixel-bg border-4 border-pixel-neon-cyan px-3 py-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex gap-1">
                  {customColors.slice(0, 5).map((color, i) => (
                    <motion.div
                      key={i}
                      className="w-6 h-6 border-2 border-pixel-bg"
                      style={{ backgroundColor: color }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    />
                  ))}
                </div>
                <span className="font-pixel text-pixel-xs text-pixel-neon-cyan">
                  当前调色板
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3 space-y-6">
            <PixelCard className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-4 h-4 text-pixel-neon-pink" />
                <h2 className="font-pixel text-pixel-sm text-pixel-text-primary">当前调色板</h2>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  {customColors.map((color, index) => (
                    <motion.div
                      key={index}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onClick={() => copyToClipboard(color)}
                      className={cn(
                        'flex-1 aspect-square border-4 border-pixel-bg cursor-move relative group',
                        'transition-all duration-200 hover:scale-110',
                        draggedColorIndex === index && 'opacity-50'
                      )}
                      style={{
                        backgroundColor: color,
                        boxShadow: `2px 2px 0 0 #0D0B1F`,
                      }}
                      layout
                      animate={{ scale: draggedColorIndex === index ? 1.1 : 1 }}
                      whileHover={{ y: -2 }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                        {copiedColor === color ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <Copy className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <p className="font-vt text-vt-sm text-pixel-text-secondary text-center">
                  拖放排序 | 点击复制颜色代码
                </p>
              </div>
            </PixelCard>

            <PixelCard className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-pixel-neon-cyan" />
                <h2 className="font-pixel text-pixel-sm text-pixel-text-primary">预设调色板</h2>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {PRESET_PALETTES.map((palette) => (
                  <motion.button
                    key={palette.id}
                    onClick={() => handlePresetSelect(palette)}
                    className={cn(
                      'w-full p-3 border-4 transition-all',
                      selectedPalette.id === palette.id
                        ? 'border-pixel-neon-pink bg-pixel-bg'
                        : 'border-pixel-border bg-pixel-surface hover:border-pixel-neon-cyan'
                    )}
                    whileHover={{ x: selectedPalette.id !== palette.id ? 4 : 0 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-vt text-vt-base text-pixel-text-primary">
                        {palette.name}
                      </span>
                      <div className="flex gap-1">
                        {palette.colors.slice(0, 5).map((color, i) => (
                          <motion.div
                            key={i}
                            className="w-4 h-4 border border-pixel-bg"
                            style={{ backgroundColor: color }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </PixelCard>

            <PixelCard className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-4 h-4 text-pixel-neon-yellow" />
                <h2 className="font-pixel text-pixel-sm text-pixel-text-primary">自定义颜色</h2>
              </div>
              <div className="space-y-3">
                {customColors.map((color, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="relative">
                      <GripVertical className="w-4 h-4 text-pixel-text-muted" />
                    </div>
                    <div
                      className="w-10 h-10 border-4 border-pixel-bg"
                      style={{ backgroundColor: color }}
                    />
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      className="w-10 h-10 cursor-pointer opacity-0 absolute ml-14"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={color.toUpperCase()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                            handleColorChange(index, val);
                          }
                        }}
                        className="input-pixel font-vt text-vt-base uppercase"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </PixelCard>

            <PixelCard className="p-4">
              <div className="space-y-2">
                <PixelButton
                  variant="primary"
                  size="md"
                  className="w-full"
                  onClick={handleSavePalette}
                >
                  <Save className="w-3 h-3 inline mr-2" />
                  保存调色板
                </PixelButton>
                <PixelButton
                  variant="secondary"
                  size="md"
                  className="w-full"
                  onClick={handleResetPalette}
                >
                  <RotateCcw className="w-3 h-3 inline mr-2" />
                  重置
                </PixelButton>
                <PixelButton
                  variant="default"
                  size="md"
                  className="w-full"
                  onClick={handleExportPalette}
                >
                  <Download className="w-3 h-3 inline mr-2" />
                  导出
                </PixelButton>
                <PixelButton
                  variant="warning"
                  size="md"
                  className="w-full"
                  onClick={handleApplyToAll}
                >
                  <Wand2 className="w-3 h-3 inline mr-2" />
                  批量替换到所有页面
                </PixelButton>
              </div>
            </PixelCard>
          </div>

          <div className="col-span-6 space-y-6">
            <PixelCard className="p-6" glow>
              <div className="flex items-center gap-2 mb-6">
                <Image className="w-5 h-5 text-pixel-neon-pink" />
                <h2 className="font-pixel text-pixel-base text-pixel-text-primary">
                  Logo 变体
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="font-pixel text-pixel-xs text-pixel-neon-pink mb-3">主 Logo</p>
                    <div className="flex justify-center">
                      <LogoPreview variant="main" size="lg" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="font-pixel text-pixel-xs text-pixel-neon-cyan mb-3">简化版</p>
                    <div className="flex justify-center">
                      <LogoPreview variant="simplified" size="lg" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="font-pixel text-pixel-xs text-pixel-neon-yellow mb-3">单色版</p>
                    <div className="flex justify-center">
                      <LogoPreview variant="mono" size="lg" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="font-pixel text-pixel-xs text-pixel-text-secondary mb-3">倒置版</p>
                    <div className="flex justify-center">
                      <LogoPreview variant="inverted" size="lg" />
                    </div>
                  </div>
                </div>
              </div>
            </PixelCard>

            <div className="grid grid-cols-2 gap-6">
              <PixelCard className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-pixel-neon-cyan" />
                  <h3 className="font-pixel text-pixel-sm text-pixel-text-primary">最小尺寸</h3>
                </div>
                <div className="bg-pixel-bg p-4 border-4 border-pixel-border">
                  <div className="flex items-center justify-center gap-4">
                    <div className="relative">
                      <LogoPreview variant="main" size="sm" />
                      <div className="absolute -top-2 -left-2 w-4 h-4 border-t-4 border-l-4 border-pixel-neon-pink" />
                      <div className="absolute -top-2 -right-2 w-4 h-4 border-t-4 border-r-4 border-pixel-neon-pink" />
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-4 border-l-4 border-pixel-neon-pink" />
                      <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-4 border-r-4 border-pixel-neon-pink" />
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="font-vt text-vt-base text-pixel-text-primary">最小宽度: 48px</p>
                    <p className="font-vt text-vt-sm text-pixel-text-secondary">确保 Logo 清晰可辨</p>
                  </div>
                </div>
              </PixelCard>

              <PixelCard className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Ruler className="w-4 h-4 text-pixel-neon-yellow" />
                  <h3 className="font-pixel text-pixel-sm text-pixel-text-primary">安全区域</h3>
                </div>
                <div className="bg-pixel-bg p-4 border-4 border-pixel-border">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 m-4 border-2 border-dashed border-pixel-neon-cyan opacity-50" />
                    <div className="p-8">
                      <LogoPreview variant="main" size="sm" />
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="font-vt text-vt-base text-pixel-text-primary">安全边距: 16px</p>
                    <p className="font-vt text-vt-sm text-pixel-text-secondary">等于 "P" 字母高度</p>
                  </div>
                </div>
              </PixelCard>
            </div>

            <PixelCard className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-4 h-4 text-red-400" />
                <h3 className="font-pixel text-pixel-sm text-pixel-text-primary">禁止使用方式</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    name: '扭曲变形',
                    desc: '不可拉伸或压缩',
                    icon: '↔️',
                  },
                  {
                    name: '更改颜色',
                    desc: '使用指定配色',
                    icon: '🎨',
                  },
                  {
                    name: '添加效果',
                    desc: '不可添加阴影',
                    icon: '✨',
                  },
                  {
                    name: '旋转角度',
                    desc: '保持水平方向',
                    icon: '🔄',
                  },
                  {
                    name: '更改字体',
                    desc: '使用指定字体',
                    icon: '🔤',
                  },
                  {
                    name: '修改轮廓',
                    desc: '保持原设计',
                    icon: '✏️',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-pixel-surface border-4 border-red-500/50 p-3 text-center"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <p className="font-pixel text-pixel-xs text-red-400 mt-2">{item.name}</p>
                    <p className="font-vt text-vt-sm text-pixel-text-secondary">{item.desc}</p>
                  </div>
                ))}
              </div>
            </PixelCard>

            <PixelCard className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Type className="w-5 h-5 text-pixel-neon-cyan" />
                <h2 className="font-pixel text-pixel-base text-pixel-text-primary">字体规范</h2>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-pixel-bg p-4 border-4 border-pixel-border">
                    <p className="font-pixel text-pixel-xs text-pixel-neon-pink mb-2">标题字体</p>
                    <p className="font-pixel text-pixel-lg text-pixel-text-primary pixel-text-shadow">
                      Press Start 2P
                    </p>
                    <p className="font-vt text-vt-base text-pixel-text-secondary mt-2">
                      用于标题、按钮、标签
                    </p>
                  </div>
                  <div className="bg-pixel-bg p-4 border-4 border-pixel-border">
                    <p className="font-pixel text-pixel-xs text-pixel-neon-cyan mb-2">正文字体</p>
                    <p className="font-vt text-vt-xl text-pixel-text-primary">VT323</p>
                    <p className="font-vt text-vt-base text-pixel-text-secondary mt-2">
                      用于正文、描述、说明
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-pixel text-pixel-xs text-pixel-neon-yellow mb-3">字号层级</p>
                  {FONT_SIZES.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-pixel-surface px-3 py-2 border-2 border-pixel-border"
                    >
                      <span
                        className="font-pixel text-pixel-text-primary"
                        style={{ fontSize: `${item.size}px` }}
                      >
                        Aa
                      </span>
                      <div className="text-right">
                        <p className="font-vt text-vt-base text-pixel-text-primary">
                          {item.name} ({item.size}px)
                        </p>
                        <p className="font-vt text-vt-sm text-pixel-text-secondary">{item.usage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PixelCard>

            <PixelCard className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Monitor className="w-5 h-5 text-pixel-neon-pink" />
                <h2 className="font-pixel text-pixel-base text-pixel-text-primary">应用预览</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    name: '游戏商店',
                    icon: <Smartphone className="w-5 h-5" />,
                    color: 'pink',
                    mockup: (
                      <div className="bg-pixel-surface p-3 h-40">
                        <div className="bg-pixel-card border-2 border-pixel-border p-2 mb-2">
                          <LogoPreview variant="simplified" size="sm" />
                        </div>
                        <div className="space-y-1">
                          <div className="h-2 bg-pixel-neon-pink/30 w-3/4" />
                          <div className="h-2 bg-pixel-border w-1/2" />
                        </div>
                      </div>
                    ),
                  },
                  {
                    name: '社交媒体',
                    icon: <Share2 className="w-5 h-5" />,
                    color: 'cyan',
                    mockup: (
                      <div className="bg-pixel-surface p-3 h-40">
                        <div className="bg-pixel-bg border-2 border-pixel-border p-2 flex items-center justify-center h-24 mb-2">
                          <LogoPreview variant="main" size="sm" />
                        </div>
                        <div className="flex gap-1">
                          <div className="w-4 h-4 rounded-full bg-pixel-neon-cyan" />
                          <div className="h-2 bg-pixel-border flex-1 mt-1" />
                        </div>
                      </div>
                    ),
                  },
                  {
                    name: '网站 Banner',
                    icon: <Monitor className="w-5 h-5" />,
                    color: 'yellow',
                    mockup: (
                      <div className="bg-pixel-surface p-3 h-40">
                        <div className="bg-gradient-to-r from-pixel-card to-pixel-bg border-2 border-pixel-border p-2 h-24 mb-2 flex items-center justify-center">
                          <LogoPreview variant="main" size="sm" />
                        </div>
                        <div className="h-2 bg-pixel-neon-yellow/30 w-full" />
                      </div>
                    ),
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="relative cursor-pointer"
                    onClick={() => setFlippedCard(flippedCard === i ? null : i)}
                    style={{ perspective: '1000px' }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={flippedCard === i ? 'back' : 'front'}
                        initial={{ rotateY: 90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: -90, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-4"
                        style={{
                          borderColor:
                            item.color === 'pink'
                              ? '#FF6B9D'
                              : item.color === 'cyan'
                              ? '#64FFDA'
                              : '#FFE66D',
                        }}
                      >
                        {flippedCard === i ? (
                          <div className="bg-pixel-bg p-4 h-64 flex items-center justify-center">
                            <div className="text-center">
                              {item.icon}
                              <p className="font-pixel text-pixel-xs text-pixel-text-primary mt-2">
                                {item.name}
                              </p>
                              <p className="font-vt text-vt-base text-pixel-text-secondary mt-2">
                                尺寸: 1024x512
                              </p>
                              <p className="font-vt text-vt-sm text-pixel-text-muted">
                                格式: PNG, SVG
                              </p>
                              <PixelButton size="sm" className="mt-4" variant="primary">
                                <Download className="w-3 h-3 inline mr-1" />
                                导出
                              </PixelButton>
                            </div>
                          </div>
                        ) : (
                          <div className="h-64">
                            <div
                              className="p-2 flex items-center gap-2 border-b-2"
                              style={{
                                borderColor:
                                  item.color === 'pink'
                                    ? '#FF6B9D'
                                    : item.color === 'cyan'
                                    ? '#64FFDA'
                                    : '#FFE66D',
                                backgroundColor:
                                  item.color === 'pink'
                                    ? 'rgba(255, 107, 157, 0.1)'
                                    : item.color === 'cyan'
                                    ? 'rgba(100, 255, 218, 0.1)'
                                    : 'rgba(255, 230, 109, 0.1)',
                              }}
                            >
                              <span
                                className={cn(
                                  'w-4 h-4',
                                  item.color === 'pink'
                                    ? 'text-pixel-neon-pink'
                                    : item.color === 'cyan'
                                    ? 'text-pixel-neon-cyan'
                                    : 'text-pixel-neon-yellow'
                                )}
                              >
                                {item.icon}
                              </span>
                              <span className="font-pixel text-pixel-xs text-pixel-text-primary">
                                {item.name}
                              </span>
                            </div>
                            {item.mockup}
                            <div className="p-2 text-center">
                              <p className="font-vt text-vt-sm text-pixel-text-secondary">
                                点击查看规格
                              </p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </PixelCard>
          </div>

          <div className="col-span-3 space-y-6">
            <PixelCard className="p-4" glow>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-pixel-neon-pink" />
                <h2 className="font-pixel text-pixel-sm text-pixel-text-primary">Logo 编辑器</h2>
              </div>

              <div className="bg-pixel-bg border-4 border-pixel-border p-6 mb-4 flex items-center justify-center min-h-[160px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={logoText + selectedIcon.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.2, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <LogoPreview variant="main" size="lg" />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-pixel text-pixel-xs text-pixel-text-secondary block mb-2">
                    Logo 文字
                  </label>
                  <input
                    type="text"
                    value={logoText}
                    onChange={(e) => setLogoText(e.target.value.toUpperCase())}
                    maxLength={12}
                    className="input-pixel font-pixel text-pixel-xs uppercase"
                  />
                  <p className="font-vt text-vt-sm text-pixel-text-muted mt-1">
                    {logoText.length}/12 字符
                  </p>
                </div>

                <div>
                  <label className="font-pixel text-pixel-xs text-pixel-text-secondary block mb-2">
                    选择图标
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {LOGO_ICONS.map((icon) => (
                      <motion.button
                        key={icon.id}
                        onClick={() => setSelectedIcon(icon)}
                        className={cn(
                          'aspect-square flex items-center justify-center text-2xl border-4 transition-all',
                          selectedIcon.id === icon.id
                            ? 'border-pixel-neon-pink bg-pixel-neon-pink/20'
                            : 'border-pixel-border bg-pixel-surface hover:border-pixel-neon-cyan'
                        )}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {icon.char}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-pixel text-pixel-xs text-pixel-text-secondary block mb-2">
                    配色方案
                  </label>
                  <div className="grid grid-cols-5 gap-1">
                    {customColors.map((color, i) => (
                      <motion.div
                        key={i}
                        className="aspect-square border-2 border-pixel-bg cursor-pointer"
                        style={{ backgroundColor: color }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          if (i < customColors.length - 1) {
                            const newColors = [...customColors];
                            [newColors[0], newColors[i]] = [newColors[i], newColors[0]];
                            setCustomColors(newColors);
                          }
                        }}
                      />
                    ))}
                  </div>
                  <p className="font-vt text-vt-sm text-pixel-text-muted mt-1">
                    点击颜色设为主色
                  </p>
                </div>

                <div>
                  <label className="font-pixel text-pixel-xs text-pixel-text-secondary block mb-2">
                    效果
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        key: 'pixelBorder' as const,
                        label: '像素边框',
                        icon: <Ruler className="w-4 h-4" />,
                      },
                      {
                        key: 'neonGlow' as const,
                        label: '霓虹发光',
                        icon: <Sparkles className="w-4 h-4" />,
                      },
                      {
                        key: 'scanline' as const,
                        label: '扫描线',
                        icon: <Monitor className="w-4 h-4" />,
                      },
                    ].map((item) => (
                      <motion.button
                        key={item.key}
                        onClick={() =>
                          setEffects((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                        }
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 border-4 transition-all',
                          effects[item.key]
                            ? 'border-pixel-neon-cyan bg-pixel-neon-cyan/10'
                            : 'border-pixel-border bg-pixel-surface'
                        )}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              effects[item.key] ? 'text-pixel-neon-cyan' : 'text-pixel-text-muted'
                            }
                          >
                            {item.icon}
                          </span>
                          <span className="font-vt text-vt-base text-pixel-text-primary">
                            {item.label}
                          </span>
                        </div>
                        <span
                          className={cn(
                            'px-2 font-pixel text-pixel-xs',
                            effects[item.key] ? 'text-pixel-neon-cyan' : 'text-pixel-text-muted'
                          )}
                        >
                          {effects[item.key] ? 'ON' : 'OFF'}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <PixelButton variant="primary" size="lg" className="w-full">
                    <Download className="w-4 h-4 inline mr-2" />
                    导出 Logo
                  </PixelButton>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <PixelButton variant="secondary" size="sm" className="w-full">
                      PNG
                    </PixelButton>
                    <PixelButton variant="secondary" size="sm" className="w-full">
                      SVG
                    </PixelButton>
                  </div>
                </div>
              </div>
            </PixelCard>
          </div>
        </div>
      </main>
    </div>
  );
}
