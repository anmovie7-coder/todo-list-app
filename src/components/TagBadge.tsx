import type { Tag } from '../types';

interface TagBadgeProps {
  tag: Tag;
  onRemove?: () => void;
}

export function TagBadge({ tag, onRemove }: TagBadgeProps) {
  return (
    <span className="tag-badge" style={{ backgroundColor: tag.color }}>
      {tag.name}
      {onRemove && (
        <button type="button" className="tag-badge__remove" onClick={onRemove} aria-label={`${tag.name} 제거`}>
          ×
        </button>
      )}
    </span>
  );
}
