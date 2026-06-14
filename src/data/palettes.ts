import type { ColorPalette } from '@/types';

export const PRESET_PALETTES: ColorPalette[] = [
  {
    id: 'retro-neon',
    name: '复古霓虹',
    colors: ['#FF6B9D', '#64FFDA', '#FFE66D', '#FF8C42', '#2D1B4E'],
  },
  {
    id: 'pixel-forest',
    name: '像素森林',
    colors: ['#7CB342', '#33691E', '#8D6E63', '#FFD54F', '#1B5E20'],
  },
  {
    id: 'deep-ocean',
    name: '深海探险',
    colors: ['#00BCD4', '#01579B', '#006064', '#4FC3F7', '#E1F5FE'],
  },
  {
    id: 'sunset-blaze',
    name: '落日烈焰',
    colors: ['#FF5722', '#FF9800', '#FFC107', '#E91E63', '#3F51B5'],
  },
  {
    id: 'ghost-town',
    name: '幽灵小镇',
    colors: ['#9E9E9E', '#607D8B', '#455A64', '#CFD8DC', '#263238'],
  },
  {
    id: 'candy-land',
    name: '糖果乐园',
    colors: ['#F48FB1', '#CE93D8', '#90CAF9', '#81D4FA', '#A5D6A7'],
  },
  {
    id: 'desert-storm',
    name: '沙漠风暴',
    colors: ['#D7CCC8', '#A1887F', '#6D4C41', '#FFAB91', '#FFF3E0'],
  },
  {
    id: 'cyber-punk',
    name: '赛博朋克',
    colors: ['#F50057', '#D500F9', '#651FFF', '#00E5FF', '#76FF03'],
  },
];

export const FONT_COMBINATIONS = [
  {
    id: 'retro-title',
    name: '复古标题',
    title: { family: 'Press Start 2P', size: 32 },
    subtitle: { family: 'VT323', size: 20 },
  },
  {
    id: 'pixel-body',
    name: '像素正文',
    title: { family: 'Press Start 2P', size: 24 },
    subtitle: { family: 'VT323', size: 18 },
  },
  {
    id: 'neon-bold',
    name: '霓虹粗体',
    title: { family: 'Press Start 2P', size: 40 },
    subtitle: { family: 'VT323', size: 24 },
  },
];
