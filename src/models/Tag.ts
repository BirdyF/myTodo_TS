export interface Tag {
  id: string;
  name: string;
  colorHex: string; // e.g. "#7C6FCD"
  createdAt: string; // ISO date string
  firebaseId?: string;
  lastSyncedAt?: string;
  needsSync: boolean;
}

export function createTag(partial: Partial<Tag> & { name: string; colorHex: string }): Tag {
  return {
    id: Date.now().toString(),
    name: partial.name,
    colorHex: partial.colorHex,
    createdAt: new Date().toISOString(),
    firebaseId: undefined,
    lastSyncedAt: undefined,
    needsSync: true,
  };
}
