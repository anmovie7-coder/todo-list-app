import { useState, type FormEvent } from 'react';
import type { Task, Tag, Priority } from '../types';

export interface TaskFormValues {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  reminderAt: string;
  tagIds: string[];
}

interface TaskFormProps {
  initial?: Task;
  tags: Tag[];
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
  onCreateTag: (name: string) => Promise<Tag>;
}

export function TaskForm({ initial, tags, onSubmit, onCancel, onCreateTag }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '');
  const [reminderAt, setReminderAt] = useState(initial?.reminderAt ?? '');
  const [tagIds, setTagIds] = useState<string[]>(initial?.tagIds ?? []);
  const [newTagName, setNewTagName] = useState('');

  const toggleTag = (id: string) => {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    const tag = await onCreateTag(name);
    setTagIds((prev) => [...prev, tag.id]);
    setNewTagName('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description, priority, dueDate, reminderAt, tagIds });
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>{initial ? '✏️ 할 일 수정' : '✨ 할 일 추가'}</h2>

      <label>
        제목
        <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus required />
      </label>

      <label>
        설명
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </label>

      <div className="task-form__row">
        <label>
          우선순위
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            <option value="high">🔥 높음</option>
            <option value="medium">⭐ 보통</option>
            <option value="low">🌱 낮음</option>
          </select>
        </label>

        <label>
          마감일
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>

        <label>
          알림 시각
          <input type="datetime-local" value={reminderAt} onChange={(e) => setReminderAt(e.target.value)} />
        </label>
      </div>

      <div className="task-form__tags">
        <span>태그</span>
        <div className="task-form__tag-list">
          {tags.map((tag) => (
            <label key={tag.id} className="tag-checkbox">
              <input type="checkbox" checked={tagIds.includes(tag.id)} onChange={() => toggleTag(tag.id)} />
              {tag.name}
            </label>
          ))}
        </div>
        <div className="task-form__new-tag">
          <input
            placeholder="새 태그 이름"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
          />
          <button type="button" onClick={handleCreateTag}>
            + 추가
          </button>
        </div>
      </div>

      <div className="task-form__actions">
        <button type="button" onClick={onCancel}>
          취소
        </button>
        <button type="submit">저장 🎉</button>
      </div>
    </form>
  );
}
