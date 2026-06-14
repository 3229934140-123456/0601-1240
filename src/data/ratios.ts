import type { CanvasRatio } from '@/types';

export const CANVAS_RATIOS: CanvasRatio[] = [
  { id: '16:9', name: '横版 16:9', width: 1920, height: 1080 },
  { id: '1:1', name: '正方形 1:1', width: 1080, height: 1080 },
  { id: '9:16', name: '竖版 9:16', width: 1080, height: 1920 },
  { id: '4:3', name: '标准 4:3', width: 1600, height: 1200 },
  { id: '3:4', name: '竖版 3:4', width: 1200, height: 1600 },
  { id: '21:9', name: '超宽 21:9', width: 2560, height: 1080 },
  { id: 'steam-main', name: 'Steam 主图', width: 460, height: 215, platform: 'Steam' },
  { id: 'steam-bg', name: 'Steam 背景图', width: 1920, height: 620, platform: 'Steam' },
  { id: 'steam-hero', name: 'Steam 英雄图', width: 616, height: 353, platform: 'Steam' },
  { id: 'epic-cover', name: 'Epic 封面图', width: 1200, height: 1600, platform: 'Epic' },
  { id: 'epic-thumb', name: 'Epic 缩略图', width: 280, height: 374, platform: 'Epic' },
  { id: 'twitter-post', name: 'Twitter 配图', width: 1200, height: 675, platform: 'Twitter' },
  { id: 'weibo-post', name: '微博配图', width: 1080, height: 1080, platform: '微博' },
  { id: 'bilibili-cover', name: 'B站封面', width: 1146, height: 717, platform: 'B站' },
];

export const PLATFORM_SPECS = [
  { platform: 'Steam', type: '主图', width: 460, height: 215, required: true },
  { platform: 'Steam', type: '背景图', width: 1920, height: 620, required: true },
  { platform: 'Steam', type: '英雄图', width: 616, height: 353, required: true },
  { platform: 'Epic', type: '封面图', width: 1200, height: 1600, required: true },
  { platform: 'Epic', type: '缩略图', width: 280, height: 374, required: true },
  { platform: 'Twitter', type: '推文图', width: 1200, height: 675, required: false },
  { platform: '微博', type: '配图', width: 1080, height: 1080, required: false },
  { platform: 'B站', type: '视频封面', width: 1146, height: 717, required: false },
];
