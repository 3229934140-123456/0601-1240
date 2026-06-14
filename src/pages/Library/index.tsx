import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  Upload,
  X,
  FolderPlus,
  Tag,
  ChevronRight,
  ChevronDown,
  ImagePlus,
  Sparkles,
  Star,
} from 'lucide-react';
import PixelButton from '@/components/ui/PixelButton';
import PixelCard from '@/components/ui/PixelCard';
import { useLibraryStore } from '@/store/libraryStore';
import { useCanvasStore } from '@/store/canvasStore';
import type { Asset } from '@/types';

const typeLabels: Record<string, string> = {
  all: '全部',
  character: '角色',
  background: '背景',
  border: '边框',
  font: '字体',
};

const categoryTree = [
  {
    id: 'all',
    name: '全部素材',
    icon: Sparkles,
    children: [
      { id: 'character', name: '角色素材', icon: Star, count: 4 },
      { id: 'background', name: '背景素材', icon: ImagePlus, count: 4 },
      { id: 'border', name: '边框素材', icon: FolderPlus, count: 3 },
    ],
  },
];

const popularTags = [
  '像素',
  '复古',
  '霓虹',
  '角色',
  '背景',
  '边框',
  '游戏',
  '可爱',
  '科技',
  '自然',
  '夜景',
  '森林',
];

interface UploadFormData {
  name: string;
  type: 'character' | 'background' | 'border' | 'font';
  tags: string;
  description: string;
  thumbnail: string;
  url: string;
}

const initialFormData: UploadFormData = {
  name: '',
  type: 'character',
  tags: '',
  description: '',
  thumbnail: '',
  url: '',
};

export default function LibraryPage() {
  const {
    selectedType,
    searchQuery,
    showFavoritesOnly,
    setSelectedType,
    setSearchQuery,
    toggleFavoritesOnly,
    toggleFavorite,
    addAsset,
    getFilteredAssets,
  } = useLibraryStore();

  const { addElement, width, height } = useCanvasStore();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState<UploadFormData>(initialFormData);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['all'])
  );
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredAssets = useMemo(() => {
    let assets = getFilteredAssets();
    if (selectedTag) {
      assets = assets.filter((a) => a.tags.includes(selectedTag));
    }
    return assets;
  }, [getFilteredAssets, selectedTag]);

  const toggleCategory = useCallback((id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleAddToCanvas = useCallback(
    (asset: Asset) => {
      if (asset.type === 'border') {
        addElement({
          type: 'border',
          x: 0,
          y: 0,
          width,
          height,
          rotation: 0,
          visible: true,
          locked: false,
          data: {
            style: 'neon',
            color: asset.palette?.[0] || '#FF6B9D',
            thickness: 8,
            cornerSize: 0,
          },
        });
      } else if (asset.type === 'font') {
        addElement({
          type: 'text',
          x: Math.floor(width / 2 - 100),
          y: Math.floor(height / 2 - 20),
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
            pixelFont: true,
          },
        });
      } else {
        const assetWidth = asset.type === 'background' ? width : 128;
        const assetHeight = asset.type === 'background' ? height : 128;
        const x = asset.type === 'background' ? 0 : Math.floor(width / 2 - assetWidth / 2);
        const y = asset.type === 'background' ? 0 : Math.floor(height / 2 - assetHeight / 2);

        addElement({
          type: 'image',
          x,
          y,
          width: assetWidth,
          height: assetHeight,
          rotation: 0,
          visible: true,
          locked: asset.type === 'background',
          data: {
            src: asset.url || asset.thumbnail,
            assetId: asset.id,
            pixelPerfect: true,
          },
        });
      }
    },
    [addElement, width, height]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setUploadForm((prev) => ({
          ...prev,
          thumbnail: dataUrl,
          url: dataUrl,
          name: prev.name || file.name.replace(/\.[^/.]+$/, ''),
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setUploadForm((prev) => ({
          ...prev,
          thumbnail: dataUrl,
          url: dataUrl,
          name: prev.name || file.name.replace(/\.[^/.]+$/, ''),
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (!uploadForm.name || !uploadForm.thumbnail) {
      return;
    }

    addAsset({
      type: uploadForm.type,
      name: uploadForm.name,
      thumbnail: uploadForm.thumbnail,
      url: uploadForm.url || uploadForm.thumbnail,
      tags: uploadForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      favorite: false,
      description: uploadForm.description,
    });

    setUploadForm(initialFormData);
    setShowUploadModal(false);
  }, [uploadForm, addAsset]);

  const handleCloseModal = useCallback(() => {
    setShowUploadModal(false);
    setUploadForm(initialFormData);
  }, []);

  const filterTypes = [
    { id: 'all', label: '全部' },
    { id: 'character', label: '角色' },
    { id: 'background', label: '背景' },
    { id: 'border', label: '边框' },
    { id: 'font', label: '字体' },
  ] as const;

  return (
    <div className="min-h-screen bg-pixel-bg pixel-grid-bg">
      <div className="max-w-[1600px] mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-pixel text-pixel-xl text-pixel-neon-pink pixel-text-shadow">
            素材库
          </h1>
          <PixelButton
            variant="primary"
            size="lg"
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2"
          >
            <Upload size={16} />
            上传素材
          </PixelButton>
        </div>

        <div className="flex gap-6">
          <div className="w-64 flex-shrink-0">
            <PixelCard className="p-4 mb-4" hover={false}>
              <h3 className="font-pixel text-pixel-sm text-pixel-neon-cyan mb-4">
                分类
              </h3>
              <div className="space-y-2">
                {categoryTree.map((category) => (
                  <div key={category.id}>
                    <button
                      onClick={() => {
                        setSelectedType(category.id as any);
                        toggleCategory(category.id);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 border-4 border-pixel-bg transition-all ${
                        selectedType === category.id
                          ? 'bg-pixel-neon-pink text-pixel-bg'
                          : 'bg-pixel-card text-pixel-text-primary hover:bg-pixel-border'
                      }`}
                      style={{ boxShadow: '3px 3px 0 0 #0D0B1F' }}
                    >
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                      <category.icon size={14} />
                      <span className="font-pixel text-pixel-xs flex-1 text-left">
                        {category.name}
                      </span>
                    </button>
                    {expandedCategories.has(category.id) && category.children && (
                      <div className="ml-4 mt-2 space-y-2">
                        {category.children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => setSelectedType(child.id as any)}
                            className={`w-full flex items-center gap-2 px-3 py-2 border-4 border-pixel-bg transition-all ${
                              selectedType === child.id
                                ? 'bg-pixel-neon-cyan text-pixel-bg'
                                : 'bg-pixel-surface text-pixel-text-secondary hover:bg-pixel-card'
                            }`}
                            style={{ boxShadow: '2px 2px 0 0 #0D0B1F' }}
                          >
                            <child.icon size={12} />
                            <span className="font-pixel text-[10px] flex-1 text-left">
                              {child.name}
                            </span>
                            <span className="font-vt text-sm opacity-70">
                              {child.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </PixelCard>

            <PixelCard className="p-4" hover={false}>
              <h3 className="font-pixel text-pixel-sm text-pixel-neon-yellow mb-4 flex items-center gap-2">
                <Tag size={14} />
                热门标签
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setSelectedTag(selectedTag === tag ? null : tag)
                    }
                    className={`chip-pixel ${
                      selectedTag === tag
                        ? 'bg-pixel-neon-pink text-pixel-bg'
                        : 'bg-pixel-surface text-pixel-text-secondary hover:bg-pixel-card'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </PixelCard>
          </div>

          <div className="flex-1 min-w-0">
            <PixelCard className="p-4 mb-6" hover={false}>
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[250px]">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-pixel-text-muted"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="搜索素材..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-pixel pl-10 font-vt text-lg"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {filterTypes.map((type) => (
                    <PixelButton
                      key={type.id}
                      variant={selectedType === type.id ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedType(type.id)}
                    >
                      {type.label}
                    </PixelButton>
                  ))}
                </div>

                <PixelButton
                  variant={showFavoritesOnly ? 'warning' : 'ghost'}
                  size="sm"
                  onClick={toggleFavoritesOnly}
                  className="flex items-center gap-2"
                >
                  <Heart
                    size={14}
                    fill={showFavoritesOnly ? 'currentColor' : 'none'}
                  />
                  收藏
                </PixelButton>
              </div>
            </PixelCard>

            <div className="flex items-center justify-between mb-4">
              <p className="font-vt text-xl text-pixel-text-secondary">
                共{' '}
                <span className="text-pixel-neon-cyan">{filteredAssets.length}</span>{' '}
                个素材
              </p>
            </div>

            {filteredAssets.length === 0 ? (
              <PixelCard className="p-12 text-center" hover={false}>
                <div className="font-pixel text-pixel-sm text-pixel-text-muted mb-4">
                  暂无素材
                </div>
                <p className="font-vt text-lg text-pixel-text-secondary">
                  {searchQuery || showFavoritesOnly || selectedTag
                    ? '没有找到匹配的素材，试试其他筛选条件吧'
                    : '点击上方按钮上传你的第一个像素素材'}
                </p>
              </PixelCard>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredAssets.map((asset) => (
                  <motion.div
                    key={asset.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PixelCard glow className="overflow-hidden">
                      <div className="relative group">
                        <div className="aspect-square bg-pixel-surface overflow-hidden relative">
                          <img
                            src={asset.thumbnail}
                            alt={asset.name}
                            className="w-full h-full object-contain p-2 transition-transform group-hover:scale-110"
                            style={{ imageRendering: 'pixelated' }}
                          />
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(asset.id);
                              }}
                              className={`w-8 h-8 flex items-center justify-center border-4 border-pixel-bg transition-all ${
                                asset.favorite
                                  ? 'bg-pixel-neon-pink text-pixel-bg'
                                  : 'bg-pixel-card text-pixel-text-secondary hover:bg-pixel-border'
                              }`}
                              style={{ boxShadow: '2px 2px 0 0 #0D0B1F' }}
                            >
                              <Heart
                                size={14}
                                fill={asset.favorite ? 'currentColor' : 'none'}
                              />
                            </button>
                          </div>
                          {asset.favorite && (
                            <div className="absolute top-2 left-2">
                              <span className="chip-pixel bg-pixel-neon-yellow text-pixel-bg">
                                <Star size={10} className="mr-1" />
                                收藏
                              </span>
                            </div>
                          )}
                        </div>

                        <div
                          className="p-3 cursor-pointer"
                          onClick={() => handleAddToCanvas(asset)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-pixel text-pixel-xs text-pixel-text-primary line-clamp-2">
                              {asset.name}
                            </h3>
                            <span className="chip-pixel bg-pixel-neon-purple text-pixel-bg text-[8px] ml-2 flex-shrink-0">
                              {typeLabels[asset.type]}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {asset.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="font-vt text-sm text-pixel-neon-cyan opacity-70"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t-2 border-pixel-border">
                            <p className="font-pixel text-[10px] text-pixel-text-muted text-center">
                              点击添加到画布
                            </p>
                          </div>
                        </div>
                      </div>
                    </PixelCard>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <PixelCard className="bg-pixel-surface" hover={false}>
                <div className="flex items-center justify-between p-6 border-b-4 border-pixel-border">
                  <h2 className="font-pixel text-pixel-lg text-pixel-neon-pink pixel-text-shadow">
                    上传素材
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="w-10 h-10 flex items-center justify-center bg-pixel-card border-4 border-pixel-bg text-pixel-text-secondary hover:bg-pixel-border hover:text-pixel-text-primary transition-colors"
                    style={{ boxShadow: '3px 3px 0 0 #0D0B1F' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-4 border-dashed p-8 text-center transition-all ${
                      isDragging
                        ? 'border-pixel-neon-cyan bg-pixel-neon-cyan/10'
                        : 'border-pixel-border bg-pixel-card hover:border-pixel-neon-pink/50'
                    }`}
                  >
                    {uploadForm.thumbnail ? (
                      <div className="relative inline-block">
                        <img
                          src={uploadForm.thumbnail}
                          alt="预览"
                          className="max-w-xs max-h-48 object-contain border-4 border-pixel-border"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadForm((prev) => ({
                              ...prev,
                              thumbnail: '',
                              url: '',
                            }));
                          }}
                          className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center bg-pixel-neon-pink text-pixel-bg border-4 border-pixel-bg"
                          style={{ boxShadow: '2px 2px 0 0 #0D0B1F' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <ImagePlus
                          className="mx-auto mb-4 text-pixel-neon-cyan"
                          size={48}
                        />
                        <p className="font-pixel text-pixel-sm text-pixel-text-primary mb-2">
                          拖拽图片到这里
                        </p>
                        <p className="font-vt text-lg text-pixel-text-secondary mb-4">
                          或者点击选择文件
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-upload"
                        />
                        <PixelButton
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            document.getElementById('file-upload')?.click()
                          }
                        >
                          选择文件
                        </PixelButton>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-pixel text-pixel-xs text-pixel-text-primary mb-2">
                        素材名称 *
                      </label>
                      <input
                        type="text"
                        value={uploadForm.name}
                        onChange={(e) =>
                          setUploadForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="输入素材名称"
                        className="input-pixel"
                      />
                    </div>
                    <div>
                      <label className="block font-pixel text-pixel-xs text-pixel-text-primary mb-2">
                        素材类型 *
                      </label>
                      <select
                        value={uploadForm.type}
                        onChange={(e) =>
                          setUploadForm((prev) => ({
                            ...prev,
                            type: e.target.value as any,
                          }))
                        }
                        className="input-pixel cursor-pointer"
                      >
                        <option value="character">角色</option>
                        <option value="background">背景</option>
                        <option value="border">边框</option>
                        <option value="font">字体</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-pixel text-pixel-xs text-pixel-text-primary mb-2">
                      标签
                    </label>
                    <input
                      type="text"
                      value={uploadForm.tags}
                      onChange={(e) =>
                        setUploadForm((prev) => ({
                          ...prev,
                          tags: e.target.value,
                        }))
                      }
                      placeholder="用逗号分隔多个标签，如：像素, 复古, 角色"
                      className="input-pixel"
                    />
                    <p className="font-vt text-base text-pixel-text-muted mt-1">
                      提示：用英文逗号分隔多个标签
                    </p>
                  </div>

                  <div>
                    <label className="block font-pixel text-pixel-xs text-pixel-text-primary mb-2">
                      描述
                    </label>
                    <textarea
                      value={uploadForm.description}
                      onChange={(e) =>
                        setUploadForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="输入素材描述（可选）"
                      rows={3}
                      className="input-pixel resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 p-6 border-t-4 border-pixel-border">
                  <PixelButton
                    variant="ghost"
                    size="md"
                    onClick={handleCloseModal}
                  >
                    取消
                  </PixelButton>
                  <PixelButton
                    variant="primary"
                    size="md"
                    onClick={handleSubmit}
                    disabled={!uploadForm.name || !uploadForm.thumbnail}
                    className="flex items-center gap-2"
                  >
                    <Upload size={16} />
                    上传
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
