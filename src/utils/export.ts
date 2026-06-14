import JSZip from 'jszip';
import type { ExportItem, ReleaseChecklistItem } from '@/types';
import { PLATFORM_SPECS } from '@/data/ratios';

const renderPixelArtToCanvas = (
  width: number,
  height: number,
  colors: string[],
  type: string
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

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

  return canvas;
};

const lzwEncode = (indices: number[], minCodeSize: number): number[] => {
  const output: number[] = [];
  let codeSize = minCodeSize + 1;
  let clearCode = 1 << minCodeSize;
  let eoiCode = clearCode + 1;
  let nextCode = eoiCode + 1;
  let dict = new Map<string, number>();
  const resetDict = () => {
    dict.clear();
    for (let i = 0; i < clearCode; i++) dict.set(String(i), i);
    nextCode = eoiCode + 1;
    codeSize = minCodeSize + 1;
  };
  resetDict();
  let bitBuffer = 0;
  let bitCount = 0;
  const writeCode = (code: number) => {
    bitBuffer |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      output.push(bitBuffer & 0xff);
      bitBuffer >>= 8;
      bitCount -= 8;
    }
  };
  writeCode(clearCode);
  let w = String(indices[0]);
  for (let i = 1; i < indices.length; i++) {
    const k = String(indices[i]);
    const wk = w + ',' + k;
    if (dict.has(wk)) {
      w = wk;
    } else {
      writeCode(dict.get(w)!);
      if (nextCode < 4096) {
        dict.set(wk, nextCode++);
        if (nextCode > (1 << codeSize) && codeSize < 12) codeSize++;
      } else {
        writeCode(clearCode);
        resetDict();
      }
      w = k;
    }
  }
  writeCode(dict.get(w)!);
  writeCode(eoiCode);
  if (bitCount > 0) output.push(bitBuffer & 0xff);
  return output;
};

const makeGif89a = (canvas: HTMLCanvasElement): { dataUrl: string; blob: Blob } => {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.getImageData(0, 0, w, h).data;

  const paletteMap = new Map<number, number>();
  const paletteArr: number[] = [];
  const pixels: number[] = [];

  for (let i = 0; i < imgData.length; i += 4) {
    const r = imgData[i], g = imgData[i + 1], b = imgData[i + 2];
    const key = (r << 16) | (g << 8) | b;
    let idx = paletteMap.get(key);
    if (idx === undefined) {
      if (paletteArr.length >= 256) {
        let bestIdx = 0;
        let bestDist = Infinity;
        for (let p = 0; p < paletteArr.length; p += 3) {
          const dr = r - paletteArr[p];
          const dg = g - paletteArr[p + 1];
          const db = b - paletteArr[p + 2];
          const d = dr * dr + dg * dg + db * db;
          if (d < bestDist) { bestDist = d; bestIdx = p / 3; }
        }
        idx = bestIdx;
      } else {
        idx = paletteArr.length / 3;
        paletteArr.push(r, g, b);
        paletteMap.set(key, idx);
      }
    }
    pixels.push(idx);
  }

  while (paletteArr.length < 6) paletteArr.push(0);
  let pow = 1;
  while ((1 << pow) * 3 < paletteArr.length) pow++;
  const colorTableSize = 1 << pow;
  while (paletteArr.length < colorTableSize * 3) paletteArr.push(0);

  const bytes: number[] = [];
  const pushStr = (s: string) => { for (let i = 0; i < s.length; i++) bytes.push(s.charCodeAt(i) & 0xff); };
  const pushWord = (v: number) => { bytes.push(v & 0xff); bytes.push((v >> 8) & 0xff); };

  pushStr('GIF89a');
  pushWord(w);
  pushWord(h);
  bytes.push(0xf0 | (pow - 1));
  bytes.push(0);
  bytes.push(0);
  for (let i = 0; i < colorTableSize * 3; i++) bytes.push(paletteArr[i] & 0xff);
  bytes.push(0x21);
  bytes.push(0xf9);
  bytes.push(4);
  bytes.push(0);
  pushWord(0);
  bytes.push(0);
  bytes.push(0);
  bytes.push(0x2c);
  pushWord(0);
  pushWord(0);
  pushWord(w);
  pushWord(h);
  bytes.push(0);
  const minCodeSize = Math.max(2, pow);
  bytes.push(minCodeSize);
  const encoded = lzwEncode(pixels, minCodeSize);
  for (let off = 0; off < encoded.length; off += 255) {
    const chunk = encoded.slice(off, off + 255);
    bytes.push(chunk.length);
    for (const b of chunk) bytes.push(b);
  }
  bytes.push(0);
  bytes.push(0x3b);

  const ab = new Uint8Array(bytes).buffer;
  const blob = new Blob([ab], { type: 'image/gif' });
  let binary = '';
  const u8 = new Uint8Array(ab);
  for (let i = 0; i < u8.byteLength; i++) binary += String.fromCharCode(u8[i]);
  const dataUrl = 'data:image/gif;base64,' + btoa(binary);
  return { dataUrl, blob };
};

const dataUrlToBlob = (dataUrl: string, mime: string): Blob => {
  const byteString = atob(dataUrl.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: mime });
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
    const canvas = renderPixelArtToCanvas(width, height, colors, type);

    if (format === 'png') {
      const dataUrl = canvas.toDataURL('image/png');
      const blob = dataUrlToBlob(dataUrl, 'image/png');
      resolve({ dataUrl, blob });
    } else if (format === 'jpg') {
      const whiteCanvas = document.createElement('canvas');
      whiteCanvas.width = width;
      whiteCanvas.height = height;
      const wctx = whiteCanvas.getContext('2d')!;
      wctx.fillStyle = '#FFFFFF';
      wctx.fillRect(0, 0, width, height);
      wctx.drawImage(canvas, 0, 0);
      const dataUrl = whiteCanvas.toDataURL('image/jpeg', quality / 100);
      const blob = dataUrlToBlob(dataUrl, 'image/jpeg');
      resolve({ dataUrl, blob });
    } else if (format === 'gif') {
      const { dataUrl, blob } = makeGif89a(canvas);
      resolve({ dataUrl, blob });
    } else {
      const dataUrl = canvas.toDataURL('image/png');
      const blob = dataUrlToBlob(dataUrl, 'image/png');
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

export const syncChecklistFromExports = (
  checklist: ReleaseChecklistItem[],
  exportItems: ExportItem[]
): ReleaseChecklistItem[] => {
  const doneSet = new Map<string, ExportItem>();
  for (const exp of exportItems.filter((e) => e.status === 'done')) {
    const key = `${exp.platform}|${exp.name}`.toLowerCase();
    doneSet.set(key, exp);
  }
  return checklist.map((item) => {
    if (item.done) return item;
    const exactKey = `${item.platform}|${item.title}`.toLowerCase();
    if (doneSet.has(exactKey)) return { ...item, done: true };
    for (const [key] of doneSet.entries()) {
      if (
        key.includes(item.platform.toLowerCase()) &&
        (item.title.split(/\s+/).some((w) => key.includes(w.toLowerCase())) ||
          Array.from(key).filter((c) => item.title.toLowerCase().includes(c)).length >= 4)
      ) {
        return { ...item, done: true };
      }
    }
    return item;
  });
};

export const generateReleaseChecklistContent = (
  projectName: string,
  items: ReleaseChecklistItem[],
  exportItems: ExportItem[]
): string => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const completedRequired = items.filter(i => i.required && i.done).length;
  const totalRequired = items.filter(i => i.required).length;
  const completedAll = items.filter(i => i.done).length;
  const totalAll = items.length;

  const platformGroups = items.reduce((acc, item) => {
    if (!acc[item.platform]) acc[item.platform] = [];
    acc[item.platform].push(item);
    return acc;
  }, {} as Record<string, ReleaseChecklistItem[]>);

  const platformExports = exportItems.reduce((acc, item) => {
    if (!acc[item.platform]) acc[item.platform] = [];
    acc[item.platform].push(item);
    return acc;
  }, {} as Record<string, ExportItem[]>);

  const missingRequired = items.filter((i) => i.required && !i.done);
  const missingOptional = items.filter((i) => !i.required && !i.done);

  let content = '';
  content += '='.repeat(64) + '\n';
  content += '          ★  PIXEL FORGE - 游戏发布清单  ★\n';
  content += '='.repeat(64) + '\n\n';
  content += `▸ 项目名称: ${projectName}\n`;
  content += `▸ 生成日期: ${dateStr} ${timeStr}\n`;
  content += `▸ 导出文件: ${exportItems.filter((e) => e.status === 'done').length} / ${exportItems.length} 个已完成\n\n`;
  
  content += '-'.repeat(64) + '\n';
  content += '【进度概览】\n';
  content += '-'.repeat(64) + '\n';
  const barLen = 30;
  const filledLen = Math.round((completedRequired / Math.max(1, totalRequired)) * barLen);
  const progressBar = '█'.repeat(filledLen) + '░'.repeat(barLen - filledLen);
  content += `必选项: ${progressBar} ${completedRequired}/${totalRequired} (${Math.round(completedRequired / Math.max(1, totalRequired) * 100)}%)\n`;
  const filledAll = Math.round((completedAll / Math.max(1, totalAll)) * barLen);
  const progressBarAll = '█'.repeat(filledAll) + '░'.repeat(barLen - filledAll);
  content += `整体进度: ${progressBarAll} ${completedAll}/${totalAll} (${Math.round(completedAll / Math.max(1, totalAll) * 100)}%)\n\n`;

  if (missingRequired.length > 0 || missingOptional.length > 0) {
    content += '-'.repeat(64) + '\n';
    content += '【⚠ 缺失项提醒】\n';
    content += '-'.repeat(64) + '\n';
    if (missingRequired.length > 0) {
      content += `  ✗ 必需缺失 (${missingRequired.length} 个):\n`;
      for (const m of missingRequired) {
        content += `      → [${m.platform}] ${m.title} - ${m.description}\n`;
      }
    }
    if (missingOptional.length > 0) {
      content += `  ○ 可选缺失 (${missingOptional.length} 个):\n`;
      for (const m of missingOptional) {
        content += `      → [${m.platform}] ${m.title} - ${m.description}\n`;
      }
    }
    content += '\n';
  }

  content += '-'.repeat(64) + '\n';
  content += '【详细清单 (含对应文件名/尺寸)】\n';
  content += '-'.repeat(64) + '\n\n';

  for (const [platform, platformItems] of Object.entries(platformGroups)) {
    content += `┌─ ${platform} ─────────────────────\n`;
    
    for (const item of platformItems) {
      const checkbox = item.done ? '✓' : '✗';
      const tag = item.required ? '必需' : '可选';
      const color = item.done ? '' : (item.required ? ' 【紧急】' : '');
      content += `│ ${checkbox} [${tag}] ${item.title}${color}\n`;
      content += `│      说明: ${item.description}\n`;
      
      const related = exportItems.filter(
        (e) => e.platform === platform &&
          (e.name.toLowerCase().includes(item.title.toLowerCase().split(/\s+/)[0] || '') ||
            item.title.toLowerCase().includes(e.name.toLowerCase().split(/\s+/)[0] || ''))
      );
      if (related.length > 0) {
        content += `│      文件:\n`;
        for (const f of related) {
          const fstatus = f.status === 'done' ? '✓' : f.status === 'error' ? '✗' : '○';
          content += `│         ${fstatus} 文件名: ${f.name}.${f.format}  尺寸: ${f.width}×${f.height}\n`;
        }
      } else if (item.done) {
        content += `│      状态: 已完成，但未匹配到具体导出文件\n`;
      }
    }
    content += '└\n\n';
  }

  content += '-'.repeat(64) + '\n';
  content += '【导出文件索引 (可直接发给发行同事)】\n';
  content += '-'.repeat(64) + '\n\n';

  for (const [platform, items] of Object.entries(platformExports)) {
    const doneCount = items.filter((i) => i.status === 'done').length;
    content += `◆ ${platform} (${doneCount}/${items.length} 完成)\n`;
    content += `  ${'─'.repeat(36)}\n`;
    for (const item of items) {
      const status = item.status === 'done' ? '[OK]' : item.status === 'error' ? '[FF]' : '[..]';
      const ext = item.format.toUpperCase().padEnd(4, ' ');
      const sizeStr = `${item.width}×${item.height}`.padEnd(14, ' ');
      content += `  ${status} ${ext} ${sizeStr} ${item.name}.${item.format}\n`;
    }
    content += '\n';
  }

  content += '-'.repeat(64) + '\n';
  content += '【平台尺寸规范参考】\n';
  content += '-'.repeat(64) + '\n\n';

  const platformSpecGroups = PLATFORM_SPECS.reduce((acc, spec) => {
    if (!acc[spec.platform]) acc[spec.platform] = [];
    acc[spec.platform].push(spec);
    return acc;
  }, {} as Record<string, typeof PLATFORM_SPECS>);

  for (const [platform, specs] of Object.entries(platformSpecGroups)) {
    content += `  ▸ ${platform}:\n`;
    for (const spec of specs) {
      const required = spec.required ? '★必需' : ' 可选';
      content += `      ${required}  ${spec.type.padEnd(14, ' ')}  ${spec.width}×${spec.height}\n`;
    }
    content += '\n';
  }

  content += '='.repeat(64) + '\n';
  content += `  生成工具: PixelForge  发送前请核对以上 ${exportItems.filter((e) => e.status === 'done').length} 个文件\n`;
  content += '='.repeat(64) + '\n';

  return content;
};

export interface BuildZipOptions {
  prefix: string;
  projectName: string;
  checklistContent: string;
  checklist: ReleaseChecklistItem[];
}

export const buildExportZip = async (
  items: ExportItem[],
  blobs: Record<string, { blob: Blob; dataUrl: string }>,
  options: BuildZipOptions
): Promise<Blob> => {
  const zip = new JSZip();
  const safeProject = options.projectName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_');

  const byPlatform = items.reduce((acc, item) => {
    if (item.status !== 'done' || !blobs[item.id]) return acc;
    if (!acc[item.platform]) acc[item.platform] = [];
    acc[item.platform].push(item);
    return acc;
  }, {} as Record<string, ExportItem[]>);

  let idx = 0;
  for (const [platform, platItems] of Object.entries(byPlatform)) {
    const safePlat = platform.replace(/[^a-zA-Z0-9_-]/g, '_');
    const folder = zip.folder(safePlat);
    if (!folder) continue;
    for (const item of platItems) {
      const data = blobs[item.id];
      if (!data?.blob) continue;
      const filename = generateFilename(options.prefix || safeProject, platform, item.name, item.format, 1, idx++);
      folder.file(filename, data.blob);
    }
  }

  const readme = `PIXEL FORGE - 项目打包清单
===============================
项目: ${options.projectName}
导出数量: ${items.filter((i) => i.status === 'done').length} 个文件
生成时间: ${new Date().toLocaleString('zh-CN')}

文件夹说明:
  每个平台一个子文件夹，内部为对应尺寸的导出图片。
  文件命名规则: {前缀}_{平台}_{类型}_{序号}.{格式}

详细清单请参考 release_checklist.txt
`;

  zip.file('README.txt', readme);
  zip.file('release_checklist.txt', options.checklistContent);

  const summary = `文件清单（发行同事用）
======================
平台,类型,文件名,尺寸,格式,状态
` + items.map((i) => [
    i.platform,
    i.name,
    `${i.name}.${i.format}`,
    `${i.width}x${i.height}`,
    i.format.toUpperCase(),
    i.status === 'done' ? '完成' : i.status,
  ].join(',')).join('\n');
  zip.file('文件清单.CSV', '\ufeff' + summary);

  return await zip.generateAsync({ type: 'blob' }, (metadata) => {
    console.log('[PixelForge] ZIP 进度:', metadata.percent.toFixed(1) + '%');
  });
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

export interface BrandItem {
  filename: string;
  dataUrl: string;
}

export const buildBrandZip = async (
  projectName: string,
  logos: BrandItem[],
  paletteGuide: string,
  brandCopy: string
): Promise<Blob> => {
  const zip = new JSZip();
  const safeName = projectName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_');

  logos.forEach((logo) => {
    try {
      const [meta, base64] = logo.dataUrl.split(',');
      const mimeMatch = meta.match(/data:(.*?);base64/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/png';
      const ext = mime === 'image/jpeg' ? 'jpg'
        : mime === 'image/gif' ? 'gif' : 'png';
      const byteString = atob(base64);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const filename = logo.filename.toLowerCase().endsWith(`.${ext}`)
        ? logo.filename
        : `${logo.filename}.${ext}`;
      zip.file(`logos/${filename}`, new Blob([ab], { type: mime }));
    } catch (e) {
      console.warn('跳过品牌Logo', logo.filename, e);
    }
  });

  zip.file('调色板说明.txt', paletteGuide);
  zip.file('品牌文案.txt', brandCopy);

  const readme = `品牌套件 / Brand Kit
========================
项目: ${projectName}
生成时间: ${new Date().toLocaleString('zh-CN')}

文件目录:
  /logos/                 - Logo 变体文件（全尺寸 PNG）
  调色板说明.txt           - 品牌色值规范
  品牌文案.txt             - Slogan/Tagline 文案集合
`;
  zip.file('README.txt', readme);

  return await zip.generateAsync({ type: 'blob' });
};

export const dataUrlToZipBlob = (dataUrl: string): Blob => {
  const base64 = dataUrl.split(',')[1];
  const byteString = atob(base64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: 'application/zip' });
};

export const zipBlobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
