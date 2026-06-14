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
    exportItems: [
      { id: 'p1-exp-1', name: 'pixelquest_steam_main', format: 'png', width: 460, height: 215, platform: 'Steam', status: 'done', progress: 100 },
      { id: 'p1-exp-2', name: 'pixelquest_steam_bg', format: 'jpg', width: 1920, height: 620, platform: 'Steam', status: 'done', progress: 100 },
      { id: 'p1-exp-3', name: 'pixelquest_steam_hero', format: 'png', width: 616, height: 353, platform: 'Steam', status: 'pending', progress: 0 },
      { id: 'p1-exp-4', name: 'pixelquest_epic_cover', format: 'png', width: 1200, height: 1600, platform: 'Epic', status: 'processing', progress: 45 },
      { id: 'p1-exp-5', name: 'pixelquest_twitter_promo', format: 'gif', width: 1200, height: 675, platform: 'Twitter', status: 'done', progress: 100 },
    ],
    releaseChecklist: [
      { id: 'p1-c1', title: '像素冒险 Steam 主图', description: '460x215 商店主图（必选）', platform: 'Steam', done: true, required: true },
      { id: 'p1-c2', title: '像素冒险 Steam 背景图', description: '1920x620 页面背景（必选）', platform: 'Steam', done: true, required: true },
      { id: 'p1-c3', title: '像素冒险 Steam 英雄图', description: '616x353 首页展示（必选）', platform: 'Steam', done: false, required: true },
      { id: 'p1-c4', title: '像素冒险 Epic 封面', description: '1200x1600 竖版封面（必选）', platform: 'Epic', done: false, required: true },
      { id: 'p1-c5', title: '像素冒险 90秒宣传视频', description: '90秒游戏玩法', platform: '通用', done: false, required: false },
      { id: 'p1-c6', title: '像素冒险 社交素材包', description: '微博/B站/推特配图', platform: '社交', done: false, required: false },
    ],
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
    exportItems: [
      {
        id: 'exp-p2-1',
        name: 'spirit_woods_weibo_cover',
        platform: '微博',
        width: 1080, height: 1080,
        format: 'png',
        status: 'done',
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      },
      {
        id: 'exp-p2-2',
        name: 'spirit_woods_bilibili_cover',
        platform: 'B站',
        width: 1146, height: 717,
        format: 'jpg',
        status: 'done',
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000 + 1000,
      },
      {
        id: 'exp-p2-3',
        name: 'spirit_woods_wechat_share',
        platform: '微信分享',
        width: 500, height: 400,
        format: 'jpg',
        status: 'done',
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000 + 2000,
      },
      {
        id: 'exp-p2-4',
        name: 'elf_character_promo',
        platform: '角色宣传',
        width: 2048, height: 2048,
        format: 'png',
        status: 'processing',
        createdAt: Date.now() - 30 * 60 * 1000,
        progress: 62,
      },
      {
        id: 'exp-p2-5',
        name: 'spirit_woods_twitter_card',
        platform: 'Twitter',
        width: 1200, height: 628,
        format: 'png',
        status: 'pending',
        createdAt: Date.now() - 10 * 60 * 1000,
      },
    ],
    releaseChecklist: [
      { id: 'p2-c1', title: '森林精灵 - 微博九宫格', description: '1080x1080 社交主视觉 9张', platform: '微博', done: true, required: true },
      { id: 'p2-c2', title: '森林精灵 - B站封面', description: '1146x717 视频封面', platform: 'B站', done: true, required: true },
      { id: 'p2-c3', title: '森林精灵 - 微信分享图', description: '500x400 卡片缩略图', platform: '微信', done: true, required: true },
      { id: 'p2-c4', title: '森林精灵 - 角色立绘', description: '2048x2048 PNG 宣传立绘', platform: '角色宣传', done: false, required: true },
      { id: 'p2-c5', title: '森林精灵 - Twitter卡片', description: '1200x628 社交卡片', platform: 'Twitter', done: false, required: false },
      { id: 'p2-c6', title: '森林精灵 - TapTap详情页', description: '多图详情页素材', platform: 'TapTap', done: false, required: false },
    ],
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
    exportItems: [
      {
        id: 'exp-p3-1',
        name: 'neon_city_youtube_banner',
        platform: 'YouTube',
        width: 2560, height: 1440,
        format: 'jpg',
        status: 'done',
        createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
      },
      {
        id: 'exp-p3-2',
        name: 'cyber_trailer_gif_30fps',
        platform: '动图宣传',
        width: 1920, height: 1080,
        format: 'gif',
        status: 'done',
        createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000 + 1000,
      },
      {
        id: 'exp-p3-3',
        name: 'neon_city_16_9_poster',
        platform: '海报宣传',
        width: 1920, height: 1080,
        format: 'png',
        status: 'done',
        createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000 + 2000,
      },
      {
        id: 'exp-p3-4',
        name: 'cyber_neon_loop_gif',
        platform: '动图宣传',
        width: 800, height: 450,
        format: 'gif',
        status: 'processing',
        createdAt: Date.now() - 15 * 60 * 1000,
        progress: 81,
      },
      {
        id: 'exp-p3-5',
        name: 'neon_city_twitch_banner',
        platform: 'Twitch',
        width: 1200, height: 480,
        format: 'png',
        status: 'pending',
        createdAt: Date.now() - 5 * 60 * 1000,
      },
    ],
    releaseChecklist: [
      { id: 'p3-c1', title: '赛博都市 - YouTube Banner', description: '2560x1440 频道头图', platform: 'YouTube', done: true, required: true },
      { id: 'p3-c2', title: '赛博都市 - 宣传动图GIF', description: '1920x1080 30fps 预告动图', platform: '动图宣传', done: true, required: true },
      { id: 'p3-c3', title: '赛博都市 - 16:9海报', description: '1920x1080 PNG 高清海报', platform: '海报宣传', done: true, required: true },
      { id: 'p3-c4', title: '赛博都市 - 循环动图', description: '800x450 无缝循环GIF', platform: '动图宣传', done: false, required: true },
      { id: 'p3-c5', title: '赛博都市 - Twitch Banner', description: '1200x480 直播横幅', platform: 'Twitch', done: false, required: false },
      { id: 'p3-c6', title: '赛博都市 - 短视频素材', description: '抖音/TikTok 9:16素材', platform: '短视频', done: false, required: false },
    ],
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
    exportItems: [
      {
        id: 'exp-p4-1',
        name: 'abyss_epic_vertical_cover',
        platform: 'Epic',
        width: 1200, height: 1600,
        format: 'png',
        status: 'done',
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      },
      {
        id: 'exp-p4-2',
        name: 'deepsea_brand_kit_logo_pack',
        platform: '品牌套件',
        width: 4096, height: 4096,
        format: 'png',
        status: 'done',
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000 + 1000,
      },
      {
        id: 'exp-p4-3',
        name: 'abyss_steam_store_capsule',
        platform: 'Steam',
        width: 616, height: 353,
        format: 'jpg',
        status: 'done',
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000 + 2000,
      },
      {
        id: 'exp-p4-4',
        name: 'deepsea_store_bundle_art',
        platform: '商店套件',
        width: 1920, height: 620,
        format: 'jpg',
        status: 'processing',
        createdAt: Date.now() - 3 * 60 * 60 * 1000,
        progress: 45,
      },
      {
        id: 'exp-p4-5',
        name: 'abyss_brand_guidelines_pdf',
        platform: '品牌套件',
        width: 2480, height: 3508,
        format: 'png',
        status: 'pending',
        createdAt: Date.now() - 1 * 60 * 60 * 1000,
      },
    ],
    releaseChecklist: [
      { id: 'p4-c1', title: '深海探险 - Epic竖版封面', description: '1200x1600 商店主封面PNG', platform: 'Epic', done: true, required: true },
      { id: 'p4-c2', title: '深海探险 - Logo品牌套件', description: '4096x4096 全尺寸Logo包', platform: '品牌套件', done: true, required: true },
      { id: 'p4-c3', title: '深海探险 - Steam胶囊图', description: '616x353 商店小胶囊JPG', platform: 'Steam', done: true, required: true },
      { id: 'p4-c4', title: '深海探险 - 商店套件Banner', description: '1920x620 商店套件横幅', platform: '商店套件', done: false, required: true },
      { id: 'p4-c5', title: '深海探险 - 品牌规范手册', description: 'A4 品牌指南视觉稿', platform: '品牌套件', done: false, required: false },
      { id: 'p4-c6', title: '深海探险 - 媒体评测素材', description: '媒体包全套素材', platform: '媒体', done: false, required: false },
    ],
  },
];
