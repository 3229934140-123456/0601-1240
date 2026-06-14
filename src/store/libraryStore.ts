import { create } from 'zustand';
import type { Asset } from '@/types';
import { MOCK_ASSETS } from '@/data/assets';

interface LibraryState {
  assets: Asset[];
  selectedType: 'all' | 'character' | 'background' | 'border' | 'font';
  searchQuery: string;
  showFavoritesOnly: boolean;
  setSelectedType: (type: 'all' | 'character' | 'background' | 'border' | 'font') => void;
  setSearchQuery: (query: string) => void;
  toggleFavoritesOnly: () => void;
  toggleFavorite: (assetId: string) => void;
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  deleteAsset: (assetId: string) => void;
  getFilteredAssets: () => Asset[];
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  assets: MOCK_ASSETS,
  selectedType: 'all',
  searchQuery: '',
  showFavoritesOnly: false,

  setSelectedType: (type) => set({ selectedType: type }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleFavoritesOnly: () => set((state) => ({ showFavoritesOnly: !state.showFavoritesOnly })),

  toggleFavorite: (assetId) => set((state) => ({
    assets: state.assets.map((a) =>
      a.id === assetId ? { ...a, favorite: !a.favorite } : a
    ),
  })),

  addAsset: (asset: Omit<Asset, 'id'>) => set((state) => ({
    assets: [{ ...asset, id: `asset-${Date.now()}` }, ...state.assets],
  })),

  deleteAsset: (assetId: string) => set((state) => ({
    assets: state.assets.filter((a) => a.id !== assetId),
  })),

  getFilteredAssets: () => {
    const { assets, selectedType, searchQuery, showFavoritesOnly } = get();
    return assets.filter((asset) => {
      const matchesType = selectedType === 'all' || asset.type === selectedType;
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFavorite = !showFavoritesOnly || asset.favorite;
      return matchesType && matchesSearch && matchesFavorite;
    });
  },
}));
