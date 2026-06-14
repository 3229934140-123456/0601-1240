import { create } from 'zustand';
import type { Project, Comment, Version, Collaborator, ColorPalette } from '@/types';
import { MOCK_PROJECTS } from '@/data/assets';
import { PRESET_PALETTES } from '@/data/palettes';

interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  getCurrentProject: () => Project | undefined;
  setCurrentProject: (id: string | null) => void;
  createProject: (name: string, ratio: string) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addComment: (projectId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  resolveComment: (projectId: string, commentId: string) => void;
  saveVersion: (projectId: string, name: string) => void;
  addCollaborator: (projectId: string, collaborator: Omit<Collaborator, 'id'>) => void;
  updatePalette: (projectId: string, palette: ColorPalette) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: MOCK_PROJECTS,
  currentProjectId: null,
  activeTab: 'home',

  setActiveTab: (tab) => set({ activeTab: tab }),

  getCurrentProject: () => {
    const { projects, currentProjectId } = get();
    return projects.find((p) => p.id === currentProjectId);
  },

  setCurrentProject: (id) => set({ currentProjectId: id }),

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
    };
    set((state) => ({
      projects: [newProject, ...state.projects],
      currentProjectId: newProject.id,
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
    }));
  },

  addComment: (projectId, comment) => {
    const newComment: Comment = {
      ...comment,
      id: `comment-${Date.now()}`,
      createdAt: Date.now(),
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, comments: [...p.comments, newComment], updatedAt: Date.now() }
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
      id: `version-${Date.now()}`,
      name,
      snapshot: '',
      createdAt: Date.now(),
      author: '我',
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, versions: [...p.versions, newVersion], updatedAt: Date.now() }
          : p
      ),
    }));
  },

  addCollaborator: (projectId, collaborator) => {
    const newCollaborator: Collaborator = {
      ...collaborator,
      id: `user-${Date.now()}`,
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, collaborators: [...p.collaborators, newCollaborator], updatedAt: Date.now() }
          : p
      ),
    }));
  },

  updatePalette: (projectId, palette) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, palette, updatedAt: Date.now() } : p
      ),
    }));
  },
}));
