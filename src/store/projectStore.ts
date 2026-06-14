import { create } from 'zustand';
import type {
  Project,
  Comment,
  Version,
  Collaborator,
  ColorPalette,
  BrandLogoVariant,
  BrandPackage,
} from '@/types';
import { MOCK_PROJECTS } from '@/data/assets';
import { PRESET_PALETTES } from '@/data/palettes';

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
  addComment: (projectId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  resolveComment: (projectId: string, commentId: string) => void;
  saveVersion: (projectId: string, name: string) => Version;
  addCollaborator: (projectId: string, collaborator: Omit<Collaborator, 'id'>) => Collaborator;
  updatePalette: (projectId: string, palette: ColorPalette) => void;
  addBrandPalette: (projectId: string, palette: ColorPalette) => void;
  removeBrandPalette: (projectId: string, paletteId: string) => void;
  addLogoVariant: (projectId: string, variant: Omit<BrandLogoVariant, 'id'>) => void;
  updateLogoVariant: (projectId: string, variantId: string, updates: Partial<BrandLogoVariant>) => void;
  removeLogoVariant: (projectId: string, variantId: string) => void;
  saveBrandPackage: (projectId: string, pkg: Omit<BrandPackage, 'id' | 'createdAt'>) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: MOCK_PROJECTS,
  currentProjectId: null,
  lastSelectedProjectId: MOCK_PROJECTS[0]?.id ?? null,
  activeTab: 'home',

  setActiveTab: (tab) => set({ activeTab: tab }),

  getCurrentProject: () => {
    const { projects, currentProjectId, lastSelectedProjectId } = get();
    const id = currentProjectId ?? lastSelectedProjectId;
    return projects.find((p) => p.id === id);
  },

  setCurrentProject: (id) => set({
    currentProjectId: id,
    lastSelectedProjectId: id ?? get().lastSelectedProjectId,
  }),

  createProject: (name, ratio) => {
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
    };
    set((state) => ({
      projects: [newProject, ...state.projects],
      currentProjectId: newProject.id,
      lastSelectedProjectId: newProject.id,
    }));
    return newProject;
  },

  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
      ),
    }));
  },

  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
      lastSelectedProjectId:
        state.lastSelectedProjectId === id ? state.projects[0]?.id ?? null : state.lastSelectedProjectId,
    }));
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
    return newCollaborator;
  },

  updatePalette: (projectId, palette) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, palette, updatedAt: Date.now() } : p
      ),
    }));
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
  },
}));
