import { useEffect, useState } from 'react';
import type { Medication } from '@ez/shared';
import { Card, LoadingState } from '../../../ui';
import { atcGroupName } from '../atc.logic';
import type { DrugEntry } from '../drugs.logic';
import { findDrug } from '../searchDrugs';
import styles from './DrugInfoCard.module.css';

type State =
  { status: 'loading' } | { status: 'ready'; drug: DrugEntry | undefined } | { status: 'error' };

/**
 * Fakty o leku z Rejestru Produktów Leczniczych: substancja, moc, postać, grupa ATC, dostępność,
 * link do pełnej ulotki (dawkowanie, przeciwwskazania). Bez ostrzeżeń i interpretacji.
 */
export function DrugInfoCard({ medication }: { medication: Medication }) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const rplId = medication.rplId;

  useEffect(() => {
    if (!rplId) return;
    let cancelled = false;
    findDrug(rplId).then(
      (drug) => !cancelled && setState({ status: 'ready', drug }),
      () => !cancelled && setState({ status: 'error' }),
    );
    return () => {
      cancelled = true;
    };
  }, [rplId]);

  // Lek spoza RPL (suplement, zioła) – tylko to, co wpisał pacjent.
  if (!rplId) {
    return (
      <Card className={styles.card}>
        <p className={styles.muted}>Spoza Rejestru Produktów Leczniczych (np. suplement).</p>
      </Card>
    );
  }
  if (state.status === 'loading') return <LoadingState label="Wczytywanie danych leku…" />;

  const drug = state.status === 'ready' ? state.drug : undefined;
  const substance = drug?.activeSubstance ?? medication.activeSubstance;
  const atc = drug?.atcCode ?? medication.atcCode;
  const group = atc ? atcGroupName(atc) : undefined;

  return (
    <Card className={styles.card}>
      <dl className={styles.facts}>
        {substance && <Fact label="Substancja czynna" value={substance} />}
        {drug && <Fact label="Moc" value={drug.strength} />}
        {drug && <Fact label="Postać" value={drug.form} />}
        {atc && <Fact label="Kod ATC" value={group ? `${atc} · ${group}` : atc} />}
        {drug && <Fact label="Dostępność" value={drug.otc ? 'bez recepty' : 'na receptę'} />}
      </dl>
      {drug?.leafletUrl && (
        <a className={styles.link} href={drug.leafletUrl} target="_blank" rel="noreferrer">
          Pełna ulotka (dawkowanie, przeciwwskazania) ↗
        </a>
      )}
      <p className={styles.muted}>
        Źródło: Rejestr Produktów Leczniczych
        {state.status === 'error' && ' (tryb offline, dane lokalne)'}.
      </p>
    </Card>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}
