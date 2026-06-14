import { create } from 'zustand';
import type {
  Project,
  Comment,
  Version,
  Collaborator,
  ColorPalette,
  BrandLogoVariant,
  BrandPackage,
  ExportItem,
  ReleaseChecklistItem,
} from '@/types';
import { MOCK_PROJECTS } from '@/data/assets';
import { PRESET_PALETTES } from '@/data/palettes';

const STORAGE_KEY = 'pixelforge_projects_v1';

function loadProjectsFromStorage(): Project[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as Project[];
  } catch {
    /* ignore */
  }
  return null;
}

function saveProjectsToStorage(projects: Project[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    /* ignore */
  }
}

interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;
  lastSelectedProjectId: string | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  getCurrentProject: () => Project | undefined;
  setCurrentProject: (id: string | null) => void;
  createProject: (name: string, ratio: string) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addComment: (projectId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => Comment;
  resolveComment: (projectId: string, commentId: string) => void;
  saveVersion: (projectId: string, name: string) => Version;
  addCollaborator: (projectId: string, collaborator: Omit<Collaborator, 'id'>) => Collaborator;
  updatePalette: (projectId: string, palette: ColorPalette) => void;
  addBrandPalette: (projectId: string, palette: ColorPalette) => void;
  removeBrandPalette: (projectId: string, paletteId: string) => void;
  addLogoVariant: (projectId: string, variant: Omit<BrandLogoVariant, 'id'>) => BrandLogoVariant;
  updateLogoVariant: (projectId: string, variantId: string, updates: Partial<BrandLogoVariant>) => void;
  removeLogoVariant: (projectId: string, variantId: string) => void;
  saveBrandPackage: (projectId: string, pkg: Omit<BrandPackage, 'id' | 'createdAt'>) => BrandPackage;
  setExportItems: (projectId: string, items: ExportItem[]) => void;
  updateExportItem: (projectId: string, itemId: string, updates: Partial<ExportItem>) => void;
  setReleaseChecklist: (projectId: string, items: ReleaseChecklistItem[]) => void;
  updateReleaseChecklistItem: (projectId: string, itemId: string, updates: Partial<ReleaseChecklistItem>) => void;
  resetProjectToDefaults: (projectId: string) => void;
}

const initialProjects = loadProjectsFromStorage() || MOCK_PROJECTS;

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: initialProjects,
  currentProjectId: null,
  lastSelectedProjectId: initialProjects[0]?.id ?? null,
  activeTab: 'home',

  setActiveTab: (tab) => {
    set({ activeTab: tab });
    saveProjectsToStorage(get().projects);
  },

  getCurrentProject: () => {
    const { projects, currentProjectId, lastSelectedProjectId } = get();
    const id = currentProjectId ?? lastSelectedProjectId;
    return projects.find((p) => p.id === id);
  },

  setCurrentProject: (id) => {
    set({
      currentProjectId: id,
      lastSelectedProjectId: id ?? get().lastSelectedProjectId,
    });
    saveProjectsToStorage(get().projects);
  },

  createProject: (name, ratio) => {
    const slug = name.replace(/\s+/g, '_').toLowerCase();
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name,
      thumbnail: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      versions: [],
      collaborators: [{ id: 'u1', name: '我', avatar: '', role: 'owner' }],
      comments: [],
      currentRatio: ratio,
      palette: PRESET_PALETTES[0],
      brandAssets: {
        palettes: [PRESET_PALETTES[0], PRESET_PALETTES[1]],
        logoVariants: [
          {
            id: 'logo-default',
            name: '主 Logo',
            slogan: name,
            tagline: '8-BIT PIXEL ADVENTURE',
            description: '游戏官方主标识，适用于商店页面和宣传物料',
            iconSymbol: '★',
          },
        ],
        brandPackages: [],
      },
      exportItems: [
        { id: `${slug}_main`, name: `${slug}_steam_main`, format: 'png', width: 460, height: 215, platform: 'Steam', status: 'pending', progress: 0 },
        { id: `${slug}_bg`, name: `${slug}_steam_bg`, format: 'jpg', width: 1920, height: 620, platform: 'Steam', status: 'pending', progress: 0 },
        { id: `${slug}_epic`, name: `${slug}_epic_cover`, format: 'png', width: 1200, height: 1600, platform: 'Epic', status: 'pending', progress: 0 },
      ],
      releaseChecklist: [
        { id: 'c1', title: `${name} Steam 主图`, description: '460x215 像素商店主图', platform: 'Steam', done: false, required: true },
        { id: 'c2', title: `${name} Steam 背景图`, description: '1920x620 页面背景', platform: 'Steam', done: false, required: true },
        { id: 'c3', title: `${name} Epic 封面图`, description: '1200x1600 竖版封面', platform: 'Epic', done: false, required: true },
        { id: 'c4', title: `${name} 宣传视频`, description: '90秒游戏展示视频', platform: '通用', done: false, required: false },
      ],
    };
    set((state) => ({
      projects: [newProject, ...state.projects],
      currentProjectId: newProject.id,
      lastSelectedProjectId: newProject.id,
    }));
    saveProjectsToStorage(get().projects);
    return newProject;
  },

  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
      ),
    }));
    saveProjectsToStorage(get().projects);
  },

  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
      lastSelectedProjectId:
        state.lastSelectedProjectId === id ? state.projects[0]?.id ?? null : state.lastSelectedProjectId,
    }));
    saveProjectsToStorage(get().projects);
  },

  addComment: (projectId, comment) => {
    const newComment: Comment = {
      ...comment,
      id: `comment-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: Date.now(),
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, comments: [newComment, ...p.comments], updatedAt: Date.now() }
          : p
      ),
    }));
    saveProjectsToStorage(get().projects);
    return newComment;
  },

  resolveComment: (projectId, commentId) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              comments: p.comments.map((c) =>
                c.id === commentId ? { ...c, resolved: true } : c
              ),
            }
          : p
      ),
    }));
    saveProjectsToStorage(get().projects);
  },

  saveVersion: (projectId, name) => {
    const newVersion: Version = {
      id: `version-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      snapshot: '',
      createdAt: Date.now(),
      author: '我',
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, versions: [newVersion, ...p.versions], updatedAt: Date.now() }
          : p
      ),
    }));
    saveProjectsToStorage(get().projects);
    return newVersion;
  },

  addCollaborator: (projectId, collaborator) => {
    const newCollaborator: Collaborator = {
      ...collaborator,
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, collaborators: [newCollaborator, ...p.collaborators], updatedAt: Date.now() }
          : p
      ),
    }));
    saveProjectsToStorage(get().projects);
    return newCollaborator;
  },

  updatePalette: (projectId, palette) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, palette, updatedAt: Date.now() } : p
      ),
    }));
    saveProjectsToStorage(get().projects);
  },

  addBrandPalette: (projectId, palette) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              brandAssets: {
                ...p.brandAssets,
                palettes: [palette, ...p.brandAssets.palettes],
              },
              updatedAt: Date.now(),
            }
          : p
      ),
    }));
    saveProjectsToStorage(get().projects);
  },

  removeBrandPalette: (projectId, paletteId) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              brandAssets: {
                ...p.brandAssets,
                palettes: p.brandAssets.palettes.filter((p2) => p2.id !== paletteId),
              },
              updatedAt: Date.now(),
            }
          : p
      ),
    }));
    saveProjectsToStorage(get().projects);
  },

  addLogoVariant: (projectId, variant) => {
    const newVariant: BrandLogoVariant = {
      ...variant,
      id: `logo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              brandAssets: {
                ...p.brandAssets,
                logoVariants: [newVariant, ...p.brandAssets.logoVariants],
              },
              updatedAt: Date.now(),
            }
          : p
      ),
    }));
    saveProjectsToStorage(get().projects);
    return newVariant;
  },

  updateLogoVariant: (projectId, variantId, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              brandAssets: {
                ...p.brandAssets,
                logoVariants: p.brandAssets.logoVariants.map((v) =>
                  v.id === variantId ? { ...v, ...updates } : v
                ),
              },
              updatedAt: Date.now(),
            }
          : p
      ),
    }));
    saveProjectsToStorage(get().projects);
  },

  removeLogoVariant: (projectId, variantId) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              brandAssets: {
                ...p.brandAssets,
                logoVariants: p.brandAssets.logoVariants.filter((v) => v.id !== variantId),
              },
              updatedAt: Date.now(),
            }
          : p
      ),
    }));
    saveProjectsToStorage(get().projects);
  },

  saveBrandPackage: (projectId, pkg) => {
    const newPkg: BrandPackage = {
      ...pkg,
      id: `pkg-${Date.now()}`,
      createdAt: Date.now(),
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              brandAssets: {
                ...p.brandAssets,
                brandPackages: [newPkg, ...p.brandAssets.brandPackages],
              },
              updatedAt: Date.now(),
            }
          : p
      ),
    }));
    saveProjectsToStorage(get().projects);
    return newPkg;
  },

  setExportItems: (projectId, items) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, exportItems: items, updatedAt: Date.now() }
          : p
      ),
    }));
    saveProjectsToStorage(get().projects);
  },

  updateExportItem: (projectId, itemId, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              exportItems: p.exportItems.map((it) =>
                it.id === itemId ? { ...it, ...updates } : it
              ),
              updatedAt: Date.now(),
            }
          : p
      ),
    }));
    saveProjectsToStorage(get().projects);
  },

  setReleaseChecklist: (projectId, items) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, releaseChecklist: items, updatedAt: Date.now() }
          : p
      ),
    }));
    saveProjectsToStorage(get().projects);
  },

  updateReleaseChecklistItem: (projectId, itemId, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              releaseChecklist: p.releaseChecklist.map((it) =>
                it.id === itemId ? { ...it, ...updates } : it
              ),
              updatedAt: Date.now(),
            }
          : p
      ),
    }));
    saveProjectsToStorage(get().projects);
  },

  resetProjectToDefaults: (projectId) => {
    const target = MOCK_PROJECTS.find((mp) => mp.id === projectId);
    if (target) {
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                versions: target.versions,
                collaborators: target.collaborators,
                comments: target.comments,
                palette: target.palette,
                brandAssets: target.brandAssets,
                exportItems: target.exportItems,
                releaseChecklist: target.releaseChecklist,
                updatedAt: Date.now(),
              }
            : p
        ),
      }));
    }
    saveProjectsToStorage(get().projects);
  },
}));
