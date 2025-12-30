import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { HistoryItem, RequestState, ResponseData } from "@/types";

const STORAGE_KEY = "api-playground-history";
const MAX_HISTORY_ITEMS = 50;

interface HistoryStore {
  items: HistoryItem[];
  isLoaded: boolean;

  // Actions
  loadHistory: () => void;
  addToHistory: (request: RequestState, response?: ResponseData) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  toggleStar: (id: string) => void;
  renameItem: (id: string, name: string) => void;
  getItem: (id: string) => HistoryItem | undefined;
}

function saveToStorage(items: HistoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save history to localStorage:", e);
    // If quota exceeded, remove oldest non-starred items
    const starred = items.filter((i) => i.starred);
    const nonStarred = items.filter((i) => !i.starred);
    const reduced = [...starred, ...nonStarred.slice(0, Math.floor(MAX_HISTORY_ITEMS / 2))];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reduced));
    } catch {
      // Last resort: only keep starred
      localStorage.setItem(STORAGE_KEY, JSON.stringify(starred));
    }
  }
}

function loadFromStorage(): HistoryItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load history from localStorage:", e);
  }
  return [];
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  items: [],
  isLoaded: false,

  loadHistory: () => {
    if (typeof window === "undefined") return;
    const items = loadFromStorage();
    set({ items, isLoaded: true });
  },

  addToHistory: (request, response) => {
    const newItem: HistoryItem = {
      id: uuidv4(),
      timestamp: Date.now(),
      method: request.method,
      url: request.url,
      request,
      response,
      starred: false,
    };

    set((state) => {
      // Keep starred items at top priority
      const starred = state.items.filter((i) => i.starred);
      const nonStarred = state.items.filter((i) => !i.starred);

      // Add new item to non-starred, then limit
      let updatedNonStarred = [newItem, ...nonStarred];

      // Enforce max limit (prioritize starred items)
      const maxNonStarred = MAX_HISTORY_ITEMS - starred.length;
      if (updatedNonStarred.length > maxNonStarred) {
        updatedNonStarred = updatedNonStarred.slice(0, maxNonStarred);
      }

      const updatedItems = [...starred, ...updatedNonStarred].sort(
        (a, b) => b.timestamp - a.timestamp
      );

      saveToStorage(updatedItems);
      return { items: updatedItems };
    });
  },

  removeFromHistory: (id) => {
    set((state) => {
      const updatedItems = state.items.filter((item) => item.id !== id);
      saveToStorage(updatedItems);
      return { items: updatedItems };
    });
  },

  clearHistory: () => {
    set((state) => {
      // Keep starred items
      const starredItems = state.items.filter((item) => item.starred);
      saveToStorage(starredItems);
      return { items: starredItems };
    });
  },

  toggleStar: (id) => {
    set((state) => {
      const updatedItems = state.items.map((item) =>
        item.id === id ? { ...item, starred: !item.starred } : item
      );
      saveToStorage(updatedItems);
      return { items: updatedItems };
    });
  },

  renameItem: (id, name) => {
    set((state) => {
      const updatedItems = state.items.map((item) =>
        item.id === id ? { ...item, name } : item
      );
      saveToStorage(updatedItems);
      return { items: updatedItems };
    });
  },

  getItem: (id) => {
    return get().items.find((item) => item.id === id);
  },
}));


