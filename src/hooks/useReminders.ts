import { useEffect, useRef } from 'react';
import type { Task } from '../types';

// setTimeout delays beyond ~24.8 days overflow to a 32-bit int and fire immediately,
// so reminders further out than this are skipped and re-checked once tasks change again.
const MAX_DELAY_MS = 20 * 24 * 60 * 60 * 1000;

export function useReminders(tasks: Task[]) {
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (typeof Notification === 'undefined') return;

    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();

    if (Notification.permission !== 'granted') return;

    const now = Date.now();
    tasks
      .filter((task) => task.status === 'todo' && task.reminderAt)
      .forEach((task) => {
        const delay = new Date(task.reminderAt as string).getTime() - now;
        if (delay <= 0 || delay > MAX_DELAY_MS) return;
        const timer = setTimeout(() => {
          new Notification('할 일 알림', { body: task.title, tag: task.id });
        }, delay);
        timers.current.set(task.id, timer);
      });

    return () => {
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();
    };
  }, [tasks]);
}
