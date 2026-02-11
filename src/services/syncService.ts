import {
  collection,
  doc,
  getDocsFromServer,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Task } from '../models/Task';
import { Tag } from '../models/Tag';
import { upsertTask, upsertTag } from './database';

// ---- Firestore helpers ----

function taskToFirestore(task: Task): Record<string, unknown> {
  return {
    title: task.title,
    note: task.note ?? null,
    isCompleted: task.isCompleted,
    isImportant: task.isImportant,
    isMyDay: task.isMyDay,
    dueDate: task.dueDate ?? null,
    reminderDate: task.reminderDate ?? null,
    createdAt: task.createdAt,
    completedAt: task.completedAt ?? null,
    taskListId: task.taskListId ?? null,
    order: task.order,
    tagFirebaseIds: task.tagIds,   // Flutter field name
    localId: task.id,
    updatedAt: new Date().toISOString(),
  };
}

function tagToFirestore(tag: Tag): Record<string, unknown> {
  return {
    name: tag.name,
    colorHex: tag.colorHex,
    createdAt: tag.createdAt,
    localId: tag.id,
    updatedAt: new Date().toISOString(),
  };
}

// ---- Sync up (local → Firebase) ----

export async function syncTasksToFirebase(userId: string, tasks: Task[]): Promise<Task[]> {
  const pending = tasks.filter((t) => t.needsSync);
  const synced: Task[] = [];
  for (const task of pending) {
    const ref = task.firebaseId
      ? doc(db, 'users', userId, 'tasks', task.firebaseId)
      : doc(collection(db, 'users', userId, 'tasks'));
    await setDoc(ref, taskToFirestore(task), { merge: true });
    const updated: Task = {
      ...task,
      firebaseId: ref.id,
      lastSyncedAt: new Date().toISOString(),
      needsSync: false,
    };
    synced.push(updated);
    upsertTask(updated).catch(() => null);
  }
  return synced;
}

export async function syncTagsToFirebase(userId: string, tags: Tag[]): Promise<Tag[]> {
  const pending = tags.filter((t) => t.needsSync);
  const synced: Tag[] = [];
  for (const tag of pending) {
    const ref = tag.firebaseId
      ? doc(db, 'users', userId, 'tags', tag.firebaseId)
      : doc(collection(db, 'users', userId, 'tags'));
    await setDoc(ref, tagToFirestore(tag), { merge: true });
    const updated: Tag = {
      ...tag,
      firebaseId: ref.id,
      lastSyncedAt: new Date().toISOString(),
      needsSync: false,
    };
    synced.push(updated);
    upsertTag(updated).catch(() => null);
  }
  return synced;
}

// ---- Sync down (Firebase → local) ----

export async function syncTasksFromFirebase(userId: string): Promise<Task[]> {
  const col = collection(db, 'users', userId, 'tasks');
  console.log('[syncTasksFromFirebase] calling getDocsFromServer, userId:', userId);
  let snapshot;
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore getDocsFromServer timeout after 15s')), 15000)
    );
    snapshot = await Promise.race([getDocsFromServer(col), timeout]);
  } catch (err) {
    console.error('[syncTasksFromFirebase] getDocsFromServer threw:', err);
    return [];
  }
  console.log('[syncTasksFromFirebase] getDocsFromServer returned', snapshot.docs.length, 'docs');
  const tasks: Task[] = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: (data.localId as string) || d.id,
      title: data.title as string,
      note: (data.note as string | null) ?? undefined,
      isCompleted: data.isCompleted === true,   // explicit boolean — never null/undefined
      isImportant: data.isImportant === true,
      isMyDay: data.isMyDay === true,
      dueDate: (data.dueDate as string | null) ?? undefined,
      reminderDate: (data.reminderDate as string | null) ?? undefined,
      createdAt: data.createdAt as string,
      completedAt: (data.completedAt as string | null) ?? undefined,
      taskListId: (data.taskListId as string | null) ?? undefined,
      order: (data.order as number) ?? 0,
      tagIds: (data.tagFirebaseIds as string[]) ?? [],  // Flutter field name → local field name
      firebaseId: d.id,
      lastSyncedAt: new Date().toISOString(),
      needsSync: false,
    };
  });
  for (const task of tasks) {
    upsertTask(task).catch(() => null);
  }
  return tasks;
}

export async function syncTagsFromFirebase(userId: string): Promise<Tag[]> {
  const col = collection(db, 'users', userId, 'tags');
  let snapshot;
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore getDocsFromServer timeout after 15s')), 15000)
    );
    snapshot = await Promise.race([getDocsFromServer(col), timeout]);
  } catch (err) {
    console.error('[syncTagsFromFirebase] getDocsFromServer threw:', err);
    return [];
  }
  const tags: Tag[] = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: (data.localId as string) || d.id,
      name: data.name as string,
      colorHex: (data.colorHex as string) ?? '#7C6FCD',
      createdAt: data.createdAt as string,
      firebaseId: d.id,
      lastSyncedAt: new Date().toISOString(),
      needsSync: false,
    };
  });
  for (const tag of tags) {
    upsertTag(tag).catch(() => null);
  }
  return tags;
}

export async function deleteTaskFromFirebase(userId: string, firebaseId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'tasks', firebaseId));
}

export async function deleteTagFromFirebase(userId: string, firebaseId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'tags', firebaseId));
}
