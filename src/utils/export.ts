import type { ExportItem, ReleaseChecklistItem } from '@/types';
import { PLATFORM_SPECS } from '@/data/ratios';

const generatePixelPattern = (width: number, height: number, colors: string[], type: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = colors[colors.length - 1] || '#2D1B4E';
  ctx.fillRect(0, 0, width, height);

  const pixelSize = Math.max(4, Math.floor(Math.min(width, height) / 32));
  
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      if (Math.random() > 0.7) {
        const colorIndex = Math.floor(Math.random() * (colors.length - 1));
        ctx.fillStyle = colors[colorIndex];
        ctx.globalAlpha = 0.3 + Math.random() * 0.5;
        ctx.fillRect(x, y, pixelSize, pixelSize);
      }
    }
  }

  ctx.globalAlpha = 1;

  const titleY = Math.floor(height * 0.3);
  const centerX = width / 2;

  const addPixelText = (text: string, y: number, size: number, color: string, stroke: string = '#0D0B1F') => {
    ctx.save();
    ctx.font = `bold ${size}px "Press Start 2P", monospace`;
    ctx.textAlign = 'center';
    ctx.fillStyle = stroke;
    ctx.fillText(text, centerX + Math.max(2, size / 16), y + Math.max(2, size / 16));
    ctx.fillStyle = color;
    ctx.fillText(text, centerX, y);
    ctx.restore();
  };

  if (type.includes('主图') || type.includes('英雄') || type.includes('封面')) {
    const titleSize = Math.floor(Math.min(width * 0.08, height * 0.2));
    addPixelText('PIXEL', titleY, titleSize, '#FF6B9D');
    addPixelText('FORGE', titleY + titleSize * 1.2, titleSize, '#64FFDA');
    
    const subSize = Math.floor(titleSize * 0.35);
    addPixelText('游戏名 / GAME TITLE', titleY + titleSize * 2.8, subSize, '#FFE66D');
    
    for (let i = 0; i < 15; i++) {
      const sx = Math.random() * width;
      const sy = Math.random() * height;
      const ssize = pixelSize * (1 + Math.floor(Math.random() * 3));
      ctx.fillStyle = colors[i % colors.length];
      ctx.globalAlpha = 0.6 + Math.random() * 0.4;
      ctx.fillRect(sx, sy, ssize, ssize);
    }
  } else if (type.includes('背景') || type.includes('Banner') || type.includes('推文')) {
    for (let i = 0; i < 40; i++) {
      const sx = Math.random() * width;
      const sy = Math.random() * height;
      const ssize = pixelSize * (1 + Math.floor(Math.random() * 2));
      ctx.fillStyle = colors[i % colors.length];
      ctx.globalAlpha = 0.5 + Math.random() * 0.5;
      ctx.fillRect(sx, sy, ssize, ssize);
    }
    
    const titleSize = Math.floor(Math.min(width * 0.05, height * 0.5));
    addPixelText('GAME TITLE', Math.floor(height / 2 + titleSize / 2), titleSize, '#FFE66D');
    
    const subSize = Math.floor(titleSize * 0.5);
    addPixelText('像素冒险 / 即将上线', Math.floor(height / 2 + titleSize * 1.8), subSize, '#64FFDA');
  } else if (type.includes('缩略') || type.includes('配图')) {
    ctx.globalAlpha = 1;
    for (let y = 0; y < height; y += pixelSize) {
      for (let x = 0; x < width; x += pixelSize) {
        const noise = Math.sin(x * 0.1) * Math.cos(y * 0.1);
        if (noise > 0.3) {
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.globalAlpha = 0.4 + Math.random() * 0.4;
          ctx.fillRect(x, y, pixelSize, pixelSize);
        }
      }
    }
    
    ctx.globalAlpha = 1;
    const titleSize = Math.floor(Math.min(width, height) * 0.15);
    addPixelText('GF', Math.floor(height / 2 + titleSize / 3), titleSize * 2, '#FF6B9D');
    
    const subSize = Math.floor(titleSize * 0.6);
    addPixelText('游戏截图', Math.floor(height / 2 + titleSize * 2), subSize, '#64FFDA');
  }

  const borderSize = Math.max(4, Math.floor(Math.min(width, height) * 0.01));
  ctx.globalAlpha = 1;
  
  ctx.fillStyle = '#FF6B9D';
  ctx.fillRect(0, 0, width, borderSize);
  ctx.fillRect(0, height - borderSize, width, borderSize);
  ctx.fillRect(0, 0, borderSize, height);
  ctx.fillRect(width - borderSize, 0, borderSize, height);
  
  ctx.fillStyle = '#0D0B1F';
  ctx.fillRect(borderSize, borderSize, width - borderSize * 2, borderSize);
  ctx.fillRect(borderSize, height - borderSize * 2, width - borderSize * 2, borderSize);
  ctx.fillRect(borderSize, borderSize, borderSize, height - borderSize * 2);
  ctx.fillRect(width - borderSize * 2, borderSize, borderSize, height - borderSize * 2);

  return canvas.toDataURL('image/png');
};

export const generateExportImage = (
  width: number,
  height: number,
  format: 'png' | 'jpg' | 'gif' | 'mp4',
  type: string,
  quality: number = 90
): Promise<{ dataUrl: string; blob: Blob | null }> => {
  return new Promise((resolve) => {
    const colors = ['#FF6B9D', '#64FFDA', '#FFE66D', '#FF8C42', '#2D1B4E'];
    const dataUrl = generatePixelPattern(width, height, colors, type);

    if (format === 'png' || format === 'gif') {
      const byteString = atob(dataUrl.split(',')[1]);
      const mimeString = format === 'gif' ? 'image/gif' : 'image/png';
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      resolve({ dataUrl, blob });
    } else if (format === 'jpg') {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0);
        }
        const jpgDataUrl = canvas.toDataURL('image/jpeg', quality / 100);
        const byteString = atob(jpgDataUrl.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: 'image/jpeg' });
        resolve({ dataUrl: jpgDataUrl, blob });
      };
      img.src = dataUrl;
    } else {
      resolve({ dataUrl, blob: null });
    }
  });
};

export const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateFilename = (
  prefix: string,
  platform: string,
  type: string,
  format: string,
  scale: number = 1,
  index?: number
): string => {
  const safePlatform = platform.replace(/[^a-zA-Z0-9]/g, '_');
  const safeType = type.replace(/[^a-zA-Z0-9]/g, '_');
  const suffix = typeof index === 'number' ? `_${String(index).padStart(3, '0')}` : '';
  const scaleSuffix = scale > 1 ? `_${scale}x` : '';
  return `${prefix}_${safePlatform}_${safeType}${scaleSuffix}${suffix}.${format}`;
};

export const generateReleaseChecklistContent = (
  projectName: string,
  items: ReleaseChecklistItem[],
  exportItems: ExportItem[]
): string => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const completedRequired = items.filter(i => i.required && i.done).length;
  const totalRequired = items.filter(i => i.required).length;
  const completedAll = items.filter(i => i.done).length;
  const totalAll = items.length;

  const platformGroups = items.reduce((acc, item) => {
    if (!acc[item.platform]) acc[item.platform] = [];
    acc[item.platform].push(item);
    return acc;
  }, {} as Record<string, ReleaseChecklistItem[]>);

  let content = '';
  content += '='.repeat(60) + '\n';
  content += '          PIXEL FORGE - 游戏发布清单\n';
  content += '='.repeat(60) + '\n\n';
  content += `项目名称: ${projectName}\n`;
  content += `生成日期: ${dateStr}\n`;
  content += `导出文件: ${exportItems.length} 个\n\n`;
  
  content += '-'.repeat(60) + '\n';
  content += '进度概览\n';
  content += '-'.repeat(60) + '\n';
  content += `必选项完成: ${completedRequired} / ${totalRequired} (${Math.round(completedRequired / totalRequired * 100)}%)\n`;
  content += `整体完成度: ${completedAll} / ${totalAll} (${Math.round(completedAll / totalAll * 100)}%)\n\n`;

  content += '-'.repeat(60) + '\n';
  content += '详细清单\n';
  content += '-'.repeat(60) + '\n\n';

  for (const [platform, platformItems] of Object.entries(platformGroups)) {
    content += `【${platform}】\n`;
    content += '-'.repeat(40) + '\n';
    
    for (const item of platformItems) {
      const checkbox = item.done ? '[✓]' : '[ ]';
      const required = item.required ? ' *必需*' : '  可选';
      content += `  ${checkbox}${required} ${item.title}\n`;
      content += `           ${item.description}\n`;
    }
    content += '\n';
  }

  content += '-'.repeat(60) + '\n';
  content += '导出文件列表\n';
  content += '-'.repeat(60) + '\n\n';

  const platformExports = exportItems.reduce((acc, item) => {
    if (!acc[item.platform]) acc[item.platform] = [];
    acc[item.platform].push(item);
    return acc;
  }, {} as Record<string, ExportItem[]>);

  for (const [platform, items] of Object.entries(platformExports)) {
    content += `  ${platform} (${items.length}个):\n`;
    for (const item of items) {
      const status = item.status === 'done' ? '✓' : item.status === 'error' ? '✗' : '○';
      content += `    ${status} ${item.name}.${item.format} (${item.width}x${item.height})\n`;
    }
    content += '\n';
  }

  content += '-'.repeat(60) + '\n';
  content += '平台尺寸规范参考\n';
  content += '-'.repeat(60) + '\n\n';

  const platformSpecGroups = PLATFORM_SPECS.reduce((acc, spec) => {
    if (!acc[spec.platform]) acc[spec.platform] = [];
    acc[spec.platform].push(spec);
    return acc;
  }, {} as Record<string, typeof PLATFORM_SPECS>);

  for (const [platform, specs] of Object.entries(platformSpecGroups)) {
    content += `  ${platform}:\n`;
    for (const spec of specs) {
      const required = spec.required ? ' [必需]' : ' [可选]';
      content += `    • ${spec.type}: ${spec.width}x${spec.height}${required}\n`;
    }
    content += '\n';
  }

  content += '='.repeat(60) + '\n';
  content += '     本清单由 PixelForge 自动生成\n';
  content += '='.repeat(60) + '\n';

  return content;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
};
