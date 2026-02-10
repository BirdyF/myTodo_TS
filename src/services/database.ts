import * as SQLite from 'expo-sqlite';
import { Task } from '../models/Task';
import { Tag } from '../models/Tag';

let db: SQLite.SQLiteDatabase | null = null;

export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('myTodo.db');
  await initSchema(db);
  return db;
}

async function initSchema(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color_hex TEXT NOT NULL DEFAULT '#7C6FCD',
      created_at TEXT NOT NULL,
      firebase_id TEXT,
      last_synced_at TEXT,
      needs_sync INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      note TEXT,
      is_completed INTEGER NOT NULL DEFAULT 0,
      is_important INTEGER NOT NULL DEFAULT 0,
      is_my_day INTEGER NOT NULL DEFAULT 0,
      due_date TEXT,
      reminder_date TEXT,
      created_at TEXT NOT NULL,
      completed_at TEXT,
      task_list_id TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      firebase_id TEXT,
      last_synced_at TEXT,
      needs_sync INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS task_tags (
      task_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (task_id, tag_id)
    );
  `);
}

// ---- Tags ----

export async function getAllTags(): Promise<Tag[]> {
  const database = await openDatabase();
  const rows = await database.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM tags ORDER BY name ASC'
  );
  return rows.map(rowToTag);
}

export async function upsertTag(tag: Tag): Promise<void> {
  const database = await openDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO tags
      (id, name, color_hex, created_at, firebase_id, last_synced_at, needs_sync)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    tag.id,
    tag.name,
    tag.colorHex,
    tag.createdAt,
    tag.firebaseId ?? null,
    tag.lastSyncedAt ?? null,
    tag.needsSync ? 1 : 0
  );
}

export async function deleteTag(id: string): Promise<void> {
  const database = await openDatabase();
  await database.runAsync('DELETE FROM task_tags WHERE tag_id = ?', id);
  await database.runAsync('DELETE FROM tags WHERE id = ?', id);
}

// ---- Tasks ----

export async function getAllTasks(): Promise<Task[]> {
  const database = await openDatabase();
  const rows = await database.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM tasks ORDER BY sort_order ASC, created_at DESC'
  );
  const tasks: Task[] = [];
  for (const row of rows) {
    const task = rowToTask(row);
    const tagRows = await database.getAllAsync<{ tag_id: string }>(
      'SELECT tag_id FROM task_tags WHERE task_id = ?',
      task.id
    );
    task.tagIds = tagRows.map((r) => r.tag_id);
    tasks.push(task);
  }
  return tasks;
}

export async function upsertTask(task: Task): Promise<void> {
  const database = await openDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO tasks
      (id, title, note, is_completed, is_important, is_my_day,
       due_date, reminder_date, created_at, completed_at,
       task_list_id, sort_order, firebase_id, last_synced_at, needs_sync)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    task.id,
    task.title,
    task.note ?? null,
    task.isCompleted ? 1 : 0,
    task.isImportant ? 1 : 0,
    task.isMyDay ? 1 : 0,
    task.dueDate ?? null,
    task.reminderDate ?? null,
    task.createdAt,
    task.completedAt ?? null,
    task.taskListId ?? null,
    task.order,
    task.firebaseId ?? null,
    task.lastSyncedAt ?? null,
    task.needsSync ? 1 : 0
  );

  // Sync tag associations
  await database.runAsync('DELETE FROM task_tags WHERE task_id = ?', task.id);
  for (const tagId of task.tagIds) {
    await database.runAsync(
      'INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)',
      task.id,
      tagId
    );
  }
}

export async function deleteTask(id: string): Promise<void> {
  const database = await openDatabase();
  await database.runAsync('DELETE FROM task_tags WHERE task_id = ?', id);
  await database.runAsync('DELETE FROM tasks WHERE id = ?', id);
}

export async function deleteCompletedTasks(): Promise<void> {
  const database = await openDatabase();
  const completed = await database.getAllAsync<{ id: string }>(
    'SELECT id FROM tasks WHERE is_completed = 1'
  );
  for (const row of completed) {
    await database.runAsync('DELETE FROM task_tags WHERE task_id = ?', row.id);
  }
  await database.runAsync('DELETE FROM tasks WHERE is_completed = 1');
}

// ---- Row mappers ----

function rowToTag(row: Record<string, unknown>): Tag {
  return {
    id: row.id as string,
    name: row.name as string,
    colorHex: (row.color_hex as string) ?? '#7C6FCD',
    createdAt: row.created_at as string,
    firebaseId: (row.firebase_id as string | null) ?? undefined,
    lastSyncedAt: (row.last_synced_at as string | null) ?? undefined,
    needsSync: (row.needs_sync as number) === 1,
  };
}

function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    note: (row.note as string | null) ?? undefined,
    isCompleted: (row.is_completed as number) === 1,
    isImportant: (row.is_important as number) === 1,
    isMyDay: (row.is_my_day as number) === 1,
    dueDate: (row.due_date as string | null) ?? undefined,
    reminderDate: (row.reminder_date as string | null) ?? undefined,
    createdAt: row.created_at as string,
    completedAt: (row.completed_at as string | null) ?? undefined,
    taskListId: (row.task_list_id as string | null) ?? undefined,
    order: row.sort_order as number,
    tagIds: [],
    firebaseId: (row.firebase_id as string | null) ?? undefined,
    lastSyncedAt: (row.last_synced_at as string | null) ?? undefined,
    needsSync: (row.needs_sync as number) === 1,
  };
}
