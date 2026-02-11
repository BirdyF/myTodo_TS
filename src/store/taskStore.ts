import { create } from 'zustand';
import { Task, createTask } from '../models/Task';
import {
  getAllTasks,
  upsertTask,
  deleteTask as dbDeleteTask,
  deleteCompletedTasks as dbDeleteCompletedTasks,
} from '../services/database';
import {
  syncTasksToFirebase,
  syncTasksFromFirebase,
  deleteTaskFromFirebase,
} from '../services/syncService';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  loadTasks: () => Promise<void>;
  addTask: (partial: Partial<Task> & { title: string }) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  toggleImportant: (id: string) => Promise<void>;
  toggleMyDay: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  deleteCompletedTasks: () => Promise<void>;
  reorderTasks: (reordered: Task[]) => Promise<void>;
  syncWithFirebase: (userId: string) => Promise<void>;

  // Derived selectors
  activeTasks: () => Task[];
  completedTasks: () => Task[];
  importantTasks: () => Task[];
  myDayTasks: () => Task[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,

  loadTasks: async () => {
    set({ isLoading: true });
    getAllTasks()
      .then((storedTasks) => {
        set((state) => {
          // Start with SQLite data, but in-memory tasks always win
          // (they may be newer: added optimistically or downloaded via sync)
          const map = new Map(storedTasks.map((t) => [t.id, t]));
          for (const t of state.tasks) {
            map.set(t.id, t);
          }
          return { tasks: Array.from(map.values()), isLoading: false };
        });
      })
      .catch(() => {
        set({ isLoading: false });
      });
  },

  addTask: async (partial) => {
    const { tasks } = get();
    const maxOrder = tasks.length > 0 ? Math.max(...tasks.map((t) => t.order)) + 1 : 0;
    const task = createTask({ ...partial, order: maxOrder });
    set((state) => ({ tasks: [...state.tasks, task] }));
    upsertTask(task).catch(() => null);
    return task;
  },

  updateTask: async (id, updates) => {
    const { tasks } = get();
    const existing = tasks.find((t) => t.id === id);
    if (!existing) return;
    const updated: Task = { ...existing, ...updates, needsSync: true };
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
    }));
    upsertTask(updated).catch(() => null);
  },

  toggleComplete: async (id) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const updated: Task = {
      ...task,
      isCompleted: !task.isCompleted,
      completedAt: !task.isCompleted ? new Date().toISOString() : undefined,
      needsSync: true,
    };
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
    }));
    upsertTask(updated).catch(() => null);
  },

  toggleImportant: async (id) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const updated: Task = { ...task, isImportant: !task.isImportant, needsSync: true };
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
    }));
    upsertTask(updated).catch(() => null);
  },

  toggleMyDay: async (id) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const updated: Task = { ...task, isMyDay: !task.isMyDay, needsSync: true };
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
    }));
    upsertTask(updated).catch(() => null);
  },

  deleteTask: async (id) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === id);
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    dbDeleteTask(id).catch(() => null);
    if (task?.firebaseId) {
      deleteTaskFromFirebase(task.firebaseId).catch(() => null);
    }
  },

  deleteCompletedTasks: async () => {
    const { tasks } = get();
    const completed = tasks.filter((t) => t.isCompleted);
    set((state) => ({ tasks: state.tasks.filter((t) => !t.isCompleted) }));
    dbDeleteCompletedTasks().catch(() => null);
    for (const task of completed) {
      if (task.firebaseId) {
        deleteTaskFromFirebase(task.firebaseId).catch(() => null);
      }
    }
  },

  reorderTasks: async (reordered) => {
    const updated = reordered.map((t, index) => ({
      ...t,
      order: index,
      needsSync: true,
    }));
    for (const task of updated) {
      await upsertTask(task);
    }
    set({ tasks: updated });
  },

  syncWithFirebase: async (userId) => {
    const { tasks } = get();
    // Upload pending tasks using in-memory store (no SQLite read)
    const syncedTasks = await syncTasksToFirebase(userId, tasks);
    // Download from Firebase (SQLite writes happen in the background)
    const remoteTasks = await syncTasksFromFirebase(userId);
    set((state) => {
      const map = new Map(state.tasks.map((t) => [t.id, t]));
      for (const st of syncedTasks) {
        map.set(st.id, st); // mark as synced (needsSync: false, firebaseId set)
      }
      for (const rt of remoteTasks) {
        map.set(rt.id, rt); // merge remote tasks
      }
      return { tasks: Array.from(map.values()) };
    });
  },

  activeTasks: () => get().tasks.filter((t) => !t.isCompleted),
  completedTasks: () => get().tasks.filter((t) => t.isCompleted),
  importantTasks: () => get().tasks.filter((t) => t.isImportant && !t.isCompleted),
  myDayTasks: () => get().tasks.filter((t) => t.isMyDay && !t.isCompleted),
}));
