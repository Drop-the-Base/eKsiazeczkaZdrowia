import { useEffect, useState } from 'react';
import type { DrugEntry } from './drugs.logic';
import { searchDrugs } from './searchDrugs';

export type DrugSearch =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; results: DrugEntry[] }
  | { status: 'error'; message: string };

const DEBOUNCE_MS = 150;

export function useDrugSearch(query: string, limit = 8): DrugSearch {
  const [state, setState] = useState<DrugSearch>({ status: 'idle' });

  useEffect(() => {
    if (query.trim().length < 2) {
      setState({ status: 'idle' });
      return;
    }
    let cancelled = false;
    setState((s) => (s.status === 'ready' ? s : { status: 'loading' }));
    const timer = window.setTimeout(() => {
      searchDrugs(query, limit).then(
        (results) => {
          if (!cancelled) setState({ status: 'ready', results });
        },
        (err: unknown) => {
          if (!cancelled) {
            setState({
              status: 'error',
              message: err instanceof Error ? err.message : 'Nie udało się wyszukać leku',
            });
          }
        },
      );
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, limit]);

  return state;
}
