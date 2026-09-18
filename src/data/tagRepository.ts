import { v4 as uuid } from 'uuid';
import { db } from './db';
import type { Tag } from '../types';

const PALETTE = ['#5B8DEF', '#F76C6C', '#5CC8A6', '#F4B740', '#9B7EDE', '#4FB8C4'];

export const tagRepository = {
  async list(): Promise<Tag[]> {
    return db.tags.toArray();
  },

  async create(name: string, color?: string): Promise<Tag> {
    const existingCount = await db.tags.count();
    const tag: Tag = {
      id: uuid(),
      name,
      color: color ?? PALETTE[existingCount % PALETTE.length],
    };
    await db.tags.add(tag);
    return tag;
  },

  async remove(id: string): Promise<void> {
    const affectedTasks = await db.tasks.where('tagIds').equals(id).toArray();
    await db.transaction('rw', db.tasks, db.tags, async () => {
      await db.tags.delete(id);
      await Promise.all(
        affectedTasks.map((task) =>
          db.tasks.update(task.id, { tagIds: task.tagIds.filter((tagId) => tagId !== id) }),
        ),
      );
    });
  },
};
