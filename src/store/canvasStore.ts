import { create } from 'zustand';
import type { CanvasElement } from '@/types';
import { CANVAS_RATIOS } from '@/data/ratios';

interface CanvasState {
  width: number;
  height: number;
  ratio: string;
  pixelSize: number;
  zoom: number;
  gridVisible: boolean;
  elements: CanvasElement[];
  selectedId: string | null;
  history: CanvasElement[][];
  historyIndex: number;
  setRatio: (ratioId: string) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  addElement: (element: Omit<CanvasElement, 'id' | 'layer'>) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  moveElement: (id: string, x: number, y: number) => void;
  resizeElement: (id: string, width: number, height: number) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  undo: () => void;
  redo: () => void;
  saveState: () => void;
  batchUpdateText: (find: string, replace: string) => void;
  clearAll: () => void;
}

const generateId = () => `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useCanvasStore = create<CanvasState>((set, get) => {
  const initialRatio = CANVAS_RATIOS[0];
  
  return {
    width: initialRatio.width,
    height: initialRatio.height,
    ratio: initialRatio.id,
    pixelSize: 1,
    zoom: 0.5,
    gridVisible: true,
    elements: [],
    selectedId: null,
    history: [[]],
    historyIndex: 0,

    setRatio: (ratioId) => {
      const ratio = CANVAS_RATIOS.find((r) => r.id === ratioId);
      if (ratio) {
        set({
          ratio: ratioId,
          width: ratio.width,
          height: ratio.height,
        });
      }
    },

    setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(2, zoom)) }),

    toggleGrid: () => set((state) => ({ gridVisible: !state.gridVisible })),

    addElement: (element) => {
      const { elements, saveState } = get();
      const newElement: CanvasElement = {
        opacity: 100,
        ...element,
        id: generateId(),
        layer: elements.length,
      };
      const newElements = [...elements, newElement];
      set({ elements: newElements, selectedId: newElement.id });
      saveState();
    },

    updateElement: (id, updates) => {
      const { saveState } = get();
      set((state) => ({
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, ...updates } : el
        ),
      }));
      saveState();
    },

    deleteElement: (id) => {
      const { saveState } = get();
      set((state) => ({
        elements: state.elements.filter((el) => el.id !== id),
        selectedId: state.selectedId === id ? null : state.selectedId,
      }));
      saveState();
    },

    selectElement: (id) => set({ selectedId: id }),

    moveElement: (id, x, y) => {
      set((state) => ({
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, x: Math.round(x), y: Math.round(y) } : el
        ),
      }));
    },

    resizeElement: (id, width, height) => {
      set((state) => ({
        elements: state.elements.map((el) =>
          el.id === id ? { ...el, width: Math.round(width), height: Math.round(height) } : el
        ),
      }));
    },

    bringForward: (id) => {
      const { elements, saveState } = get();
      const index = elements.findIndex((el) => el.id === id);
      if (index < elements.length - 1) {
        const newElements = [...elements];
        [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
        newElements[index].layer = index;
        newElements[index + 1].layer = index + 1;
        set({ elements: newElements });
        saveState();
      }
    },

    sendBackward: (id) => {
      const { elements, saveState } = get();
      const index = elements.findIndex((el) => el.id === id);
      if (index > 0) {
        const newElements = [...elements];
        [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
        newElements[index].layer = index;
        newElements[index - 1].layer = index - 1;
        set({ elements: newElements });
        saveState();
      }
    },

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        set({
          historyIndex: historyIndex - 1,
          elements: history[historyIndex - 1],
          selectedId: null,
        });
      }
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        set({
          historyIndex: historyIndex + 1,
          elements: history[historyIndex + 1],
          selectedId: null,
        });
      }
    },

    saveState: () => {
      const { elements, history, historyIndex } = get();
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push([...elements]);
      set({
        history: newHistory,
        historyIndex: newHistory.length - 1,
      });
    },

    batchUpdateText: (find, replace) => {
      const { elements, saveState } = get();
      const updatedElements = elements.map((el) => {
        if (el.type === 'text' && 'content' in el.data) {
          const newContent = el.data.content.replace(
            new RegExp(find, 'g'),
            replace
          );
          return {
            ...el,
            data: { ...el.data, content: newContent },
          };
        }
        return el;
      });
      set({ elements: updatedElements });
      saveState();
    },

    clearAll: () => {
      const { saveState } = get();
      set({ elements: [], selectedId: null });
      saveState();
    },
  };
});
