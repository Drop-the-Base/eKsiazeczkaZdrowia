import type { VisitNoteItem } from '@ez/shared';
import { formatDate } from '../../../ui';
import styles from './NoteRow.module.css';

type Props = {
  item: VisitNoteItem;
  onToggle: (discussed: boolean) => void;
  onRemove: () => void;
};

export function NoteRow({ item, onToggle, onRemove }: Props) {
  return (
    <li className={styles.row}>
      <label className={styles.check}>
        <input
          type="checkbox"
          checked={item.discussed}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span className={item.discussed ? styles.done : undefined}>{item.text}</span>
      </label>
      <span className={styles.meta}>{formatDate(item.createdAt)}</span>
      <button
        type="button"
        className={styles.remove}
        onClick={onRemove}
        aria-label={`Usuń: ${item.text}`}
      >
        ✕
      </button>
    </li>
  );
}
