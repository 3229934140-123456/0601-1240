import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Swords,
  Shield,
  Zap,
  Download,
  Palette,
  Edit3,
  Play,
  Pause,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import PixelButton from '@/components/ui/PixelButton';
import PixelCard from '@/components/ui/PixelCard';
import { MOCK_CHARACTERS } from '@/data/assets';
import { PRESET_PALETTES } from '@/data/palettes';
import type { Character } from '@/types';

const CARTRIDGE_STYLES = [
  { id: 'classic', name: '经典卡带', border: '#4A3A6B', bg: '#2D1B4E', label: '#1A1635' },
  { id: 'neon-pink', name: '霓虹粉', border: '#FF6B9D', bg: '#3D1B2E', label: '#2D1B4E' },
  { id: 'neon-cyan', name: '霓虹青', border: '#64FFDA', bg: '#1B3D3D', label: '#1A2D35' },
  { id: 'neon-yellow', name: '霓虹黄', border: '#FFE66D', bg: '#3D3D1B', label: '#2D2D1B' },
];

const ANIMATION_TABS = [
  { id: 'idle', name: '待机' },
  { id: 'walk', name: '行走' },
  { id: 'attack', name: '攻击' },
];

type AnimationTab = 'idle' | 'walk' | 'attack';

export default function CharacterPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStats, setEditStats] = useState({ hp: 0, attack: 0, defense: 0, speed: 0 });
  const [selectedPalette, setSelectedPalette] = useState<string[]>([]);
  const [selectedCartridge, setSelectedCartridge] = useState(CARTRIDGE_STYLES[0]);
  const [activeTab, setActiveTab] = useState<AnimationTab>('idle');
  const [isAnimating, setIsAnimating] = useState(true);
  const [animationFrame, setAnimationFrame] = useState(0);
  const [showSheen, setShowSheen] = useState(false);

  const currentCharacter = MOCK_CHARACTERS[selectedIndex];

  const editedCharacter = useMemo<Character>(
    () => ({
      ...currentCharacter,
      name: editName || currentCharacter.name,
      description: editDescription || currentCharacter.description,
      stats: editStats,
      palette: selectedPalette.length > 0 ? selectedPalette : currentCharacter.palette,
    }),
    [currentCharacter, editName, editDescription, editStats, selectedPalette]
  );

  useEffect(() => {
    const char = MOCK_CHARACTERS[selectedIndex];
    setEditName(char.name);
    setEditDescription(char.description);
    setEditStats({ ...char.stats });
    setSelectedPalette([...char.palette]);
    setShowSheen(true);
    setTimeout(() => setShowSheen(false), 1500);
  }, [selectedIndex]);

  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      setAnimationFrame((prev) => (prev + 1) % 4);
    }, 200);
    return () => clearInterval(interval);
  }, [isAnimating]);

  const handleStatChange = (stat: keyof typeof editStats, value: number) => {
    setEditStats((prev) => ({ ...prev, [stat]: Math.max(0, Math.min(100, value)) }));
  };

  const handleExport = () => {
    setShowSheen(true);
    setTimeout(() => setShowSheen(false), 1500);
  };

  const generatePoseSprites = (char: Character) => {
    const baseColors = char.palette;
    const poses = [];
    for (let i = 0; i < 6; i++) {
      const colors = [...baseColors].sort(() => Math.random() - 0.5);
      const svg = generateCharacterSvg(colors, 64);
      poses.push(svg);
    }
    return poses;
  };

  const generateCharacterSvg = (colors: string[], size: number = 128) => {
    const cellSize = size / 16;
    const pattern = [
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 2, 2, 1, 1, 1, 1, 2, 2, 1, 1, 1, 0],
      [0, 1, 1, 1, 2, 2, 1, 1, 1, 1, 2, 2, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 3, 3, 3, 3, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 3, 3, 3, 3, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 4, 4, 4, 4, 4, 4, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 4, 4, 4, 4, 4, 4, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 4, 4, 4, 4, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    ];

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const cell = pattern[y][x];
        if (cell > 0) {
          const color = colors[(cell - 1) % colors.length];
          svg += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="${color}"/>`;
        }
      }
    }
    svg += '</svg>';
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  };

  const poseSprites = useMemo(
    () => generatePoseSprites(editedCharacter),
    [editedCharacter.palette.join(',')]
  );

  const StatBar = ({
    label,
    value,
    color,
    icon: Icon,
  }: {
    label: string;
    value: number;
    color: string;
    icon: React.ElementType;
  }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Icon size={12} className="text-pixel-neon-cyan" />
          <span className="text-pixel-xs text-pixel-text-primary">{label}</span>
        </div>
        <span className="text-pixel-xs text-pixel-neon-yellow">{value}</span>
      </div>
      <div className="h-3 bg-pixel-surface border-2 border-pixel-border overflow-hidden">
        <motion.div
          className="h-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );

  const StatSlider = ({
    label,
    value,
    color,
    icon: Icon,
    onChange,
  }: {
    label: string;
    value: number;
    color: string;
    icon: React.ElementType;
    onChange: (v: number) => void;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color }} />
          <span className="text-pixel-xs text-pixel-text-primary">{label}</span>
        </div>
        <span className="text-pixel-xs" style={{ color }}>
          {value}
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 appearance-none bg-pixel-surface border-2 border-pixel-border cursor-pointer"
        style={{
          accentColor: color,
        }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-pixel-bg pixel-grid-bg">
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="text-center mb-6">
          <h1 className="text-pixel-2xl text-pixel-neon-pink neon-glow-pink pixel-text-shadow mb-2">
            角色展示
          </h1>
          <p className="text-vt-lg text-pixel-text-secondary">
            CHARACTER GALLERY & EDITOR
          </p>
        </div>

        <div className="bg-pixel-card border-4 border-pixel-border p-2 mb-4" style={{ boxShadow: '4px 4px 0 0 #0D0B1F' }}>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <PixelButton
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIndex((prev) => Math.max(0, prev - 1))}
              disabled={selectedIndex === 0}
            >
              <ChevronLeft size={16} />
            </PixelButton>
            <div className="flex gap-2 flex-1 justify-center">
              {MOCK_CHARACTERS.map((char, index) => (
                <motion.button
                  key={char.id}
                  onClick={() => setSelectedIndex(index)}
                  className={`flex-shrink-0 p-2 border-4 transition-all ${
                    selectedIndex === index
                      ? 'border-pixel-neon-pink bg-pixel-neon-pink/20'
                      : 'border-pixel-border bg-pixel-surface hover:border-pixel-neon-cyan'
                  }`}
                  style={{
                    boxShadow:
                      selectedIndex === index
                        ? '4px 4px 0 0 #0D0B1F, 0 0 20px rgba(255, 107, 157, 0.5)'
                        : '4px 4px 0 0 #0D0B1F',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src={char.portrait}
                    alt={char.name}
                    className="w-12 h-12"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <div className="text-pixel-xs mt-1 text-center" style={{ fontFamily: '"Press Start 2P", monospace' }}>
                    {char.name}
                  </div>
                </motion.button>
              ))}
            </div>
            <PixelButton
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIndex((prev) => Math.min(MOCK_CHARACTERS.length - 1, prev + 1))}
              disabled={selectedIndex === MOCK_CHARACTERS.length - 1}
            >
              <ChevronRight size={16} />
            </PixelButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="relative overflow-hidden border-4 p-4"
                  style={{
                    backgroundColor: selectedCartridge.bg,
                    borderColor: selectedCartridge.border,
                    boxShadow: `4px 4px 0 0 #0D0B1F, 0 0 30px ${selectedCartridge.border}40`,
                  }}
                >
                  {showSheen && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent z-10 pointer-events-none"
                      initial={{ x: '-100%', skewX: '-12deg' }}
                      animate={{ x: '200%' }}
                      transition={{ duration: 1.5, ease: 'easeInOut' }}
                    />
                  )}

                  <div
                    className="border-4 p-3 mb-3"
                    style={{
                      backgroundColor: selectedCartridge.label,
                      borderColor: selectedCartridge.border,
                    }}
                  >
                    <div className="text-pixel-xs text-pixel-neon-cyan mb-2 text-center">
                      {editedCharacter.name.toUpperCase()}
                    </div>
                    <div className="flex justify-center">
                      <img
                        src={editedCharacter.portrait}
                        alt={editedCharacter.name}
                        className="w-32 h-32"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-pixel-xs text-pixel-neon-pink mb-1">
                      {editedCharacter.name}
                    </div>
                    <p className="text-vt-sm text-pixel-text-secondary">
                      {editedCharacter.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <StatBar
                      label="HP"
                      value={editedCharacter.stats.hp}
                      color="#FF6B9D"
                      icon={Heart}
                    />
                    <StatBar
                      label="ATK"
                      value={editedCharacter.stats.attack}
                      color="#FFE66D"
                      icon={Swords}
                    />
                    <StatBar
                      label="DEF"
                      value={editedCharacter.stats.defense}
                      color="#64FFDA"
                      icon={Shield}
                    />
                    <StatBar
                      label="SPD"
                      value={editedCharacter.stats.speed}
                      color="#C77DFF"
                      icon={Zap}
                    />
                  </div>

                  <div className="mt-4 pt-3 border-t-2 border-pixel-border">
                    <div className="text-pixel-xs text-pixel-text-muted mb-2">
                      PALETTE
                    </div>
                    <div className="flex gap-2">
                      {editedCharacter.palette.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-6 h-6 border-2 border-pixel-bg"
                          style={{ backgroundColor: color, boxShadow: '2px 2px 0 0 #0D0B1F' }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="absolute top-2 right-2 flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-pixel-neon-pink opacity-50"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <PixelCard hover={false} className="p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`portrait-${selectedIndex}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <div className="bg-pixel-surface border-4 border-pixel-border p-6 relative overflow-hidden">
                    <div className="absolute inset-0 scanline-overlay pointer-events-none opacity-50" />
                    <div className="flex justify-center">
                      <img
                        src={generateCharacterSvg(editedCharacter.palette, 256)}
                        alt={editedCharacter.name}
                        className="w-64 h-64"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <div className="w-2 h-2 bg-pixel-neon-cyan animate-pulse" />
                      <span className="text-pixel-xs text-pixel-neon-cyan">ONLINE</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </PixelCard>

            <PixelCard hover={false} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-pixel-xs text-pixel-neon-pink">
                  动作预览 / ANIMATION
                </div>
                <PixelButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAnimating(!isAnimating)}
                >
                  {isAnimating ? <Pause size={14} /> : <Play size={14} />}
                </PixelButton>
              </div>

              <div className="flex gap-2 mb-3">
                {ANIMATION_TABS.map((tab) => (
                  <PixelButton
                    key={tab.id}
                    variant={activeTab === tab.id ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab(tab.id as AnimationTab)}
                  >
                    {tab.name}
                  </PixelButton>
                ))}
              </div>

              <div className="bg-pixel-surface border-4 border-pixel-border p-4 flex justify-center items-center h-32">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`${activeTab}-${animationFrame}-${selectedIndex}`}
                    src={generateCharacterSvg(
                      editedCharacter.palette.map((c, i) =>
                        activeTab === 'attack' && i === 0 ? '#FF0000' : c
                      ),
                      96
                    )}
                    alt={activeTab}
                    className="w-24 h-24"
                    style={{ imageRendering: 'pixelated' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: 1,
                      y: activeTab === 'walk' ? [0, -4, 0] : 0,
                      rotate: activeTab === 'attack' ? [0, -10, 0] : 0,
                      scale: activeTab === 'idle' ? [1, 1.02, 1] : 1,
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: activeTab !== 'attack' ? Infinity : 0,
                      ease: 'easeInOut',
                    }}
                  />
                </AnimatePresence>
              </div>

              <div className="mt-3 flex justify-center gap-2">
                {[0, 1, 2, 3].map((frame) => (
                  <div
                    key={frame}
                    className={`w-3 h-3 border-2 border-pixel-bg transition-all ${
                      isAnimating && animationFrame === frame
                        ? 'bg-pixel-neon-pink shadow-neon-pink'
                        : 'bg-pixel-border'
                    }`}
                  />
                ))}
              </div>
            </PixelCard>

            <PixelCard hover={false} className="p-4">
              <div className="text-pixel-xs text-pixel-neon-cyan mb-3">
                多姿态展示 / POSES
              </div>
              <div className="grid grid-cols-3 gap-3">
                {poseSprites.map((sprite, idx) => (
                  <motion.div
                    key={`pose-${idx}-${editedCharacter.palette.join(',')}`}
                    className="bg-pixel-surface border-4 border-pixel-border p-2 flex justify-center items-center cursor-pointer hover:border-pixel-neon-pink transition-colors"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ boxShadow: '4px 4px 0 0 #0D0B1F' }}
                  >
                    <img
                      src={sprite}
                      alt={`pose-${idx}`}
                      className="w-12 h-12"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </motion.div>
                ))}
              </div>
            </PixelCard>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <PixelCard hover={false} className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Edit3 size={16} className="text-pixel-neon-pink" />
                <span className="text-pixel-sm text-pixel-neon-pink">
                  角色编辑
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-pixel-xs text-pixel-text-primary mb-2">
                    <User size={10} className="inline mr-1" />
                    角色名称
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input-pixel"
                    placeholder="输入角色名称..."
                  />
                </div>

                <div>
                  <label className="block text-pixel-xs text-pixel-text-primary mb-2">
                    角色描述
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="input-pixel min-h-20 resize-none"
                    placeholder="输入角色描述..."
                    rows={3}
                  />
                </div>
              </div>
            </PixelCard>

            <PixelCard hover={false} className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Swords size={16} className="text-pixel-neon-yellow" />
                <span className="text-pixel-sm text-pixel-neon-yellow">
                  属性调整
                </span>
              </div>

              <div className="space-y-4">
                <StatSlider
                  label="HP / 生命值"
                  value={editStats.hp}
                  color="#FF6B9D"
                  icon={Heart}
                  onChange={(v) => handleStatChange('hp', v)}
                />
                <StatSlider
                  label="ATK / 攻击力"
                  value={editStats.attack}
                  color="#FFE66D"
                  icon={Swords}
                  onChange={(v) => handleStatChange('attack', v)}
                />
                <StatSlider
                  label="DEF / 防御力"
                  value={editStats.defense}
                  color="#64FFDA"
                  icon={Shield}
                  onChange={(v) => handleStatChange('defense', v)}
                />
                <StatSlider
                  label="SPD / 速度"
                  value={editStats.speed}
                  color="#C77DFF"
                  icon={Zap}
                  onChange={(v) => handleStatChange('speed', v)}
                />
              </div>
            </PixelCard>

            <PixelCard hover={false} className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Palette size={16} className="text-pixel-neon-cyan" />
                <span className="text-pixel-sm text-pixel-neon-cyan">
                  调色板选择
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {PRESET_PALETTES.slice(0, 4).map((palette) => (
                  <motion.button
                    key={palette.id}
                    onClick={() => setSelectedPalette([...palette.colors])}
                    className={`p-2 border-4 transition-all ${
                      selectedPalette.join(',') === palette.colors.join(',')
                        ? 'border-pixel-neon-pink'
                        : 'border-pixel-border hover:border-pixel-neon-cyan'
                    }`}
                    style={{
                      backgroundColor: '#1A1635',
                      boxShadow: '4px 4px 0 0 #0D0B1F',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-pixel-xs text-pixel-text-primary mb-1 text-center">
                      {palette.name}
                    </div>
                    <div className="flex justify-center gap-1">
                      {palette.colors.slice(0, 4).map((color, idx) => (
                        <div
                          key={idx}
                          className="w-4 h-4 border border-pixel-bg"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-2">
                {editedCharacter.palette.map((color, idx) => (
                  <div key={idx} className="flex-1">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newPalette = [...selectedPalette];
                        newPalette[idx] = e.target.value;
                        setSelectedPalette(newPalette);
                      }}
                      className="w-full h-8 cursor-pointer border-2 border-pixel-border bg-transparent"
                    />
                  </div>
                ))}
              </div>
            </PixelCard>

            <PixelCard hover={false} className="p-4">
              <div className="text-pixel-sm text-pixel-neon-orange mb-3">
                卡带风格
              </div>
              <div className="grid grid-cols-2 gap-2">
                {CARTRIDGE_STYLES.map((style) => (
                  <motion.button
                    key={style.id}
                    onClick={() => setSelectedCartridge(style)}
                    className={`p-3 border-4 transition-all ${
                      selectedCartridge.id === style.id
                        ? 'border-pixel-neon-pink'
                        : 'border-pixel-border hover:border-pixel-neon-cyan'
                    }`}
                    style={{
                      backgroundColor: style.bg,
                      boxShadow: '4px 4px 0 0 #0D0B1F',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="w-full h-4 border-2 mb-1"
                      style={{ borderColor: style.border, backgroundColor: style.label }}
                    />
                    <div className="text-pixel-xs text-center" style={{ color: style.border }}>
                      {style.name}
                    </div>
                  </motion.button>
                ))}
              </div>
            </PixelCard>

            <PixelButton
              variant="primary"
              size="lg"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleExport}
            >
              <Download size={16} />
              导出角色卡
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}
