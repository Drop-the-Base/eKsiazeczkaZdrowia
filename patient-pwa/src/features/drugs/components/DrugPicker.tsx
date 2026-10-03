import { useId, useState } from 'react';
import type { DrugPickerProps } from '@ez/shared';
import type { DrugEntry } from '../drugs.logic';
import { useDrugSearch } from '../useDrugSearch';
import styles from './DrugPicker.module.css';

type Props = Omit<DrugPickerProps, 'onSelect'> & {
  label?: string;
  /** Jak w kontrakcie, ale lek z RPL ma informację o OTC (podpowiedź grupy leku). */
  onSelect: (pick: { drug?: DrugEntry; name: string }) => void;
};

/** Wyszukiwarka leków z RPL; wpisany tekst też można wybrać (suplementy, zioła). */
export function DrugPicker({ onSelect, placeholder = 'np. Ibuprom', label = 'Nazwa leku' }: Props) {
  const inputId = useId();
  const [query, setQuery] = useState('');
  const search = useDrugSearch(query);
  const typed = query.trim();

  const pick = (pickValue: { drug?: DrugEntry; name: string }) => {
    onSelect(pickValue);
    setQuery('');
  };

  return (
    <div className={styles.picker}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        id={inputId}
        className={styles.input}
        type="search"
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && typed) {
            e.preventDefault();
            const first = search.status === 'ready' ? search.results[0] : undefined;
            pick(first ? { drug: first, name: first.name } : { name: typed });
          }
        }}
      />

      {typed.length >= 2 && (
        <ul className={styles.results} role="listbox" aria-label="Podpowiedzi">
          {search.status === 'loading' && <li className={styles.info}>Szukam…</li>}
          {search.status === 'error' && (
            <li className={styles.error} role="alert">
              {search.message}
            </li>
          )}
          {search.status === 'ready' &&
            search.results.map((drug) => (
              <li key={drug.rplId}>
                <button
                  type="button"
                  className={styles.option}
                  onClick={() => pick({ drug, name: drug.name })}
                >
                  <span className={styles.name}>
                    {drug.name} <span className={styles.strength}>{drug.strength}</span>
                  </span>
                  <span className={styles.meta}>
                    {drug.activeSubstance} · {drug.form}
                    {drug.otc && ' · bez recepty'}
                  </span>
                </button>
              </li>
            ))}
          <li>
            <button type="button" className={styles.option} onClick={() => pick({ name: typed })}>
              <span className={styles.name}>Użyj „{typed}”</span>
              <span className={styles.meta}>spoza bazy, np. suplement albo zioła</span>
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
