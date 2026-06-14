export interface BrandLogoVariant {
  id: string;
  name: string;
  slogan: string;
  tagline: string;
  description: string;
  iconSymbol: string;
  dataUrl?: string;
}

export interface BrandPackage {
  id: string;
  name: string;
  createdAt: number;
  fileCount: number;
  sizeKB: number;
  items: { filename: string; dataUrl: string }[];
}

export interface BrandAssets {
  palettes: ColorPalette[];
  logoVariants: BrandLogoVariant[];
  brandPackages: BrandPackage[];
}

export interface Project {
  id: string;
  name: string;
  thumbnail: string;
  createdAt: number;
  updatedAt: number;
  versions: Version[];
  collaborators: Collaborator[];
  comments: Comment[];
  currentRatio: string;
  palette: ColorPalette;
  brandAssets: BrandAssets;
}

export interface Version {
  id: string;
  name: string;
  snapshot: string;
  createdAt: number;
  author: string;
}

export interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'editor' | 'viewer';
}

export interface Comment {
  id: string;
  content: string;
  position: { x: number; y: number };
  author: string;
  avatar: string;
  createdAt: number;
  resolved: boolean;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}

export interface CanvasElement {
  id: string;
  type: 'image' | 'text' | 'shape' | 'border';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  layer: number;
  visible: boolean;
  locked: boolean;
  opacity?: number;
  data: ImageElementData | TextElementData | ShapeElementData | BorderElementData;
}

export interface ImageElementData {
  src: string;
  assetId?: string;
  pixelPerfect?: boolean;
}

export interface TextElementData {
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  strokeColor?: string;
  strokeWidth?: number;
  pixelFont?: boolean;
}

export interface ShapeElementData {
  shape: 'rectangle' | 'circle' | 'pixel-border';
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface BorderElementData {
  style: 'solid' | 'double' | 'retro' | 'neon';
  color: string;
  thickness: number;
  cornerSize: number;
}

export interface Asset {
  id: string;
  type: 'character' | 'background' | 'border' | 'font';
  name: string;
  thumbnail: string;
  url: string;
  tags: string[];
  favorite: boolean;
  palette?: string[];
  description?: string;
}

export interface CanvasRatio {
  id: string;
  name: string;
  width: number;
  height: number;
  platform?: string;
}

export interface Frame {
  id: string;
  duration: number;
  elements: CanvasElement[];
  thumbnail?: string;
}

export interface Animation {
  id: string;
  name: string;
  frames: Frame[];
  loop: boolean;
  fps: number;
  width: number;
  height: number;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  portrait: string;
  sprites: {
    idle: string[];
    walk: string[];
    attack: string[];
  };
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  palette: string[];
}

export interface PlatformSpec {
  platform: string;
  type: string;
  width: number;
  height: number;
  required: boolean;
  status?: 'pass' | 'warning' | 'error';
}

export interface ExportItem {
  id: string;
  name: string;
  format: 'png' | 'jpg' | 'gif' | 'mp4';
  width: number;
  height: number;
  platform: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
  url?: string;
}

export interface ReleaseChecklistItem {
  id: string;
  title: string;
  description: string;
  platform: string;
  done: boolean;
  required: boolean;
}
