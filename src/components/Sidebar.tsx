import type { Tag, Priority } from '../types';
import type { StatusFilter, SortKey } from '../features/tasks/filterTasks';

interface SidebarProps {
  tags: Tag[];
  tagCounts: Record<string, number>;
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  tagId: string | null;
  onTagChange: (tagId: string | null) => void;
  priority: Priority | null;
  onPriorityChange: (priority: Priority | null) => void;
  onlyToday: boolean;
  onOnlyTodayChange: (value: boolean) => void;
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
}

const STATUS_LABEL: Record<StatusFilter, string> = { all: '🗂 전체', todo: '🕑 진행중', done: '✅ 완료' };
const PRIORITY_LABEL: Record<Priority, string> = { high: '🔥 높음', medium: '⭐ 보통', low: '🌱 낮음' };

export function Sidebar({
  tags,
  tagCounts,
  status,
  onStatusChange,
  tagId,
  onTagChange,
  priority,
  onPriorityChange,
  onlyToday,
  onOnlyTodayChange,
  sortKey,
  onSortChange,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <section>
        <h3>👀 보기</h3>
        <button className={onlyToday ? 'active' : ''} onClick={() => onOnlyTodayChange(!onlyToday)}>
          📅 오늘 마감
        </button>
      </section>

      <section>
        <h3>📌 상태</h3>
        <div className="button-group">
          {(['all', 'todo', 'done'] as StatusFilter[]).map((s) => (
            <button key={s} className={status === s ? 'active' : ''} onClick={() => onStatusChange(s)}>
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3>⚡ 우선순위</h3>
        <div className="button-group">
          {(['high', 'medium', 'low'] as Priority[]).map((p) => (
            <button
              key={p}
              className={priority === p ? 'active' : ''}
              onClick={() => onPriorityChange(priority === p ? null : p)}
            >
              {PRIORITY_LABEL[p]}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3>🏷️ 태그</h3>
        <ul className="sidebar__tags">
          {tags.map((tag) => (
            <li key={tag.id}>
              <button
                className={tagId === tag.id ? 'active' : ''}
                onClick={() => onTagChange(tagId === tag.id ? null : tag.id)}
              >
                <span className="tag-dot" style={{ backgroundColor: tag.color }} />
                {tag.name} ({tagCounts[tag.id] ?? 0})
              </button>
            </li>
          ))}
          {tags.length === 0 && <li className="sidebar__empty">아직 태그가 없습니다</li>}
        </ul>
      </section>

      <section>
        <h3>🔀 정렬</h3>
        <select value={sortKey} onChange={(e) => onSortChange(e.target.value as SortKey)}>
          <option value="dueDate">마감일순</option>
          <option value="priority">우선순위순</option>
          <option value="createdAt">최근 추가순</option>
          <option value="manual">수동 정렬</option>
        </select>
      </section>
    </aside>
  );
}
