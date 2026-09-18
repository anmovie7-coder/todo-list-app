import type { Task, Priority } from '../../types';

export type SortKey = 'dueDate' | 'priority' | 'createdAt' | 'manual';
export type StatusFilter = 'all' | 'todo' | 'done';

export interface TaskFilters {
  status: StatusFilter;
  tagId: string | null;
  priority: Priority | null;
  onlyToday: boolean;
}

const PRIORITY_WEIGHT: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  return dateStr.slice(0, 10) === todayStr();
}

export function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'done') return false;
  return task.dueDate.slice(0, 10) < todayStr();
}

export function filterAndSortTasks(tasks: Task[], filters: TaskFilters, sortKey: SortKey): Task[] {
  const filtered = tasks.filter((task) => {
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.tagId && !task.tagIds.includes(filters.tagId)) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.onlyToday && !isToday(task.dueDate)) return false;
    return true;
  });

  return [...filtered].sort((a, b) => {
    switch (sortKey) {
      case 'dueDate':
        return (a.dueDate ?? '9999-99-99').localeCompare(b.dueDate ?? '9999-99-99');
      case 'priority':
        return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      case 'createdAt':
        return b.createdAt.localeCompare(a.createdAt);
      case 'manual':
      default:
        return a.order - b.order;
    }
  });
}
