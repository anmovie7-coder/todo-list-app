export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string; // ISO date, e.g. 2026-09-20
  reminderAt?: string; // ISO datetime
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}
