import { useCallback, useEffect, useState } from 'react';
import { DOCTOR_DEMO_PATH, restartDemo } from '../../demoMode';
import { Button, todayIso } from '../../ui';
import { dismissBeforeVisit } from '../visit-list';
import type { TourStep } from './steps';
import { isEditableTarget } from './tour.logic';
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

/** New tab: the patient tab stays open, it hands the QR over to the doctor tab (DEMO_QR_CHANNEL). */
const openDoctorDemo = () => window.open(DOCTOR_DEMO_PATH, '_blank', 'noopener');

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
const RADIUS = 12;

function getMaskPath(left: number, top: number, width: number, height: number, r: number): string {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (width <= 0 || height <= 0) {
    return `M 0 0 H ${w} V ${h} H 0 Z`;
  }
  if (r <= 0) {
    return `M 0 0 H ${w} V ${h} H 0 Z M ${left} ${top} h ${width} v ${height} h -${width} Z`;
  }
  return `M 0 0 H ${w} V ${h} H 0 Z M ${left + r} ${top} h ${width - 2 * r} a ${r} ${r} 0 0 1 ${r} ${r} v ${height - 2 * r} a ${r} ${r} 0 0 1 -${r} ${r} h -${width - 2 * r} a ${r} ${r} 0 0 1 -${r} -${r} v -${height - 2 * r} a ${r} ${r} 0 0 1 ${r} -${r} Z`;
}

/**
 * Dims everything except the lit element, and takes the clicks there: full-screen SVG mask with a
 * rounded cutout matching the ring's border-radius (the hole itself stays clickable).
 * Without a lit element the whole screen is dimmed.
 */
function Mask({ spot }: { spot: Spot | null }) {
  if (!spot) return <div className={styles.dim} aria-hidden="true" />;
  const top = Math.max(spot.top - RING_PADDING, 0);
  const left = Math.max(spot.left - RING_PADDING, 0);
  const bottom = Math.min(spot.top + spot.height + RING_PADDING, window.innerHeight);
  const right = Math.min(spot.left + spot.width + RING_PADDING, window.innerWidth);
  const width = Math.max(right - left, 0);
  const height = Math.max(bottom - top, 0);
  const r = Math.max(0, Math.min(RADIUS, width / 2, height / 2));

  return (
    <div aria-hidden="true">
      <svg className={styles.mask}>
        <path
          className={styles.maskPath}
          fillRule="evenodd"
          d={getMaskPath(left, top, width, height, r)}
        />
      </svg>
      <div className={styles.ring} style={{ top, left, width, height }} />
    </div>
  );
}

function RetryIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

/** Demo guide: the app greyed out, one element lit, a card with what to look at and why. */
export function DemoTour() {
  const tour = useTour();
  const [collapsed, setCollapsed] = useState(false);
  const [demonstrated, setDemonstrated] = useState<Set<string>>(() => new Set());
  const { step, index, total } = tour;
  const last = index === total - 1;
  const isDemonstrated = !step.showMe || demonstrated.has(step.id);

  useEffect(() => dismissBeforeVisit(DEMO_FOLLOW_UP, todayIso()), []);
  useEffect(() => setCollapsed(false), [index]);

  const runDemo = useCallback(async () => {
    if (!step.showMe || tour.showing) return;
    setCollapsed(true);
    try {
      await tour.showMe();
      setDemonstrated((prev) => new Set(prev).add(step.id));
    } finally {
      setCollapsed(false);
    }
  }, [step.showMe, step.id, tour.showing, tour.showMe]);

  const handlePrimaryNext = useCallback(async () => {
    if (tour.showing) return;
    if (!isDemonstrated) {
      await runDemo();
    } else {
      if (step.full && last) {
        openDoctorDemo();
      } else {
        tour.next();
      }
    }
  }, [tour.showing, isDemonstrated, runDemo, step.full, last, tour.close, tour.next]);

  // Narrow screen: the card covers the bottom, so the page gets room to scroll the lit element up.
  const cardShown = tour.open && !step.full;
  useEffect(() => {
    if (!cardShown || !window.matchMedia(NARROW).matches) return;
    document.body.style.paddingBottom = CARD_SPACE;
    return () => {
      document.body.style.paddingBottom = '';
    };
  }, [cardShown]);

  // Navigate tour steps via keyboard ArrowLeft / ArrowRight
  useEffect(() => {
    if (!tour.open || tour.showing) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (isEditableTarget(e.target)) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        void handlePrimaryNext();
      } else if (e.key === 'ArrowLeft') {
        if (index > 0) {
          e.preventDefault();
          tour.back();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [tour.open, tour.showing, index, tour.back, handlePrimaryNext]);

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
                <Button onClick={tour.next} title="Rozpocznij prezentację (→)">
                  Rozpocznij prezentację
                </Button>
                <Button variant="secondary" onClick={tour.close}>
                  Pomiń przewodnik
                </Button>
                <DoctorLink>Otwórz widok lekarza (nowa karta)</DoctorLink>
              </>
            ) : (
              <>
                <p className={styles.handover}>
                  Zobacz, jak te same dane, w tym suplement i oś czasu, widzi lekarz podczas wizyty.
                </p>
                <Button onClick={openDoctorDemo} title="Przejdź do widoku lekarza (→)">
                  Przejdź do widoku lekarza →
                </Button>
                <Button variant="secondary" onClick={tour.close}>
                  Przejdź do aplikacji
                </Button>
                <Button variant="ghost" onClick={restartDemo}>
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
      {tour.showing && (
        <>
          <div className={styles.inputBlocker} aria-hidden="true" />
          {step.id === 'timeline' && (
            <div className={styles.hintBadge} role="status" aria-live="polite">
              <span className={styles.hintIcon} aria-hidden="true">
                ↔
              </span>
              Możesz przybliżać oś (+ / −) i przewijać ją w poziomie
            </div>
          )}
        </>
      )}
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
          <Button
            variant="ghost"
            onClick={tour.back}
            disabled={tour.showing}
            className={styles.back}
            title={index > 0 ? 'Wstecz (←)' : undefined}
          >
            Wstecz
          </Button>
          <div className={styles.navActions}>
            {step.showMe && isDemonstrated && (
              <Button
                variant="secondary"
                disabled={tour.showing}
                onClick={runDemo}
                className={styles.retryBtn}
                title="Zademonstruj ponownie"
                aria-label="Zademonstruj ponownie"
              >
                <RetryIcon />
              </Button>
            )}
            <Button
              onClick={handlePrimaryNext}
              disabled={tour.showing}
              className={styles.next}
              title={
                tour.showing
                  ? undefined
                  : !isDemonstrated
                    ? 'Zademonstruj (→)'
                    : last
                      ? 'Zakończ (→)'
                      : 'Dalej (→)'
              }
            >
              {tour.showing ? 'Trwa demonstracja…' : isDemonstrated && last ? 'Zakończ' : 'Dalej'}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
