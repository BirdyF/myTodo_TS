import { create } from 'zustand';
import { Tag, createTag } from '../models/Tag';
import { getAllTags, upsertTag, deleteTag as dbDeleteTag } from '../services/database';
import {
  syncPendingTags,
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
    await upsertTag(tag);
    set((state) => ({ tags: [...state.tags, tag] }));
    return tag;
  },

  updateTag: async (id: string, updates: Partial<Tag>) => {
    const { tags } = get();
    const existing = tags.find((t) => t.id === id);
    if (!existing) return;
    const updated: Tag = { ...existing, ...updates, needsSync: true };
    await upsertTag(updated);
    set((state) => ({
      tags: state.tags.map((t) => (t.id === id ? updated : t)),
    }));
  },

  deleteTag: async (id: string) => {
    const { tags } = get();
    const tag = tags.find((t) => t.id === id);
    await dbDeleteTag(id);
    set((state) => ({ tags: state.tags.filter((t) => t.id !== id) }));
    if (tag?.firebaseId) {
      await deleteTagFromFirebase(tag.firebaseId).catch(() => null);
    }
  },

  syncWithFirebase: async (userId: string) => {
    await syncPendingTags(userId);
    const remoteTags = await syncTagsFromFirebase(userId);
    set((state) => {
      const map = new Map(state.tags.map((t) => [t.id, t]));
      for (const rt of remoteTags) {
        map.set(rt.id, rt);
      }
      return { tags: Array.from(map.values()) };
    });
  },
}));
