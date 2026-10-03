import { useState } from 'react';
import type { QueryFilter } from '@ez/shared';
import { db } from '../../db';
import {
  Button,
  Card,
  Chip,
  List,
  ListItem,
  LoadingState,
  PageHeader,
  todayIso,
  useLive,
} from '../../ui';
import { VoiceInput } from '../voice';
import { describeFilter, headline, quickQuestions, resultLine } from './ask.logic';
import { askHistory } from './askHistory';
import { runFilter } from './runFilter.logic';
import styles from './AskScreen.module.css';

const NOTICE_KEY = 'ez.askNoticeSeen';

function noticeSeen(): boolean {
  try {
    return localStorage.getItem(NOTICE_KEY) === '1';
  } catch {
    return false;
  }
}

type Answer = { question: string; filter: QueryFilter; offline: boolean };
type State =
  | { status: 'idle' }
  | { status: 'asking'; question: string }
  | { status: 'answer'; answer: Answer }
  | { status: 'error'; message: string };

/** „Zapytaj”: pytanie → filtr (serwer, tylko tekst) → wynik z lokalnej bazy. */
export function AskScreen() {
  const [state, setState] = useState<State>({ status: 'idle' });
  const [pending, setPending] = useState<string | null>(null);
  const [showNotice, setShowNotice] = useState(false);
  const quick = quickQuestions(todayIso());

  const ask = async (question: string) => {
    if (!noticeSeen()) {
      setPending(question);
      setShowNotice(true);
      return;
    }
    setState({ status: 'asking', question });
    try {
      setState({
        status: 'answer',
        answer: { question, filter: await askHistory(question), offline: false },
      });
    } catch (err) {
      const preset = quick.find((q) => q.question === question);
      if (preset) {
        setState({ status: 'answer', answer: { question, filter: preset.filter, offline: true } });
      } else {
        setState({
          status: 'error',
          message: `${err instanceof Error ? err.message : 'Brak połączenia'}. W trybie offline dostępne są tylko pytania predefiniowane.`,
        });
      }
    }
  };

  const acceptNotice = () => {
    try {
      localStorage.setItem(NOTICE_KEY, '1');
    } catch {
      // tylko wygoda – przy braku storage zapytamy ponownie
    }
    setShowNotice(false);
    if (pending) void ask(pending);
    setPending(null);
  };

  return (
    <>
      <PageHeader title="Zapytaj" />
      <div className={styles.content}>
        {showNotice && (
          <Card className={styles.notice} role="note">
            <p>
              Treść pytania, bez danych osobowych i historii leczenia, zostanie przesłana do modelu
              językowego w celu utworzenia kryteriów wyszukiwania. Wyszukiwanie odbywa się na
              urządzeniu, a dane zdrowotne go nie opuszczają.
            </p>
            <Button onClick={acceptNotice} data-tour="confirm">
              Akceptuję i wysyłam
            </Button>
          </Card>
        )}

        <Card>
          <VoiceInput
            mode="ask"
            disabled={state.status === 'asking'}
            onSubmit={(q) => void ask(q)}
          />
        </Card>

        <div className={styles.chips}>
          {quick.map((q) => (
            <Chip key={q.question} onClick={() => void ask(q.question)}>
              {q.question}
            </Chip>
          ))}
        </div>

        {state.status === 'asking' && <p className={styles.muted}>Wyszukiwanie: „{state.question}”…</p>}
        {state.status === 'error' && (
          <p className={styles.error} role="alert">
            {state.message}
          </p>
        )}
        {state.status === 'answer' && <AnswerView answer={state.answer} />}
      </div>
    </>
  );
}

function AnswerView({ answer }: { answer: Answer }) {
  // Wynik z lokalnej bazy, odświeżany na żywo; błąd zapytania łapie ErrorBoundary.
  const results = useLive(async () => {
    const [medications, symptoms, exams] = await Promise.all([
      db.medications.list(),
      db.symptoms.list(),
      db.exams.list(),
    ]);
    return runFilter(answer.filter, { medications, symptoms, exams });
  }, [answer]);

  return (
    <section className={styles.answer} aria-live="polite">
      <p className={styles.question}>„{answer.question}”</p>
      <p className={styles.muted}>
        Kryteria: {describeFilter(answer.filter)}
        {answer.offline && ' (tryb offline, pytanie predefiniowane)'}
      </p>
      {results.status === 'loading' ? (
        <LoadingState />
      ) : (
        <>
          <p className={styles.headline}>{headline(answer.filter, results.data)}</p>
          {results.data.length > 0 && (
            <List>
              {results.data.map((r) => {
                const { title, detail } = resultLine(r);
                return (
                  <ListItem key={`${r.entity}-${r.item.id}`} title={title} subtitle={detail} />
                );
              })}
            </List>
          )}
        </>
      )}
    </section>
  );
}
