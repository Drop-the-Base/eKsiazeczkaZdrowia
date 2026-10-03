import { useEffect, useState } from 'react';
import { DOCTOR_DEMO_PATH, restartDemo } from '../../demoMode';
import { Button, todayIso } from '../../ui';
import { dismissBeforeVisit } from '../visit-list';
import type { TourStep } from './steps';
import { useTour } from './useTour';
import styles from './DemoTour.module.css';

/** The demo's follow-up visit (shared/demo-data.ts): its sheet would cover the first steps. */
const DEMO_FOLLOW_UP = 'demo-rem-followup';
/** Must match the media query and `max-height` of `.card` in DemoTour.module.css. */
const NARROW = '(max-width: 999px)';
const CARD_SPACE = '50dvh';

function DoctorLink({ children }: { children: string }) {
  return (
    <a className={styles.link} href={DOCTOR_DEMO_PATH} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

function StepBody({ step }: { step: TourStep }) {
  return (
    <>
      <h2 className={styles.title}>{step.title}</h2>
      {step.text.map((t) => (
        <p key={t} className={styles.text}>
          {t}
        </p>
      ))}
      {step.punchline && <p className={styles.punchline}>{step.punchline}</p>}
      {step.story && (
        <div className={styles.story}>
          <span className={styles.label}>W prawdziwej historii</span>
          <p>{step.story}</p>
        </div>
      )}
      {step.why && (
        <div className={styles.why}>
          <span className={styles.label}>
            {step.full ? 'Zanim zaczniesz' : 'Dlaczego to ważne'}
          </span>
          <p>{step.why}</p>
        </div>
      )}
    </>
  );
}

/** Demo guide: the app greyed out, one element lit, a card with what to look at and why. */
export function DemoTour() {
  const tour = useTour();
  const [collapsed, setCollapsed] = useState(false);
  const { step, index, total } = tour;
  const last = index === total - 1;

  useEffect(() => dismissBeforeVisit(DEMO_FOLLOW_UP, todayIso()), []);
  useEffect(() => setCollapsed(false), [index]);

  // Narrow screen: the card covers the bottom, so the page gets room to scroll the lit element up.
  const cardShown = tour.open && !step.full;
  useEffect(() => {
    if (!cardShown || !window.matchMedia(NARROW).matches) return;
    document.body.style.paddingBottom = CARD_SPACE;
    return () => {
      document.body.style.paddingBottom = '';
    };
  }, [cardShown]);

  if (!tour.open) {
    return (
      <button type="button" className={styles.reopen} onClick={tour.reopen}>
        Przewodnik demo
      </button>
    );
  }

  if (step.full) {
    return (
      <div className={styles.fullDim} role="dialog" aria-modal="true" aria-label={step.title}>
        <div className={styles.fullCard}>
          <p className={styles.kicker}>{index === 0 ? 'Demo · 3 minuty' : 'Koniec demo'}</p>
          <StepBody step={step} />
          <div className={styles.actions}>
            {index === 0 ? (
              <>
                <Button onClick={tour.next}>Zaczynamy →</Button>
                <Button variant="secondary" onClick={tour.close}>
                  Sam poklikam
                </Button>
                <DoctorLink>Tylko widok lekarza (nowa karta)</DoctorLink>
              </>
            ) : (
              <>
                <Button onClick={tour.close}>Poklikaj sam</Button>
                <Button variant="secondary" onClick={restartDemo}>
                  Zacznij od nowa
                </Button>
                <a className={styles.link} href="/">
                  Otwórz prawdziwą aplikację →
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {tour.spot ? (
        <div
          className={styles.spot}
          style={{
            top: tour.spot.top - 6,
            left: tour.spot.left - 6,
            width: tour.spot.width + 12,
            height: tour.spot.height + 12,
          }}
          aria-hidden="true"
        />
      ) : (
        <div className={styles.dim} aria-hidden="true" />
      )}
      <aside
        className={collapsed ? `${styles.card} ${styles.collapsed}` : styles.card}
        aria-label="Przewodnik demo"
      >
        <div className={styles.header}>
          <span className={styles.progress}>
            Krok {index} z {total - 2}
          </span>
          <div className={styles.dots} aria-hidden="true">
            {Array.from({ length: total - 2 }, (_, i) => (
              <span key={i} className={i < index ? styles.dotOn : styles.dot} />
            ))}
          </div>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Rozwiń opis' : 'Zwiń opis'}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d={collapsed ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className={styles.iconButton}
            onClick={tour.close}
            aria-label="Zamknij przewodnik"
          >
            ×
          </button>
        </div>
        {collapsed ? (
          <h2 className={styles.title}>{step.title}</h2>
        ) : (
          <div className={styles.body}>
            <StepBody step={step} />
            {step.id === 'share' && <DoctorLink>Otwórz widok lekarza w nowej karcie</DoctorLink>}
            {tour.error && (
              <p className={styles.error} role="alert">
                {tour.error}
              </p>
            )}
          </div>
        )}
        <div className={styles.nav}>
          <Button variant="ghost" onClick={tour.back} className={styles.back}>
            Wstecz
          </Button>
          {step.showMe && (
            <Button
              variant="secondary"
              disabled={tour.showing}
              onClick={() => {
                setCollapsed(true);
                tour.showMe();
              }}
            >
              {tour.showing ? 'Pokazuję…' : 'Pokaż mi'}
            </Button>
          )}
          <Button onClick={tour.next} className={styles.next}>
            {last ? 'Koniec' : 'Dalej →'}
          </Button>
        </div>
      </aside>
    </>
  );
}
