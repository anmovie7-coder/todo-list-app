import Dexie, { type Table } from 'dexie';
import type { Task, Tag } from '../types';

class TodoDatabase extends Dexie {
  tasks!: Table<Task, string>;
  tags!: Table<Tag, string>;

  constructor() {
    super('todo-app');
    this.version(1).stores({
      tasks: 'id, status, priority, dueDate, order, createdAt, *tagIds',
      tags: 'id, name',
    });
  }
}

export const db = new TodoDatabase();
