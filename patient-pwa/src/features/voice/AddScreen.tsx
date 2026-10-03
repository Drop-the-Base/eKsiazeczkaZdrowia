import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, PageHeader } from '../../ui';
import { ExamSheet } from '../exams';
import { MedicationSheet } from '../meds';
import { SymptomSheet } from '../symptoms';
import { ProposalSheet } from './components/ProposalSheet';
import { VoiceInput } from './components/VoiceInput';
import { parseEntry, toProposals, type Proposal } from './parseEntry';
import styles from './AddScreen.module.css';

type Sheet = 'med' | 'symptom' | 'exam' | null;

/** „Dodaj”: wpis głosem (objawy + przyjęte leki w jednym zdaniu) albo ręcznie. */
export function AddScreen() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<Proposal[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);

  const onEntry = async (text: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const found = await toProposals(await parseEntry(text, new Date().toISOString()));
      if (found.length === 0) {
        setMessage(`Nie rozpoznałem objawu ani leku w „${text}”. Dodaj ręcznie poniżej.`);
      } else {
        setProposals(found);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Nie udało się przetworzyć wpisu');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Dodaj" />
      <div className={styles.content}>
        <Card>
          <VoiceInput mode="entry" disabled={busy} onSubmit={(t) => void onEntry(t)} />
          {message && (
            <p className={styles.message} role="status">
              {message}
            </p>
          )}
        </Card>

        <h2 className={styles.heading}>Albo ręcznie</h2>
        <div className={styles.grid}>
          <Button variant="secondary" onClick={() => setSheet('med')}>
            Lek / suplement
          </Button>
          <Button variant="secondary" onClick={() => setSheet('symptom')}>
            Objaw
          </Button>
          <Button variant="secondary" onClick={() => setSheet('exam')}>
            Wyniki badań
          </Button>
          <Button variant="secondary" onClick={() => navigate('/zdjecia')}>
            Zdjęcie
          </Button>
          <Button variant="secondary" onClick={() => navigate('/dzis')}>
            Leki na dziś
          </Button>
        </div>
      </div>

      <ProposalSheet
        proposals={proposals}
        onClose={() => setProposals(null)}
        onSaved={() => {
          setProposals(null);
          setMessage('Zapisano – zobaczysz to na osi czasu.');
        }}
      />
      <MedicationSheet
        open={sheet === 'med'}
        onClose={() => setSheet(null)}
        medication={undefined}
      />
      <SymptomSheet open={sheet === 'symptom'} onClose={() => setSheet(null)} />
      <ExamSheet open={sheet === 'exam'} onClose={() => setSheet(null)} />
    </>
  );
}
