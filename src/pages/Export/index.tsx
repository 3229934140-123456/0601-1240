import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Play,
  Pause,
  X,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Settings,
  FolderOpen,
  Share2,
  FileText,
  Image,
  Film,
  FileImage,
  FileVideo,
  Check,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Package,
  Sparkles,
  Copy,
  Trash2,
  ListChecks,
  DownloadCloud,
} from 'lucide-react';
import PixelButton from '@/components/ui/PixelButton';
import PixelCard from '@/components/ui/PixelCard';
import { PLATFORM_SPECS } from '@/data/ratios';
import { MOCK_RELEASE_CHECKLIST } from '@/data/assets';
import type { ExportItem, PlatformSpec, ReleaseChecklistItem } from '@/types';

const mockExportItems: ExportItem[] = [
  {
    id: 'exp-1',
    name: 'steam_main_capsule',
    format: 'png',
    width: 460,
    height: 215,
    platform: 'Steam',
    status: 'done',
    progress: 100,
    url: '#',
  },
  {
    id: 'exp-2',
    name: 'steam_page_bg',
    format: 'jpg',
    width: 1920,
    height: 620,
    platform: 'Steam',
    status: 'processing',
    progress: 65,
  },
  {
    id: 'exp-3',
    name: 'steam_hero_banner',
    format: 'png',
    width: 616,
    height: 353,
    platform: 'Steam',
    status: 'pending',
    progress: 0,
  },
  {
    id: 'exp-4',
    name: 'epic_cover_art',
    format: 'png',
    width: 1200,
    height: 1600,
    platform: 'Epic',
    status: 'done',
    progress: 100,
    url: '#',
  },
  {
    id: 'exp-5',
    name: 'twitter_promo_v2',
    format: 'gif',
    width: 1200,
    height: 675,
    platform: 'Twitter',
    status: 'error',
    progress: 45,
  },
  {
    id: 'exp-6',
    name: 'bilibili_cover_final',
    format: 'png',
    width: 1146,
    height: 717,
    platform: 'B站',
    status: 'pending',
    progress: 0,
  },
];

const mockLogEntries = [
  { id: 'log-1', time: '20:45:32', action: '导出完成', item: 'steam_main_capsule.png', status: 'success' },
  { id: 'log-2', time: '20:44:18', action: '开始导出', item: 'steam_page_bg.jpg', status: 'info' },
  { id: 'log-3', time: '20:43:55', action: '导出失败', item: 'twitter_promo_v2.gif', status: 'error' },
  { id: 'log-4', time: '20:42:10', action: '导出完成', item: 'epic_cover_art.png', status: 'success' },
  { id: 'log-5', time: '20:40:05', action: '加入队列', item: 'bilibili_cover_final.png', status: 'info' },
];

const formatOptions = [
  { value: 'png', label: 'PNG', icon: Image, desc: '无损压缩，支持透明' },
  { value: 'jpg', label: 'JPG', icon: FileImage, desc: '有损压缩，文件更小' },
  { value: 'gif', label: 'GIF', icon: Film, desc: '动画格式，256色' },
  { value: 'mp4', label: 'MP4', icon: FileVideo, desc: '视频格式，高质量' },
];

const scaleOptions = [
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
  { value: 4, label: '4x' },
  { value: 8, label: '8x' },
];

const platformColors: Record<string, string> = {
  Steam: '#1A9FFF',
  Epic: '#FFFFFF',
  Twitter: '#1DA1F2',
  微博: '#E6162D',
  B站: '#FB7299',
  通用: '#64FFDA',
  社交: '#FF6B9D',
};

export default function ExportPage() {
  const [exportItems, setExportItems] = useState<ExportItem[]>(mockExportItems);
  const [checklist, setChecklist] = useState<ReleaseChecklistItem[]>(MOCK_RELEASE_CHECKLIST);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [platformSpecs] = useState<PlatformSpec[]>(
    PLATFORM_SPECS.map((spec) => ({
      ...spec,
      status: (['Steam', 'Epic'].includes(spec.platform) ? 'pass' : spec.platform === 'Twitter' ? 'warning' : 'error') as 'pass' | 'warning' | 'error',
    }))
  );

  const [exportFormat, setExportFormat] = useState<'png' | 'jpg' | 'gif' | 'mp4'>('png');
  const [quality, setQuality] = useState(90);
  const [scale, setScale] = useState(2);
  const [namingPrefix, setNamingPrefix] = useState('');
  const [namingSuffix, setNamingSuffix] = useState('');
  const [namingIndex, setNamingIndex] = useState(true);
  const [exportPath, setExportPath] = useState('./exports');
  const [showCelebration, setShowCelebration] = useState(false);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>('Steam');

  const totalItems = exportItems.length;
  const doneCount = exportItems.filter((i) => i.status === 'done').length;
  const pendingCount = exportItems.filter((i) => i.status === 'pending').length;

  const groupedSpecs = platformSpecs.reduce((acc, spec) => {
    if (!acc[spec.platform]) acc[spec.platform] = [];
    acc[spec.platform].push(spec);
    return acc;
  }, {} as Record<string, PlatformSpec[]>);

  const groupedChecklist = checklist.reduce((acc, item) => {
    if (!acc[item.platform]) acc[item.platform] = [];
    acc[item.platform].push(item);
    return acc;
  }, {} as Record<string, ReleaseChecklistItem[]>);

  useEffect(() => {
    const processingItems = exportItems.filter((i) => i.status === 'processing');
    if (processingItems.length === 0) return;

    const interval = setInterval(() => {
      setExportItems((prev) =>
        prev.map((item) => {
          if (item.status !== 'processing') return item;
          const newProgress = Math.min(item.progress + Math.random() * 8, 100);
          if (newProgress >= 100) {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 2000);
            return { ...item, status: 'done' as const, progress: 100, url: '#' };
          }
          return { ...item, progress: newProgress };
        })
      );
    }, 500);

    return () => clearInterval(interval);
  }, [exportItems]);

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === exportItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(exportItems.map((i) => i.id));
    }
  };

  const cancelExport = useCallback((id: string) => {
    setExportItems((prev) =>
      prev.map((item) =>
        item.id === id && item.status === 'processing'
          ? { ...item, status: 'pending' as const, progress: 0 }
          : item
      )
    );
  }, []);

  const restartExport = useCallback((id: string) => {
    setExportItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'processing' as const, progress: 0 }
          : item
      )
    );
  }, []);

  const exportAll = () => {
    setExportItems((prev) =>
      prev.map((item) =>
        item.status === 'pending' || item.status === 'error'
          ? { ...item, status: 'processing' as const, progress: 0 }
          : item
      )
    );
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };

  const handleBrowsePath = () => {
    const newPath = prompt('请输入导出路径:', exportPath);
    if (newPath) {
      setExportPath(newPath);
    }
  };

  const getStatusIcon = (status: ExportItem['status']) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-pixel-neon-cyan" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-pixel-neon-yellow animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-pixel-text-muted" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = (status: ExportItem['status']) => {
    switch (status) {
      case 'done':
        return '已完成';
      case 'processing':
        return '导出中';
      case 'pending':
        return '等待中';
      case 'error':
        return '失败';
    }
  };

  const getSpecStatusIcon = (status?: PlatformSpec['status']) => {
    switch (status) {
      case 'pass':
        return <Check className="w-4 h-4 text-pixel-neon-cyan" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-pixel-neon-yellow" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getFormatIcon = (format: ExportItem['format']) => {
    switch (format) {
      case 'png':
      case 'jpg':
        return <Image className="w-3 h-3" />;
      case 'gif':
        return <Film className="w-3 h-3" />;
      case 'mp4':
        return <FileVideo className="w-3 h-3" />;
    }
  };

  const PixelProgressBar = ({ progress, status }: { progress: number; status: ExportItem['status'] }) => {
    const barColor =
      status === 'done'
        ? 'bg-pixel-neon-cyan'
        : status === 'error'
        ? 'bg-red-500'
        : 'bg-pixel-neon-pink';

    return (
      <div className="w-full h-4 bg-pixel-surface border-2 border-pixel-border overflow-hidden">
        <motion.div
          className={`h-full ${barColor} relative`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {status === 'processing' && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          )}
          <div className="absolute inset-0">
            {Array.from({ length: Math.ceil(progress / 10) }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-black opacity-20"
                style={{ left: `${(i + 1) * 10}%` }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  };

  const CelebrationOverlay = () => (
    <AnimatePresence>
      {showCelebration && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: [0, 1.2, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <div className="text-pixel-2xl text-pixel-neon-cyan neon-glow-cyan mb-4 pixel-text-shadow">
              EXPORT COMPLETE!
            </div>
            <div className="flex justify-center gap-2">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-pixel-neon-pink"
                  initial={{ y: 0, opacity: 1 }}
                  animate={{
                    y: [0, -50, -100],
                    x: [0, (i - 4) * 20, (i - 4) * 40],
                    opacity: [1, 1, 0],
                  }}
                  transition={{ duration: 1, delay: i * 0.05 }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-pixel-bg pixel-grid-bg p-4">
      <CelebrationOverlay />

      <div className="max-w-[1800px] mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-pixel-xl text-pixel-neon-pink neon-glow-pink pixel-text-shadow mb-2">
              EXPORT CENTER
            </h1>
            <p className="text-vt-base text-pixel-text-secondary">
              批量导出您的像素艺术作品，适配各大游戏平台
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PixelButton variant="secondary" size="md" onClick={exportAll}>
              <Play className="w-4 h-4 mr-2" />
              全部导出
            </PixelButton>
          </div>
        </div>

        <PixelCard className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-pixel-neon-cyan" />
                <div>
                  <div className="text-pixel-xs text-pixel-text-muted">项目</div>
                  <div className="text-vt-lg text-pixel-text-primary">像素冒险 - 商店页素材包</div>
                </div>
              </div>
              <div className="w-px h-10 bg-pixel-border" />
              <div>
                <div className="text-pixel-xs text-pixel-text-muted">总文件数</div>
                <div className="text-vt-xl text-pixel-neon-yellow">{totalItems}</div>
              </div>
              <div className="w-px h-10 bg-pixel-border" />
              <div>
                <div className="text-pixel-xs text-pixel-text-muted">已完成</div>
                <div className="text-vt-xl text-pixel-neon-cyan">{doneCount}</div>
              </div>
              <div>
                <div className="text-pixel-xs text-pixel-text-muted">待导出</div>
                <div className="text-vt-xl text-pixel-neon-pink">{pendingCount}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-3 bg-pixel-surface border-2 border-pixel-border">
                <motion.div
                  className="h-full bg-gradient-to-r from-pixel-neon-pink to-pixel-neon-cyan"
                  initial={{ width: 0 }}
                  animate={{ width: `${(doneCount / totalItems) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-vt-base text-pixel-text-secondary">
                {Math.round((doneCount / totalItems) * 100)}%
              </span>
            </div>
          </div>
        </PixelCard>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3 space-y-4">
            <PixelCard className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-pixel-neon-yellow" />
                <h2 className="text-pixel-sm text-pixel-neon-yellow">平台尺寸检查</h2>
              </div>
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-2">
                {Object.entries(groupedSpecs).map(([platform, specs]) => {
                  const isExpanded = expandedPlatform === platform;
                  const allPass = specs.every((s) => s.status === 'pass');
                  const hasError = specs.some((s) => s.status === 'error');

                  return (
                    <div key={platform} className="border-2 border-pixel-border bg-pixel-surface">
                      <button
                        className="w-full p-3 flex items-center justify-between hover:bg-pixel-card transition-colors"
                        onClick={() => setExpandedPlatform(isExpanded ? null : platform)}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3"
                            style={{ backgroundColor: platformColors[platform] || '#64FFDA' }}
                          />
                          <span className="text-pixel-xs text-pixel-text-primary">{platform}</span>
                          {allPass ? (
                            <Check className="w-3 h-3 text-pixel-neon-cyan" />
                          ) : hasError ? (
                            <X className="w-3 h-3 text-red-500" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-pixel-neon-yellow" />
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-pixel-text-muted" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-pixel-text-muted" />
                        )}
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-3 pt-0 space-y-2 border-t-2 border-pixel-border">
                              {specs.map((spec, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-2 bg-pixel-card"
                                >
                                  <div>
                                    <div className="text-vt-base text-pixel-text-primary">
                                      {spec.type}
                                      {spec.required && (
                                        <span className="text-red-500 ml-1">*</span>
                                      )}
                                    </div>
                                    <div className="text-pixel-xs text-pixel-text-muted">
                                      {spec.width} × {spec.height}
                                    </div>
                                  </div>
                                  {getSpecStatusIcon(spec.status)}
                                </div>
                              ))}
                              <div className="text-pixel-xs text-pixel-text-muted mt-2 p-2 bg-pixel-bg border-2 border-pixel-border">
                                <div className="flex items-center gap-1 mb-1">
                                  <Check className="w-3 h-3 text-pixel-neon-cyan" />
                                  <span>通过 - 尺寸完全符合要求</span>
                                </div>
                                <div className="flex items-center gap-1 mb-1">
                                  <AlertTriangle className="w-3 h-3 text-pixel-neon-yellow" />
                                  <span>警告 - 建议优化</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <X className="w-3 h-3 text-red-500" />
                                  <span>错误 - 需要修正尺寸</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </PixelCard>
          </div>

          <div className="col-span-6 space-y-4">
            <PixelCard className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DownloadCloud className="w-5 h-5 text-pixel-neon-pink" />
                  <h2 className="text-pixel-sm text-pixel-neon-pink">导出队列</h2>
                  <span className="chip-pixel bg-pixel-surface text-pixel-text-secondary">
                    {exportItems.length} 项
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSelectAll}
                    className="text-pixel-xs text-pixel-text-secondary hover:text-pixel-neon-cyan transition-colors"
                  >
                    {selectedItems.length === exportItems.length ? '取消全选' : '全选'}
                  </button>
                  {selectedItems.length > 0 && (
                    <>
                      <span className="text-pixel-xs text-pixel-text-muted">|</span>
                      <button className="text-pixel-xs text-pixel-neon-cyan hover:underline">
                        批量导出
                      </button>
                      <button className="text-pixel-xs text-red-400 hover:underline">
                        批量删除
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                <AnimatePresence>
                  {exportItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`p-4 border-4 transition-all ${
                        selectedItems.includes(item.id)
                          ? 'border-pixel-neon-cyan bg-pixel-card'
                          : 'border-pixel-border bg-pixel-surface hover:border-pixel-border'
                      }`}
                      style={{
                        boxShadow:
                          selectedItems.includes(item.id) &&
                          '4px 4px 0 0 #0D0B1F, 0 0 20px rgba(100, 255, 218, 0.3)',
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                          className="mt-1 w-4 h-4 accent-pixel-neon-cyan"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getFormatIcon(item.format)}
                              <span className="text-vt-lg text-pixel-text-primary truncate">
                                {item.name}.{item.format}
                              </span>
                              <span
                                className="chip-pixel text-[10px]"
                                style={{
                                  backgroundColor:
                                    platformColors[item.platform] || '#64FFDA',
                                  color: '#0D0B1F',
                                }}
                              >
                                {item.platform}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(item.status)}
                              <span
                                className={`text-pixel-xs ${
                                  item.status === 'done'
                                    ? 'text-pixel-neon-cyan'
                                    : item.status === 'error'
                                    ? 'text-red-500'
                                    : item.status === 'processing'
                                    ? 'text-pixel-neon-yellow'
                                    : 'text-pixel-text-muted'
                                }`}
                              >
                                {getStatusText(item.status)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-pixel-xs text-pixel-text-muted">
                              {item.width} × {item.height}
                            </span>
                            <span className="text-pixel-xs text-pixel-text-muted uppercase">
                              {item.format}
                            </span>
                            <span className="text-pixel-xs text-pixel-neon-yellow">
                              {Math.round(item.progress)}%
                            </span>
                          </div>

                          <PixelProgressBar progress={item.progress} status={item.status} />

                          <div className="flex items-center justify-end gap-2 mt-3">
                            {item.status === 'processing' && (
                              <PixelButton
                                variant="ghost"
                                size="sm"
                                onClick={() => cancelExport(item.id)}
                              >
                                <Pause className="w-3 h-3 mr-1" />
                                取消
                              </PixelButton>
                            )}
                            {(item.status === 'pending' || item.status === 'error') && (
                              <PixelButton
                                variant="primary"
                                size="sm"
                                onClick={() => restartExport(item.id)}
                              >
                                <Play className="w-3 h-3 mr-1" />
                                {item.status === 'error' ? '重试' : '开始'}
                              </PixelButton>
                            )}
                            {item.status === 'done' && (
                              <>
                                <PixelButton variant="ghost" size="sm">
                                  <Eye className="w-3 h-3 mr-1" />
                                  预览
                                </PixelButton>
                                <PixelButton variant="secondary" size="sm">
                                  <Download className="w-3 h-3 mr-1" />
                                  下载
                                </PixelButton>
                              </>
                            )}
                            {item.status === 'error' && (
                              <PixelButton
                                variant="ghost"
                                size="sm"
                                onClick={() => restartExport(item.id)}
                              >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                重新导出
                              </PixelButton>
                            )}
                            <PixelButton variant="ghost" size="sm">
                              <Copy className="w-3 h-3 mr-1" />
                            </PixelButton>
                            <PixelButton variant="ghost" size="sm">
                              <Trash2 className="w-3 h-3 mr-1" />
                            </PixelButton>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </PixelCard>

            <PixelCard className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-pixel-neon-cyan" />
                <h2 className="text-pixel-sm text-pixel-neon-cyan">导出设置</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-pixel-xs text-pixel-text-muted mb-2">
                    输出格式
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {formatOptions.map((fmt) => (
                      <button
                        key={fmt.value}
                        onClick={() => setExportFormat(fmt.value as typeof exportFormat)}
                        className={`p-3 border-4 transition-all ${
                          exportFormat === fmt.value
                            ? 'border-pixel-neon-cyan bg-pixel-card'
                            : 'border-pixel-border bg-pixel-surface hover:border-pixel-border'
                        }`}
                        style={{
                          boxShadow:
                            exportFormat === fmt.value &&
                            '4px 4px 0 0 #0D0B1F, 0 0 15px rgba(100, 255, 218, 0.3)',
                        }}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <fmt.icon
                            className={`w-5 h-5 ${
                              exportFormat === fmt.value
                                ? 'text-pixel-neon-cyan'
                                : 'text-pixel-text-muted'
                            }`}
                          />
                          <span
                            className={`text-pixel-xs ${
                              exportFormat === fmt.value
                                ? 'text-pixel-neon-cyan'
                                : 'text-pixel-text-secondary'
                            }`}
                          >
                            {fmt.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-pixel-xs text-pixel-text-muted mb-2">
                    质量: {quality}%
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="flex-1 h-2 bg-pixel-surface border-2 border-pixel-border accent-pixel-neon-pink"
                    />
                    <span className="text-vt-lg text-pixel-neon-yellow w-12 text-right">
                      {quality}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-pixel-xs text-pixel-text-muted">小文件</span>
                    <span className="text-pixel-xs text-pixel-text-muted">高质量</span>
                  </div>
                </div>

                <div>
                  <label className="block text-pixel-xs text-pixel-text-muted mb-2">
                    像素完美缩放
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {scaleOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setScale(opt.value)}
                        className={`p-3 border-4 transition-all ${
                          scale === opt.value
                            ? 'border-pixel-neon-pink bg-pixel-card'
                            : 'border-pixel-border bg-pixel-surface hover:border-pixel-border'
                        }`}
                        style={{
                          boxShadow:
                            scale === opt.value &&
                            '4px 4px 0 0 #0D0B1F, 0 0 15px rgba(255, 107, 157, 0.3)',
                        }}
                      >
                        <span
                          className={`text-pixel-sm ${
                            scale === opt.value
                              ? 'text-pixel-neon-pink'
                              : 'text-pixel-text-secondary'
                          }`}
                        >
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-pixel-xs text-pixel-text-muted mb-2">
                    命名规则
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={namingPrefix}
                        onChange={(e) => setNamingPrefix(e.target.value)}
                        placeholder="前缀"
                        className="input-pixel flex-1"
                      />
                      <input
                        type="text"
                        value={namingSuffix}
                        onChange={(e) => setNamingSuffix(e.target.value)}
                        placeholder="后缀"
                        className="input-pixel flex-1"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={namingIndex}
                        onChange={(e) => setNamingIndex(e.target.checked)}
                        className="w-4 h-4 accent-pixel-neon-cyan"
                      />
                      <span className="text-pixel-xs text-pixel-text-secondary">
                        添加序号后缀 (001, 002...)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-pixel-surface border-2 border-pixel-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-pixel-text-muted" />
                    <span className="text-pixel-xs text-pixel-text-secondary">
                      导出位置:
                    </span>
                    <span className="text-vt-base text-pixel-neon-cyan">{exportPath}</span>
                  </div>
                  <PixelButton variant="ghost" size="sm" onClick={handleBrowsePath}>
                    浏览...
                  </PixelButton>
                </div>
                <div className="mt-2 text-pixel-xs text-pixel-text-muted">
                  示例输出: <span className="text-pixel-neon-yellow">{namingPrefix}file_name{namingSuffix}{namingIndex ? '_001' : ''}.{exportFormat}</span>
                </div>
              </div>
            </PixelCard>
          </div>

          <div className="col-span-3 space-y-4">
            <PixelCard className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-pixel-neon-yellow" />
                  <h2 className="text-pixel-sm text-pixel-neon-yellow">发布清单</h2>
                </div>
                <div className="flex gap-2">
                  <PixelButton variant="ghost" size="sm">
                    <Sparkles className="w-3 h-3 mr-1" />
                    生成
                  </PixelButton>
                  <PixelButton variant="ghost" size="sm">
                    <Share2 className="w-3 h-3 mr-1" />
                    分享
                  </PixelButton>
                </div>
              </div>

              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
                {Object.entries(groupedChecklist).map(([platform, items]) => (
                  <div
                    key={platform}
                    className="border-2 border-pixel-border bg-pixel-surface"
                  >
                    <div
                      className="p-2 border-b-2 border-pixel-border flex items-center gap-2"
                      style={{
                        backgroundColor: `${platformColors[platform] || '#64FFDA'}15`,
                      }}
                    >
                      <div
                        className="w-3 h-3"
                        style={{ backgroundColor: platformColors[platform] || '#64FFDA' }}
                      />
                      <span className="text-pixel-xs text-pixel-text-primary">{platform}</span>
                      <span className="text-pixel-xs text-pixel-text-muted ml-auto">
                        {items.filter((i) => i.done).length}/{items.length}
                      </span>
                    </div>
                    <div className="p-2 space-y-2">
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          className={`p-2 border-2 cursor-pointer transition-all ${
                            item.done
                              ? 'border-pixel-neon-cyan bg-pixel-card'
                              : 'border-pixel-border bg-pixel-surface hover:border-pixel-border'
                          }`}
                          onClick={() => toggleChecklistItem(item.id)}
                          whileHover={{ x: 2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-start gap-2">
                            <motion.div
                              className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                item.done
                                  ? 'bg-pixel-neon-cyan border-pixel-neon-cyan'
                                  : 'bg-pixel-surface border-pixel-border'
                              }`}
                              animate={
                                item.done
                                  ? {
                                      scale: [1, 1.2, 1],
                                      rotate: [0, 10, 0],
                                    }
                                  : {}
                              }
                              transition={{ duration: 0.3 }}
                            >
                              {item.done && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ type: 'spring', stiffness: 500 }}
                                >
                                  <Check className="w-3 h-3 text-pixel-bg" />
                                </motion.div>
                              )}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span
                                  className={`text-vt-base ${
                                    item.done
                                      ? 'text-pixel-neon-cyan line-through'
                                      : 'text-pixel-text-primary'
                                  }`}
                                >
                                  {item.title}
                                </span>
                                {item.required && (
                                  <span className="text-red-500 text-pixel-xs">*</span>
                                )}
                              </div>
                              <div className="text-pixel-xs text-pixel-text-muted">
                                {item.description}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-pixel-xs text-pixel-text-muted">完成进度</span>
                  <span className="text-vt-base text-pixel-neon-cyan">
                    {checklist.filter((i) => i.done).length}/{checklist.length}
                  </span>
                </div>
                <div className="w-full h-4 bg-pixel-surface border-2 border-pixel-border">
                  <motion.div
                    className="h-full bg-gradient-to-r from-pixel-neon-pink via-pixel-neon-purple to-pixel-neon-cyan"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        (checklist.filter((i) => i.done).length / checklist.length) *
                        100
                      }%`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </PixelCard>
          </div>
        </div>

        <PixelCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-pixel-neon-purple" />
            <h2 className="text-pixel-sm text-pixel-neon-purple">导出日志</h2>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto font-mono text-sm">
            {mockLogEntries.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-4 p-2 hover:bg-pixel-surface transition-colors"
              >
                <span className="text-pixel-xs text-pixel-text-muted w-20">
                  [{log.time}]
                </span>
                <span
                  className={`text-pixel-xs w-20 ${
                    log.status === 'success'
                      ? 'text-pixel-neon-cyan'
                      : log.status === 'error'
                      ? 'text-red-500'
                      : 'text-pixel-neon-yellow'
                  }`}
                >
                  {log.status === 'success' && '✓ '}
                  {log.status === 'error' && '✗ '}
                  {log.status === 'info' && '→ '}
                  {log.action}
                </span>
                <span className="text-vt-base text-pixel-text-secondary">{log.item}</span>
              </div>
            ))}
          </div>
        </PixelCard>
      </div>
    </div>
  );
}
