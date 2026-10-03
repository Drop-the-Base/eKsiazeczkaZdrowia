import { useEffect, useState } from 'react';
import { DOCTOR_DEMO_PATH, restartDemo } from '../../demoMode';
import { Button, todayIso } from '../../ui';
import { dismissBeforeVisit } from '../visit-list';
import type { TourStep } from './steps';
import { useTour, type Spot } from './useTour';
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
          <span className={styles.label}>Studium przypadku</span>
          <p>{step.story}</p>
        </div>
      )}
      {step.why && (
        <div className={styles.why}>
          <span className={styles.label}>{step.full ? 'Informacje wstępne' : 'Znaczenie'}</span>
          <p>{step.why}</p>
        </div>
      )}
    </>
  );
}

const RING_PADDING = 6;

/**
 * Dims everything except the lit element, and takes the clicks there: four panels around the hole
 * (the hole itself stays clickable). Without a lit element the whole screen is dimmed.
 */
function Mask({ spot }: { spot: Spot | null }) {
  if (!spot) return <div className={styles.dim} aria-hidden="true" />;
  const top = Math.max(spot.top - RING_PADDING, 0);
  const left = Math.max(spot.left - RING_PADDING, 0);
  const bottom = Math.min(spot.top + spot.height + RING_PADDING, window.innerHeight);
  const right = Math.min(spot.left + spot.width + RING_PADDING, window.innerWidth);
  return (
    <div aria-hidden="true">
      <div className={styles.panel} style={{ top: 0, left: 0, right: 0, height: top }} />
      <div className={styles.panel} style={{ top: bottom, left: 0, right: 0, bottom: 0 }} />
      <div className={styles.panel} style={{ top, left: 0, width: left, height: bottom - top }} />
      <div className={styles.panel} style={{ top, left: right, right: 0, height: bottom - top }} />
      <div
        className={styles.ring}
        style={{ top, left, width: right - left, height: bottom - top }}
      />
    </div>
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
          <p className={styles.kicker}>
            {index === 0 ? 'Prezentacja · 3 minuty' : 'Koniec prezentacji'}
          </p>
          <StepBody step={step} />
          <div className={styles.actions}>
            {index === 0 ? (
              <>
                <Button onClick={tour.next}>Rozpocznij prezentację</Button>
                <Button variant="secondary" onClick={tour.close}>
                  Pomiń przewodnik
                </Button>
                <DoctorLink>Otwórz widok lekarza (nowa karta)</DoctorLink>
              </>
            ) : (
              <>
                <Button onClick={tour.close}>Przejdź do aplikacji</Button>
                <Button variant="secondary" onClick={restartDemo}>
                  Uruchom ponownie
                </Button>
                <a className={styles.link} href="/">
                  Otwórz pełną wersję aplikacji
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
      <Mask spot={tour.spot} />
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
              {tour.showing ? 'Trwa demonstracja…' : 'Zademonstruj'}
            </Button>
          )}
          <Button onClick={tour.next} className={styles.next}>
            {last ? 'Zakończ' : 'Dalej'}
          </Button>
        </div>
      </aside>
    </>
  );
}
