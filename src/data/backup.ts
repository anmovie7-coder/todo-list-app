import { db } from './db';
import type { Task, Tag } from '../types';

export async function exportData(): Promise<void> {
  const tasks = await db.tasks.toArray();
  const tags = await db.tags.toArray();
  const blob = new Blob([JSON.stringify({ tasks, tags }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `todo-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importData(file: File): Promise<void> {
  const text = await file.text();
  const data = JSON.parse(text) as { tasks: Task[]; tags: Tag[] };
  await db.transaction('rw', db.tasks, db.tags, async () => {
    await db.tasks.clear();
    await db.tags.clear();
    await db.tasks.bulkAdd(data.tasks);
    await db.tags.bulkAdd(data.tags);
  });
}
