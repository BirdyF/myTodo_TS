import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Task } from '../models/Task';
import { Tag } from '../models/Tag';
import { upsertTask, upsertTag, getAllTasks, getAllTags } from './database';

const TASKS_COLLECTION = 'tasks';
const TAGS_COLLECTION = 'tags';

// ---- Firestore helpers ----

function taskToFirestore(task: Task, userId: string): Record<string, unknown> {
  return {
    userId,
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
    tagIds: task.tagIds,
    localId: task.id,
    updatedAt: new Date().toISOString(),
  };
}

function tagToFirestore(tag: Tag, userId: string): Record<string, unknown> {
  return {
    userId,
    name: tag.name,
    colorHex: tag.colorHex,
    createdAt: tag.createdAt,
    localId: tag.id,
    updatedAt: new Date().toISOString(),
  };
}

// ---- Sync up (local → Firebase) ----

export async function syncPendingTasks(userId: string): Promise<void> {
  const tasks = await getAllTasks();
  const pending = tasks.filter((t) => t.needsSync);
  for (const task of pending) {
    const ref = task.firebaseId
      ? doc(db, TASKS_COLLECTION, task.firebaseId)
      : doc(collection(db, TASKS_COLLECTION));
    await setDoc(ref, taskToFirestore(task, userId), { merge: true });
    await upsertTask({
      ...task,
      firebaseId: ref.id,
      lastSyncedAt: new Date().toISOString(),
      needsSync: false,
    });
  }
}

export async function syncPendingTags(userId: string): Promise<void> {
  const tags = await getAllTags();
  const pending = tags.filter((t) => t.needsSync);
  for (const tag of pending) {
    const ref = tag.firebaseId
      ? doc(db, TAGS_COLLECTION, tag.firebaseId)
      : doc(collection(db, TAGS_COLLECTION));
    await setDoc(ref, tagToFirestore(tag, userId), { merge: true });
    await upsertTag({
      ...tag,
      firebaseId: ref.id,
      lastSyncedAt: new Date().toISOString(),
      needsSync: false,
    });
  }
}

// ---- Sync down (Firebase → local) ----

export async function syncTasksFromFirebase(userId: string): Promise<Task[]> {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  const tasks: Task[] = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: (data.localId as string) || d.id,
      title: data.title as string,
      note: (data.note as string | null) ?? undefined,
      isCompleted: data.isCompleted as boolean,
      isImportant: data.isImportant as boolean,
      isMyDay: data.isMyDay as boolean,
      dueDate: (data.dueDate as string | null) ?? undefined,
      reminderDate: (data.reminderDate as string | null) ?? undefined,
      createdAt: data.createdAt as string,
      completedAt: (data.completedAt as string | null) ?? undefined,
      taskListId: (data.taskListId as string | null) ?? undefined,
      order: data.order as number,
      tagIds: (data.tagIds as string[]) ?? [],
      firebaseId: d.id,
      lastSyncedAt: new Date().toISOString(),
      needsSync: false,
    };
  });
  for (const task of tasks) {
    await upsertTask(task);
  }
  return tasks;
}

export async function syncTagsFromFirebase(userId: string): Promise<Tag[]> {
  const q = query(
    collection(db, TAGS_COLLECTION),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
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
    await upsertTag(tag);
  }
  return tags;
}

export async function deleteTaskFromFirebase(firebaseId: string): Promise<void> {
  await deleteDoc(doc(db, TASKS_COLLECTION, firebaseId));
}

export async function deleteTagFromFirebase(firebaseId: string): Promise<void> {
  await deleteDoc(doc(db, TAGS_COLLECTION, firebaseId));
}
