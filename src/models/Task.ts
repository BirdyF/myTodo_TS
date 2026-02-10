export interface Task {
  id: string;
  title: string;
  note?: string;
  isCompleted: boolean;
  isImportant: boolean;
  isMyDay: boolean;
  dueDate?: string; // ISO date string
  reminderDate?: string; // ISO date string
  createdAt: string; // ISO date string
  completedAt?: string; // ISO date string
  taskListId?: string;
  order: number;
  tagIds: string[];
  firebaseId?: string;
  lastSyncedAt?: string;
  needsSync: boolean;
}

export function createTask(partial: Partial<Task> & { title: string }): Task {
  return {
    id: Date.now().toString(),
    title: partial.title,
    note: partial.note,
    isCompleted: false,
    isImportant: partial.isImportant ?? false,
    isMyDay: partial.isMyDay ?? false,
    dueDate: partial.dueDate,
    reminderDate: partial.reminderDate,
    createdAt: new Date().toISOString(),
    completedAt: undefined,
    taskListId: partial.taskListId,
    order: partial.order ?? Date.now(),
    tagIds: partial.tagIds ?? [],
    firebaseId: undefined,
    lastSyncedAt: undefined,
    needsSync: true,
  };
}
