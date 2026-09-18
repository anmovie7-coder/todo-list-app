import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './data/db';
import { taskRepository } from './data/taskRepository';
import { tagRepository } from './data/tagRepository';
import { exportData, importData } from './data/backup';
import { requestNotificationPermission } from './data/notifications';
import { useReminders } from './hooks/useReminders';
import { filterAndSortTasks, type TaskFilters, type StatusFilter, type SortKey } from './features/tasks/filterTasks';
import type { Task, Priority } from './types';
import { Sidebar } from './components/Sidebar';
import { TaskItem } from './components/TaskItem';
import { TaskForm, type TaskFormValues } from './components/TaskForm';
import './App.css';

export default function App() {
  const tasks = useLiveQuery(() => db.tasks.toArray(), []) ?? [];
  const tags = useLiveQuery(() => db.tags.toArray(), []) ?? [];

  const [status, setStatus] = useState<StatusFilter>('all');
  const [tagId, setTagId] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority | null>(null);
  const [onlyToday, setOnlyToday] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('dueDate');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [notifStatus, setNotifStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  );

  useReminders(tasks);

  const filters: TaskFilters = { status, tagId, priority, onlyToday };
  const visibleTasks = useMemo(() => filterAndSortTasks(tasks, filters, sortKey), [tasks, filters, sortKey]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((task) => task.tagIds.forEach((id) => (counts[id] = (counts[id] ?? 0) + 1)));
    return counts;
  }, [tasks]);

  const handleQuickAdd = async (e: FormEvent) => {
    e.preventDefault();
    const title = quickTitle.trim();
    if (!title) return;
    await taskRepository.create({ title });
    setQuickTitle('');
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingTask(null);
  };

  const handleFormSubmit = async (values: TaskFormValues) => {
    const payload = {
      title: values.title,
      description: values.description || undefined,
      priority: values.priority,
      dueDate: values.dueDate || undefined,
      reminderAt: values.reminderAt || undefined,
      tagIds: values.tagIds,
    };
    if (editingTask) {
      await taskRepository.update(editingTask.id, payload);
    } else {
      await taskRepository.create(payload);
    }
    closeForm();
  };

  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission();
    setNotifStatus(permission);
  };

  const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await importData(file);
    e.target.value = '';
  };

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__title">
          <h1>🚀 할 일 목록</h1>
          <p className="app__tagline">오늘도 하나씩, 신나게 해치워봐요!</p>
        </div>
        <div className="app__header-actions">
          {notifStatus !== 'granted' && <button onClick={handleEnableNotifications}>🔔 알림</button>}
          <button onClick={exportData}>⬇️ 내보내기</button>
          <label className="import-button">
            ⬆️ 가져오기
            <input type="file" accept="application/json" onChange={handleImport} hidden />
          </label>
        </div>
      </header>

      <form className="quick-add" onSubmit={handleQuickAdd}>
        <input
          placeholder="할 일을 입력하고 Enter ✏️"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
        />
        <button type="submit">+ 추가</button>
        <button type="button" onClick={() => setFormOpen(true)}>
          ✨ 자세히
        </button>
      </form>

      <div className="app__body">
        <Sidebar
          tags={tags}
          tagCounts={tagCounts}
          status={status}
          onStatusChange={setStatus}
          tagId={tagId}
          onTagChange={setTagId}
          priority={priority}
          onPriorityChange={setPriority}
          onlyToday={onlyToday}
          onOnlyTodayChange={setOnlyToday}
          sortKey={sortKey}
          onSortChange={setSortKey}
        />

        <ul className="task-list">
          {visibleTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              tags={tags}
              onToggle={(id) => taskRepository.toggleStatus(id)}
              onEdit={(t) => {
                setEditingTask(t);
                setFormOpen(true);
              }}
              onDelete={(id) => taskRepository.remove(id)}
            />
          ))}
          {visibleTasks.length === 0 && (
            <li className="task-list__empty">표시할 할 일이 없어요. 새로운 할 일을 추가해보세요!</li>
          )}
        </ul>
      </div>

      {isFormOpen && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <TaskForm
              initial={editingTask ?? undefined}
              tags={tags}
              onSubmit={handleFormSubmit}
              onCancel={closeForm}
              onCreateTag={(name) => tagRepository.create(name)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
