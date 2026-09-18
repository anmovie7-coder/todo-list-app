import { v4 as uuid } from 'uuid';
import { db } from './db';
import type { Task, Priority } from '../types';

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  reminderAt?: string;
  tagIds?: string[];
}

async function nextOrder(): Promise<number> {
  const last = await db.tasks.orderBy('order').last();
  return (last?.order ?? 0) + 1;
}

export const taskRepository = {
  async list(): Promise<Task[]> {
    return db.tasks.toArray();
  },

  async create(input: CreateTaskInput): Promise<Task> {
    const now = new Date().toISOString();
    const task: Task = {
      id: uuid(),
      title: input.title,
      description: input.description,
      status: 'todo',
      priority: input.priority ?? 'medium',
      dueDate: input.dueDate,
      reminderAt: input.reminderAt,
      tagIds: input.tagIds ?? [],
      createdAt: now,
      updatedAt: now,
      order: await nextOrder(),
    };
    await db.tasks.add(task);
    return task;
  },

  async update(id: string, changes: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<void> {
    await db.tasks.update(id, { ...changes, updatedAt: new Date().toISOString() });
  },

  async toggleStatus(id: string): Promise<void> {
    const task = await db.tasks.get(id);
    if (!task) return;
    await db.tasks.update(id, {
      status: task.status === 'done' ? 'todo' : 'done',
      updatedAt: new Date().toISOString(),
    });
  },

  async remove(id: string): Promise<void> {
    await db.tasks.delete(id);
  },

  async reorder(id: string, order: number): Promise<void> {
    await db.tasks.update(id, { order });
  },
};
