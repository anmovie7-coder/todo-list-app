import type { Task, Tag } from '../types';
import { isOverdue } from '../features/tasks/filterTasks';
import { TagBadge } from './TagBadge';

const PRIORITY_LABEL: Record<Task['priority'], string> = {
  high: '🔥 높음',
  medium: '⭐ 보통',
  low: '🌱 낮음',
};

interface TaskItemProps {
  task: Task;
  tags: Tag[];
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, tags, onToggle, onEdit, onDelete }: TaskItemProps) {
  const taskTags = tags.filter((tag) => task.tagIds.includes(tag.id));
  const overdue = isOverdue(task);
  const classes = [
    'task-item',
    `priority-${task.priority}`,
    task.status === 'done' ? 'is-done' : '',
    overdue ? 'is-overdue' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li className={classes}>
      <input
        type="checkbox"
        checked={task.status === 'done'}
        onChange={() => onToggle(task.id)}
        aria-label={`${task.title} 완료 체크`}
      />
      <div className="task-item__body" onClick={() => onEdit(task)}>
        <div className="task-item__title">{task.title}</div>
        <div className="task-item__meta">
          <span className="priority-tag">{PRIORITY_LABEL[task.priority]}</span>
          {task.dueDate && <span className="due-date">{task.dueDate}</span>}
          {taskTags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      </div>
      <button type="button" className="task-item__delete" onClick={() => onDelete(task.id)} aria-label="삭제">
        🗑️
      </button>
    </li>
  );
}
