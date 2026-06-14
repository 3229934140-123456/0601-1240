import type { Asset, Character, Project } from '@/types';
import { PRESET_PALETTES } from './palettes';

const generatePixelSvg = (colors: string[], size: number = 64) => {
  const cellSize = size / 8;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const colorIndex = (x + y) % colors.length;
      const shouldFill = Math.random() > 0.3;
      if (shouldFill) {
        svg += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="${colors[colorIndex]}"/>`;
      }
    }
  }
  svg += '</svg>';
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const generateCharacterSvg = (colors: string[], size: number = 128) => {
  const cellSize = size / 16;
  const pattern = [
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,2,2,1,1,1,1,2,2,1,1,1,0],
    [0,1,1,1,2,2,1,1,1,1,2,2,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,3,3,3,3,1,1,1,1,1,0],
    [0,1,1,1,1,1,3,3,3,3,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,3,3,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,1,1,4,4,4,4,4,4,1,1,0,0,0],
    [0,0,0,1,1,4,4,4,4,4,4,1,1,0,0,0],
    [0,0,0,0,1,1,4,4,4,4,1,1,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0],
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

const generateBackgroundSvg = (colors: string[], width: number = 192, height: number = 108) => {
  const cellSize = 12;
  const cols = Math.floor(width / cellSize);
  const rows = Math.floor(height / cellSize);
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  svg += `<rect width="100%" height="100%" fill="${colors[colors.length - 1]}"/>`;
  
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const noise = Math.random();
      if (noise > 0.85) {
        const colorIndex = Math.floor(Math.random() * (colors.length - 1));
        svg += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="${colors[colorIndex]}" opacity="${0.3 + Math.random() * 0.4}"/>`;
      }
    }
  }
  
  for (let i = 0; i < 5; i++) {
    const starX = Math.random() * width;
    const starY = Math.random() * height;
    const starSize = 2 + Math.random() * 4;
    svg += `<rect x="${starX}" y="${starY}" width="${starSize}" height="${starSize}" fill="${colors[0]}" opacity="${0.5 + Math.random() * 0.5}"/>`;
  }
  
  svg += '</svg>';
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const MOCK_CHARACTERS: Character[] = [
  {
    id: 'char-1',
    name: '像素勇者',
    description: '来自像素王国的勇敢战士，手持光之剑。',
    portrait: generateCharacterSvg(['#FF6B9D', '#64FFDA', '#FFE66D', '#FF8C42'], 128),
    sprites: {
      idle: [generateCharacterSvg(['#FF6B9D', '#64FFDA', '#FFE66D', '#FF8C42'], 64)],
      walk: [generateCharacterSvg(['#FF6B9D', '#64FFDA', '#FFE66D', '#FF8C42'], 64)],
      attack: [generateCharacterSvg(['#FF6B9D', '#64FFDA', '#FFE66D', '#FF8C42'], 64)],
    },
    stats: { hp: 100, attack: 85, defense: 60, speed: 75 },
    palette: ['#FF6B9D', '#64FFDA', '#FFE66D', '#FF8C42'],
  },
  {
    id: 'char-2',
    name: '森林精灵',
    description: '守护像素森林的神秘精灵。',
    portrait: generateCharacterSvg(['#7CB342', '#33691E', '#8D6E63', '#FFD54F'], 128),
    sprites: {
      idle: [generateCharacterSvg(['#7CB342', '#33691E', '#8D6E63', '#FFD54F'], 64)],
      walk: [generateCharacterSvg(['#7CB342', '#33691E', '#8D6E63', '#FFD54F'], 64)],
      attack: [generateCharacterSvg(['#7CB342', '#33691E', '#8D6E63', '#FFD54F'], 64)],
    },
    stats: { hp: 80, attack: 70, defense: 45, speed: 95 },
    palette: ['#7CB342', '#33691E', '#8D6E63', '#FFD54F'],
  },
  {
    id: 'char-3',
    name: '深海法师',
    description: '掌握水元素魔法的深海守护者。',
    portrait: generateCharacterSvg(['#00BCD4', '#01579B', '#006064', '#4FC3F7'], 128),
    sprites: {
      idle: [generateCharacterSvg(['#00BCD4', '#01579B', '#006064', '#4FC3F7'], 64)],
      walk: [generateCharacterSvg(['#00BCD4', '#01579B', '#006064', '#4FC3F7'], 64)],
      attack: [generateCharacterSvg(['#00BCD4', '#01579B', '#006064', '#4FC3F7'], 64)],
    },
    stats: { hp: 70, attack: 95, defense: 40, speed: 65 },
    palette: ['#00BCD4', '#01579B', '#006064', '#4FC3F7'],
  },
  {
    id: 'char-4',
    name: '机械战士',
    description: '来自未来的像素机甲战士。',
    portrait: generateCharacterSvg(['#F50057', '#D500F9', '#651FFF', '#00E5FF'], 128),
    sprites: {
      idle: [generateCharacterSvg(['#F50057', '#D500F9', '#651FFF', '#00E5FF'], 64)],
      walk: [generateCharacterSvg(['#F50057', '#D500F9', '#651FFF', '#00E5FF'], 64)],
      attack: [generateCharacterSvg(['#F50057', '#D500F9', '#651FFF', '#00E5FF'], 64)],
    },
    stats: { hp: 120, attack: 90, defense: 85, speed: 50 },
    palette: ['#F50057', '#D500F9', '#651FFF', '#00E5FF'],
  },
];

export const MOCK_ASSETS: Asset[] = [
  ...MOCK_CHARACTERS.map((char) => ({
    id: char.id,
    type: 'character' as const,
    name: char.name,
    thumbnail: char.portrait,
    url: char.portrait,
    tags: ['角色', '像素'],
    favorite: false,
    palette: char.palette,
    description: char.description,
  })),
  {
    id: 'bg-1',
    type: 'background',
    name: '霓虹夜空',
    thumbnail: generateBackgroundSvg(['#FF6B9D', '#64FFDA', '#FFE66D', '#2D1B4E'], 192, 108),
    url: generateBackgroundSvg(['#FF6B9D', '#64FFDA', '#FFE66D', '#2D1B4E'], 1920, 1080),
    tags: ['背景', '夜景', '霓虹'],
    favorite: true,
    palette: ['#FF6B9D', '#64FFDA', '#FFE66D', '#2D1B4E'],
  },
  {
    id: 'bg-2',
    type: 'background',
    name: '像素森林',
    thumbnail: generateBackgroundSvg(['#7CB342', '#33691E', '#8D6E63', '#1B5E20'], 192, 108),
    url: generateBackgroundSvg(['#7CB342', '#33691E', '#8D6E63', '#1B5E20'], 1920, 1080),
    tags: ['背景', '森林', '自然'],
    favorite: false,
    palette: ['#7CB342', '#33691E', '#8D6E63', '#1B5E20'],
  },
  {
    id: 'bg-3',
    type: 'background',
    name: '深海秘境',
    thumbnail: generateBackgroundSvg(['#00BCD4', '#01579B', '#006064', '#E1F5FE'], 192, 108),
    url: generateBackgroundSvg(['#00BCD4', '#01579B', '#006064', '#E1F5FE'], 1920, 1080),
    tags: ['背景', '海洋', '神秘'],
    favorite: false,
    palette: ['#00BCD4', '#01579B', '#006064', '#E1F5FE'],
  },
  {
    id: 'bg-4',
    type: 'background',
    name: '赛博都市',
    thumbnail: generateBackgroundSvg(['#F50057', '#D500F9', '#651FFF', '#263238'], 192, 108),
    url: generateBackgroundSvg(['#F50057', '#D500F9', '#651FFF', '#263238'], 1920, 1080),
    tags: ['背景', '城市', '科技'],
    favorite: true,
    palette: ['#F50057', '#D500F9', '#651FFF', '#263238'],
  },
  {
    id: 'border-1',
    type: 'border',
    name: '复古边框',
    thumbnail: generatePixelSvg(['#FF6B9D', '#64FFDA'], 64),
    url: '',
    tags: ['边框', '复古'],
    favorite: false,
  },
  {
    id: 'border-2',
    type: 'border',
    name: '霓虹边框',
    thumbnail: generatePixelSvg(['#FF6B9D', '#FFE66D', '#64FFDA'], 64),
    url: '',
    tags: ['边框', '霓虹'],
    favorite: true,
  },
  {
    id: 'border-3',
    type: 'border',
    name: '像素相框',
    thumbnail: generatePixelSvg(['#8D6E63', '#A1887F'], 64),
    url: '',
    tags: ['边框', '相框'],
    favorite: false,
  },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'project-1',
    name: '像素冒险 - Steam 商店页',
    thumbnail: generateBackgroundSvg(['#FF6B9D', '#64FFDA', '#FFE66D', '#2D1B4E'], 46, 22),
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 2 * 60 * 60 * 1000,
    versions: [
      { id: 'v2', name: '版本 1.1 - 优化了角色配色', snapshot: '', createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, author: '开发者A' },
      { id: 'v1', name: '版本 1.0', snapshot: '', createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, author: '开发者A' },
    ],
    collaborators: [
      { id: 'u2', name: '美术B', avatar: '', role: 'editor' },
      { id: 'u1', name: '开发者A', avatar: '', role: 'owner' },
    ],
    comments: [
      { id: 'c1', content: '这里的颜色可以再亮一点', position: { x: 100, y: 100 }, author: '美术B', avatar: '', createdAt: Date.now() - 24 * 60 * 60 * 1000, resolved: false },
    ],
    currentRatio: 'steam-main',
    palette: PRESET_PALETTES[0],
    brandAssets: {
      palettes: [PRESET_PALETTES[0], PRESET_PALETTES[5], PRESET_PALETTES[1]],
      logoVariants: [
        {
          id: 'logo-p1-main',
          name: '主 Logo',
          slogan: '像素冒险',
          tagline: 'PIXEL QUEST',
          description: '游戏官方主标识，适用于商店页面和宣传物料',
          iconSymbol: '★',
        },
        {
          id: 'logo-p1-alt',
          name: '复古变体',
          slogan: '勇者传说',
          tagline: 'EPIC ADVENTURE',
          description: '复古绿配色，适用于怀旧向宣传',
          iconSymbol: '♦',
        },
      ],
      brandPackages: [],
    },
  },
  {
    id: 'project-2',
    name: '森林精灵 - 角色宣传',
    thumbnail: generateCharacterSvg(['#7CB342', '#33691E', '#8D6E63', '#FFD54F'], 64),
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 5 * 60 * 60 * 1000,
    versions: [
      { id: 'v1', name: '初稿', snapshot: '', createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000, author: '开发者A' },
    ],
    collaborators: [
      { id: 'u1', name: '开发者A', avatar: '', role: 'owner' },
    ],
    comments: [],
    currentRatio: '1:1',
    palette: PRESET_PALETTES[1],
    brandAssets: {
      palettes: [PRESET_PALETTES[1], PRESET_PALETTES[3]],
      logoVariants: [
        {
          id: 'logo-p2-main',
          name: '森之守护',
          slogan: '森林精灵',
          tagline: 'SPIRIT OF THE WOODS',
          description: '自然主题 Logo',
          iconSymbol: '✿',
        },
      ],
      brandPackages: [],
    },
  },
  {
    id: 'project-3',
    name: '赛博都市 - 动图宣传',
    thumbnail: generateBackgroundSvg(['#F50057', '#D500F9', '#651FFF', '#263238'], 46, 22),
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 30 * 60 * 1000,
    versions: [],
    collaborators: [
      { id: 'u3', name: '策划C', avatar: '', role: 'viewer' },
      { id: 'u1', name: '开发者A', avatar: '', role: 'owner' },
    ],
    comments: [],
    currentRatio: '16:9',
    palette: PRESET_PALETTES[7],
    brandAssets: {
      palettes: [PRESET_PALETTES[7], PRESET_PALETTES[0]],
      logoVariants: [
        {
          id: 'logo-p3-main',
          name: '霓虹之都',
          slogan: '赛博都市',
          tagline: 'NEON CITY 2099',
          description: '赛博朋克风 Logo',
          iconSymbol: '⚡',
        },
      ],
      brandPackages: [],
    },
  },
  {
    id: 'project-4',
    name: '深海探险 - 品牌套件',
    thumbnail: generateBackgroundSvg(['#00BCD4', '#01579B', '#006064', '#E1F5FE'], 46, 22),
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    versions: [],
    collaborators: [
      { id: 'u1', name: '开发者A', avatar: '', role: 'owner' },
    ],
    comments: [],
    currentRatio: 'epic-cover',
    palette: PRESET_PALETTES[2],
    brandAssets: {
      palettes: [PRESET_PALETTES[2], PRESET_PALETTES[6], PRESET_PALETTES[4]],
      logoVariants: [
        {
          id: 'logo-p4-main',
          name: '深渊之眼',
          slogan: '深海探险',
          tagline: 'ABYSS EXPLORER',
          description: '深海主题 Logo',
          iconSymbol: '◉',
        },
        {
          id: 'logo-p4-alt',
          name: '船长标识',
          slogan: '航海日志',
          tagline: "CAPTAIN'S LOG",
          description: '航海风变体',
          iconSymbol: '▲',
        },
      ],
      brandPackages: [],
    },
  },
];

export const MOCK_RELEASE_CHECKLIST = [
  { id: 'r1', title: 'Steam 主图', description: '460x215 像素商店主图', platform: 'Steam', done: true, required: true },
  { id: 'r2', title: 'Steam 背景图', description: '1920x620 页面背景', platform: 'Steam', done: true, required: true },
  { id: 'r3', title: 'Steam 英雄图', description: '616x353 首页展示', platform: 'Steam', done: false, required: true },
  { id: 'r4', title: 'Epic 封面图', description: '1200x1600 竖版封面', platform: 'Epic', done: true, required: true },
  { id: 'r5', title: '宣传视频', description: '90秒游戏展示视频', platform: '通用', done: false, required: false },
  { id: 'r6', title: '社交媒体素材包', description: 'Twitter/微博配图', platform: '社交', done: true, required: false },
];
