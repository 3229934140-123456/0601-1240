import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  XCircle as CloseIcon,
  CheckCircle,
  FileDown,
} from 'lucide-react';
import PixelButton from '@/components/ui/PixelButton';
import PixelCard from '@/components/ui/PixelCard';
import { PLATFORM_SPECS } from '@/data/ratios';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useProjectStore } from '@/store/projectStore';
import type { ExportItem, PlatformSpec, ReleaseChecklistItem } from '@/types';
import {
  generateExportImage,
  downloadFile,
  generateFilename,
  generateReleaseChecklistContent,
  copyToClipboard,
  syncChecklistFromExports,
  buildExportZip,
} from '@/utils/export';

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
  '微信分享': '#07C160',
  '角色宣传': '#8BC34A',
  '动图宣传': '#FF5722',
  '海报宣传': '#E91E63',
  YouTube: '#FF0000',
  Twitch: '#9146FF',
  '品牌套件': '#00BCD4',
  '商店套件': '#795548',
  微信: '#07C160',
  TapTap: '#FFD54F',
  媒体: '#607D8B',
  通用: '#64FFDA',
  社交: '#FF6B9D',
};

const mockLogEntries = [
  { id: 'log-1', time: '20:45:32', action: '导出完成', item: 'main_capsule.png', status: 'success' },
  { id: 'log-2', time: '20:44:18', action: '开始导出', item: 'page_bg.jpg', status: 'info' },
  { id: 'log-3', time: '20:43:55', action: '导出失败', item: 'promo_v2.gif', status: 'error' },
  { id: 'log-4', time: '20:42:10', action: '导出完成', item: 'cover_art.png', status: 'success' },
  { id: 'log-5', time: '20:40:05', action: '加入队列', item: 'cover_final.png', status: 'info' },
];

export default function ExportPage() {
  const { projectId, currentProject } = useCurrentProject();
  const {
    setExportItems, updateExportItem,
    setReleaseChecklist, updateReleaseChecklistItem,
  } = useProjectStore();
  
  const [exportItems, setExportItemsLocal] = useState<ExportItem[]>(currentProject?.exportItems || []);
  const [checklist, setChecklistLocal] = useState<ReleaseChecklistItem[]>(currentProject?.releaseChecklist || []);
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
  const [previewItem, setPreviewItem] = useState<ExportItem | null>(null);
  const [exportedBlobs, setExportedBlobs] = useState<Record<string, { blob: Blob; dataUrl: string }>>({});
  const [checklistContent, setChecklistContent] = useState<string>('');
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState<'checklist' | 'zip' | null>(null);
  const [zipBusy, setZipBusy] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  
  const processingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setExportItemsLocal(currentProject?.exportItems || []);
    setChecklistLocal(currentProject?.releaseChecklist || []);
    setSelectedItems([]);
    setExportedBlobs({});
    processingRef.current.clear();
  }, [projectId, currentProject?.id]);

  const commitExportItems = useCallback((items: ExportItem[]) => {
    setExportItemsLocal(items);
    if (projectId) setExportItems(projectId, items);
  }, [projectId, setExportItems]);

  const commitChecklist = useCallback((items: ReleaseChecklistItem[]) => {
    setChecklistLocal(items);
    if (projectId) setReleaseChecklist(projectId, items);
  }, [projectId, setReleaseChecklist]);

  const commitExportItem = useCallback((itemId: string, updates: Partial<ExportItem>) => {
    setExportItemsLocal((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...updates } : i)));
    if (projectId) updateExportItem(projectId, itemId, updates);
  }, [projectId, updateExportItem]);

  const commitChecklistItem = useCallback((itemId: string, updates: Partial<ReleaseChecklistItem>) => {
    setChecklistLocal((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...updates } : i)));
    if (projectId) updateReleaseChecklistItem(projectId, itemId, updates);
  }, [projectId, updateReleaseChecklistItem]);

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

  const processExportItem = useCallback(async (itemId: string) => {
    if (processingRef.current.has(itemId)) return;
    processingRef.current.add(itemId);
    
    const item = exportItems.find((i) => i.id === itemId);
    if (!item) return;
    
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress = Math.min(currentProgress + Math.random() * 12, 98);
      commitExportItem(itemId, { progress: currentProgress });
    }, 300);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      
      const { blob, dataUrl } = await generateExportImage(
        item.width,
        item.height,
        item.format,
        item.name,
        quality
      );

      if (blob && dataUrl) {
        setExportedBlobs((prev) => ({ ...prev, [itemId]: { blob, dataUrl } }));
      }

      clearInterval(progressInterval);
      commitExportItem(itemId, { status: 'done', progress: 100, url: dataUrl || '#' });
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    } catch (err) {
      clearInterval(progressInterval);
      const shouldFail = Math.random() < 0.1;
      if (shouldFail) {
        commitExportItem(itemId, { status: 'error', progress: currentProgress });
      } else {
        const { blob, dataUrl } = await generateExportImage(
          item.width,
          item.height,
          item.format,
          item.name,
          quality
        );
        if (blob && dataUrl) {
          setExportedBlobs((prev) => ({ ...prev, [itemId]: { blob, dataUrl } }));
        }
        commitExportItem(itemId, { status: 'done', progress: 100, url: dataUrl || '#' });
      }
    } finally {
      processingRef.current.delete(itemId);
    }
  }, [exportItems, quality, commitExportItem]);

  useEffect(() => {
    const itemsToProcess = exportItems.filter(
      (i) => i.status === 'processing' && !processingRef.current.has(i.id)
    );
    itemsToProcess.forEach((item) => {
      processExportItem(item.id);
    });
  }, [exportItems, processExportItem]);

  useEffect(() => {
    const initDoneItems = async () => {
      const doneItems = exportItems.filter(
        (i) => i.status === 'done' && !exportedBlobs[i.id]
      );
      for (const item of doneItems) {
        try {
          const { blob, dataUrl } = await generateExportImage(
            item.width,
            item.height,
            item.format,
            item.name,
            quality
          );
          if (blob && dataUrl) {
            setExportedBlobs((prev) => ({ ...prev, [item.id]: { blob, dataUrl } }));
            if (!item.url || item.url === '#') {
              commitExportItem(item.id, { url: dataUrl });
            }
          }
        } catch (e) {
          console.error('Init export item error', e);
        }
      }
    };
    initDoneItems();
  }, [exportItems, quality, exportedBlobs, commitExportItem]);

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
    commitExportItem(id, { status: 'pending', progress: 0 });
  }, [commitExportItem]);

  const restartExport = useCallback((id: string) => {
    commitExportItem(id, { status: 'processing', progress: 0 });
  }, [commitExportItem]);

  const exportAll = () => {
    commitExportItems(
      exportItems.map((item) =>
        item.status === 'pending' || item.status === 'error'
          ? { ...item, status: 'processing', progress: 0 }
          : item
      )
    );
  };

  const toggleChecklistItem = (id: string) => {
    const item = checklist.find((i) => i.id === id);
    if (item) commitChecklistItem(id, { done: !item.done });
  };

  const handleBrowsePath = () => {
    const newPath = prompt('请输入导出路径:', exportPath);
    if (newPath) {
      setExportPath(newPath);
    }
  };

  const handleDownload = useCallback((item: ExportItem) => {
    const exportData = exportedBlobs[item.id];
    if (exportData?.blob) {
      const prefix = namingPrefix || currentProject?.name?.replace(/\s+/g, '_') || 'pixelforge';
      const filename = generateFilename(
        prefix,
        item.platform,
        item.name,
        item.format,
        1
      );
      downloadFile(exportData.blob, filename);
    }
  }, [exportedBlobs, namingPrefix, currentProject]);

  const handlePreview = useCallback((item: ExportItem) => {
    const exportData = exportedBlobs[item.id];
    if (exportData?.dataUrl || item.url && item.url !== '#') {
      setPreviewItem({ ...item, url: exportData?.dataUrl || item.url });
    }
  }, [exportedBlobs]);

  const handleDownloadSelected = useCallback(() => {
    const itemsToDownload = exportItems.filter(
      (i) => i.status === 'done' && (selectedItems.length === 0 || selectedItems.includes(i.id))
    );
    itemsToDownload.forEach((item) => {
      setTimeout(() => handleDownload(item), 200);
    });
  }, [exportItems, selectedItems, handleDownload]);

  const handleGenerateChecklist = useCallback(() => {
    const projectName = currentProject?.name || 'PixelForge Project';
    const synced = syncChecklistFromExports(checklist, exportItems);
    commitChecklist(synced);
    const content = generateReleaseChecklistContent(projectName, synced, exportItems);
    setChecklistContent(content);
    setShowChecklistModal(true);
  }, [currentProject, checklist, exportItems, commitChecklist]);

  const handleDownloadZip = useCallback(async () => {
    const doneItems = selectedItems.length > 0
      ? exportItems.filter((i) => selectedItems.includes(i.id) && i.status === 'done')
      : exportItems.filter((i) => i.status === 'done');
    if (doneItems.length === 0) return;
    setZipBusy(true);
    setZipProgress(10);
    try {
      await new Promise((r) => setTimeout(r, 150));
      setZipProgress(30);
      const projectName = currentProject?.name || 'PixelForge Project';
      const synced = syncChecklistFromExports(checklist, exportItems);
      const content = generateReleaseChecklistContent(projectName, synced, exportItems);
      setZipProgress(60);
      const zipBlob = await buildExportZip(doneItems, exportedBlobs, {
        prefix: namingPrefix || projectName.replace(/\s+/g, '_'),
        projectName,
        checklistContent: content,
        checklist: synced,
      });
      setZipProgress(95);
      const filename = `${projectName.replace(/\s+/g, '_')}_export_pack.zip`;
      downloadFile(zipBlob, filename);
      setCopySuccess('zip');
      setTimeout(() => setCopySuccess(null), 2500);
    } catch (e) {
      console.error('ZIP打包失败', e);
      alert('ZIP打包失败，请重试');
    } finally {
      setZipBusy(false);
      setZipProgress(0);
    }
  }, [selectedItems, exportItems, currentProject, checklist, exportedBlobs, namingPrefix]);

  const handleCopyChecklist = useCallback(async () => {
    if (!checklistContent) return;
    const ok = await copyToClipboard(checklistContent);
    if (ok) {
      setCopySuccess('checklist');
      setTimeout(() => setCopySuccess(null), 2000);
    }
  }, [checklistContent]);

  const handleDownloadChecklist = useCallback(() => {
    if (!checklistContent) return;
    const projectName = currentProject?.name?.replace(/\s+/g, '_') || 'pixelforge';
    const blob = new Blob([checklistContent], { type: 'text/plain;charset=utf-8' });
    downloadFile(blob, `${projectName}_release_checklist.txt`);
  }, [checklistContent, currentProject]);

  const doneCountFromExport = exportItems.filter((i) => i.status === 'done').length;

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
          <div className="flex items-center gap-3 flex-wrap">
            {doneCountFromExport > 0 && (
              <>
                <PixelButton variant="ghost" size="md" onClick={handleDownloadSelected}>
                  <Download className="w-4 h-4 mr-2" />
                  {selectedItems.length > 0 ? `下载选中(${selectedItems.filter((id) => exportItems.find((i) => i.id === id)?.status === 'done').length})` : `下载单图(${doneCountFromExport})`}
                </PixelButton>
                <PixelButton
                  variant={copySuccess === 'zip' ? 'primary' : 'warning'}
                  size="md"
                  onClick={handleDownloadZip}
                  disabled={zipBusy}
                >
                  <Package className="w-4 h-4 mr-2" />
                  {zipBusy ? `打包中 ${zipProgress}%` : copySuccess === 'zip' ? 'ZIP已下载!' : (selectedItems.length > 0 ? '打包选中(ZIP)' : `打包全部(${doneCountFromExport})`)}
                </PixelButton>
              </>
            )}
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
                  <div className="text-vt-lg text-pixel-text-primary">
                    {currentProject?.name || '像素冒险 - 商店页素材包'}
                  </div>
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
                                <PixelButton variant="ghost" size="sm" onClick={() => handlePreview(item)}>
                                  <Eye className="w-3 h-3 mr-1" />
                                  预览
                                </PixelButton>
                                <PixelButton variant="secondary" size="sm" onClick={() => handleDownload(item)}>
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
                  <PixelButton variant="ghost" size="sm" onClick={handleGenerateChecklist}>
                    <Sparkles className="w-3 h-3 mr-1" />
                    生成
                  </PixelButton>
                  <PixelButton variant="ghost" size="sm" onClick={handleGenerateChecklist}>
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

      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-8"
            onClick={() => setPreviewItem(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="max-w-[90vw] max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <PixelCard hover={false} className="flex flex-col max-h-full">
                <div className="flex items-center justify-between p-4 border-b-4 border-pixel-border">
                  <div>
                    <h3 className="text-pixel-md text-pixel-neon-cyan font-pixel mb-1">
                      {previewItem.name}.{previewItem.format}
                    </h3>
                    <p className="text-pixel-xs text-pixel-text-muted">
                      {previewItem.platform} • {previewItem.width} × {previewItem.height} • {previewItem.format.toUpperCase()}
                    </p>
                  </div>
                  <PixelButton variant="ghost" size="sm" onClick={() => setPreviewItem(null)}>
                    <CloseIcon className="w-4 h-4" />
                  </PixelButton>
                </div>
                <div className="flex-1 overflow-auto p-6 bg-pixel-bg flex items-center justify-center">
                  <img
                    src={previewItem.url}
                    alt={previewItem.name}
                    className="max-w-full max-h-[65vh] border-4 border-pixel-border"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <div className="flex justify-end gap-2 p-4 border-t-4 border-pixel-border bg-pixel-surface">
                  <PixelButton variant="ghost" size="sm" onClick={() => handlePreview({...previewItem})}>
                    <Eye className="w-4 h-4 mr-2" />
                    预览
                  </PixelButton>
                  <PixelButton variant="secondary" size="sm" onClick={() => handleDownload(previewItem)}>
                    <Download className="w-4 h-4 mr-2" />
                    下载此图
                  </PixelButton>
                </div>
              </PixelCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showChecklistModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-8"
            onClick={() => setShowChecklistModal(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-full max-w-3xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <PixelCard hover={false} className="flex flex-col max-h-full">
                <div className="flex items-center justify-between p-4 border-b-4 border-pixel-border">
                  <div>
                    <h3 className="text-pixel-md text-pixel-neon-yellow font-pixel mb-1">
                      发布清单 / Release Checklist
                    </h3>
                    <p className="text-pixel-xs text-pixel-text-muted">
                      {currentProject?.name || 'PixelForge Project'}
                    </p>
                  </div>
                  <PixelButton variant="ghost" size="sm" onClick={() => setShowChecklistModal(false)}>
                    <CloseIcon className="w-4 h-4" />
                  </PixelButton>
                </div>
                <div className="flex-1 overflow-auto p-6 bg-pixel-bg">
                  <pre className="text-vt-sm text-pixel-text-primary whitespace-pre-wrap font-mono leading-relaxed bg-pixel-card border-4 border-pixel-border p-4">
                    {checklistContent || '清单内容正在生成...'}
                  </pre>
                </div>
                <div className="flex justify-end gap-2 p-4 border-t-4 border-pixel-border bg-pixel-surface">
                  <PixelButton
                    variant={copySuccess === 'checklist' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={handleCopyChecklist}
                  >
                    {copySuccess === 'checklist' ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        已复制到剪贴板!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        复制文本
                      </>
                    )}
                  </PixelButton>
                  <PixelButton variant="secondary" size="sm" onClick={handleDownloadChecklist}>
                    <FileDown className="w-4 h-4 mr-2" />
                    下载 TXT
                  </PixelButton>
                </div>
              </PixelCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
