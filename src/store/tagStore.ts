import { create } from 'zustand';
import { Tag, createTag } from '../models/Tag';
import { getAllTags, upsertTag, deleteTag as dbDeleteTag } from '../services/database';
import {
  syncTagsToFirebase,
  syncTagsFromFirebase,
  deleteTagFromFirebase,
} from '../services/syncService';

interface TagState {
  tags: Tag[];
  isLoading: boolean;
  loadTags: () => Promise<void>;
  addTag: (name: string, colorHex: string) => Promise<Tag>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  syncWithFirebase: (userId: string) => Promise<void>;
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],
  isLoading: false,

  loadTags: async () => {
    set({ isLoading: true });
    const tags = await getAllTags();
    set({ tags, isLoading: false });
  },

  addTag: async (name: string, colorHex: string) => {
    const tag = createTag({ name, colorHex });
    set((state) => ({ tags: [...state.tags, tag] }));
    upsertTag(tag).catch(() => null);
    return tag;
  },

  updateTag: async (id: string, updates: Partial<Tag>) => {
    const { tags } = get();
    const existing = tags.find((t) => t.id === id);
    if (!existing) return;
    const updated: Tag = { ...existing, ...updates, needsSync: true };
    set((state) => ({
      tags: state.tags.map((t) => (t.id === id ? updated : t)),
    }));
    upsertTag(updated).catch(() => null);
  },

  deleteTag: async (id: string) => {
    const { tags } = get();
    const tag = tags.find((t) => t.id === id);
    set((state) => ({ tags: state.tags.filter((t) => t.id !== id) }));
    dbDeleteTag(id).catch(() => null);
    if (tag?.firebaseId) {
      deleteTagFromFirebase(tag.firebaseId).catch(() => null);
    }
  },

  syncWithFirebase: async (userId: string) => {
    const { tags } = get();
    // Upload pending tags using in-memory store (no SQLite read)
    const syncedTags = await syncTagsToFirebase(userId, tags);
    // Download from Firebase (SQLite writes happen in the background)
    const remoteTags = await syncTagsFromFirebase(userId);
    set((state) => {
      const map = new Map(state.tags.map((t) => [t.id, t]));
      for (const st of syncedTags) {
        map.set(st.id, st);
      }
      for (const rt of remoteTags) {
        map.set(rt.id, rt);
      }
      return { tags: Array.from(map.values()) };
    });
  },
}));
