import { useState } from 'react';
import styles from './Sections.module.css';

/**
 * Long lists show the first `limit` items and "Pokaż wszystkie (N)". Hidden items stay in the DOM
 * with `className`, so the printout still contains everything.
 */
export function useShowMore(total: number, limit: number) {
  const [all, setAll] = useState(false);
  return {
    className: (index: number) => (!all && index >= limit ? styles.more : undefined),
    button:
      total > limit ? (
        <button type="button" className={styles.showMore} onClick={() => setAll((a) => !a)}>
          {all ? 'Zwiń' : `Pokaż wszystkie (${total})`}
        </button>
      ) : null,
  };
}
