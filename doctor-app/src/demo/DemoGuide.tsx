import { useEffect, useState } from 'react';
import { useSession } from '../session/SessionContext';
import { useDemoPhone } from './DemoPhone';
import { useQrChannel } from './useQrChannel';
import { PATIENT_DEMO_PATH } from './demoMode';
import { GUIDE_TOTAL, QR_STEP, VERIFY_STEP, VIEW_STEPS, type GuideStep } from './steps';
import { resolveGuideKeyAction } from './guide.logic';
import { useSpot, type Spot } from './useSpot';
import styles from './DemoGuide.module.css';

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

/** Card width and its gap to the screen edge (DemoGuide.module.css): the strip it occupies on the right. */
const CARD_STRIP = 400 + 24;

/** The card stands on the right; when the lit element reaches under it, it moves to the left. */
function cardSide(spot: Spot | null): 'left' | 'right' {
  if (!spot) return 'right';
  const underCard = spot.left + spot.width > window.innerWidth - CARD_STRIP;
  const roomOnLeft = spot.left > CARD_STRIP;
  return underCard && roomOnLeft ? 'left' : 'right';
}

/** Dims everything except the lit element and takes the clicks there; the hole stays clickable. */
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

function StepBody({ step }: { step: GuideStep }) {
  return (
    <>
      <h2 className={styles.title}>{step.title}</h2>
      {step.text.map((t) => (
        <p key={t} className={styles.text}>
          {t}
        </p>
      ))}
      {step.story && (
        <div className={styles.story}>
          <span className={styles.label}>Studium przypadku</span>
          <p>{step.story}</p>
        </div>
      )}
      {step.why && (
        <div className={styles.why}>
          <span className={styles.label}>Znaczenie</span>
          <p>{step.why}</p>
        </div>
      )}
    </>
  );
}

/** Guide of `/demo/lekarz`: follows the session (QR, code, data), greys out the rest of the page. */
export function DemoGuide() {
  const { status, code, verified, snapshot, qrPayload, confirmCode } = useSession();
  const phone = useDemoPhone();
  useQrChannel(status === 'waiting-for-patient' ? qrPayload : undefined);
  const [open, setOpen] = useState(true);
  const [view, setView] = useState(0);

  const stage =
    status === 'waiting-for-patient'
      ? 'qr'
      : code && !verified
        ? 'verify'
        : status === 'received' && snapshot
          ? 'view'
          : undefined;
  const step = stage === 'qr' ? QR_STEP : stage === 'verify' ? VERIFY_STEP : VIEW_STEPS[view];
  const index = stage === 'qr' ? 0 : stage === 'verify' ? 1 : 2 + view;
  const shown = open && step !== undefined;

  const spot = useSpot(shown ? step?.target : undefined, step);

  // The step's section tab. All sections stay rendered, so the lit element exists right away.
  const tab = stage === 'view' ? VIEW_STEPS[view]?.tab : undefined;
  useEffect(() => {
    if (tab) document.querySelector<HTMLElement>(`[data-tour="tab-${tab}"]`)?.click();
  }, [tab, snapshot]);

  // Open timeline details dialog on the timeline-details step if not already opened; close when leaving.
  useEffect(() => {
    if (stage === 'view' && VIEW_STEPS[view]?.target === 'timeline-details') {
      const timer = setTimeout(() => {
        const marker = document.querySelector<HTMLElement>('[data-tour="timeline-exam-mark"]');
        if (marker && !document.querySelector('[data-tour="timeline-details"]')) {
          marker.click();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
    if (stage === 'view' && VIEW_STEPS[view]?.target !== 'timeline-details') {
      const closeBtn = document.querySelector<HTMLElement>('[data-tour="timeline-details-close"]');
      closeBtn?.click();
    }
  }, [stage, view]);

  if (!step) return null;
  if (!open) {
    return (
      <button type="button" className={styles.reopen} onClick={() => setOpen(true)}>
        Przewodnik demo
      </button>
    );
  }

  const lastView = stage === 'view' && view === VIEW_STEPS.length - 1;

  // Navigate guide steps via keyboard ArrowLeft / ArrowRight
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const action = resolveGuideKeyAction(
        e.key,
        {
          open,
          stage,
          isBusy: phone.busy,
          hasQrPayload: Boolean(qrPayload),
          view,
          lastView,
        },
        e.target,
      );

      if (!action) return;
      e.preventDefault();

      switch (action) {
        case 'simulate':
          if (qrPayload) void phone.simulate(qrPayload);
          break;
        case 'confirm':
          confirmCode();
          break;
        case 'nextView':
          setView((v) => v + 1);
          break;
        case 'prevView':
          setView((v) => v - 1);
          break;
        case 'close':
          setOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, stage, phone, qrPayload, view, lastView, confirmCode]);

  return (
    <>
      <Mask spot={spot} />
      <aside
        className={cardSide(spot) === 'left' ? `${styles.card} ${styles.cardLeft}` : styles.card}
        aria-label="Przewodnik demo"
      >
        <div className={styles.header}>
          <span className={styles.progress}>
            Krok {index + 1} z {GUIDE_TOTAL}
          </span>
          <div className={styles.dots} aria-hidden="true">
            {Array.from({ length: GUIDE_TOTAL }, (_, i) => (
              <span key={i} className={i <= index ? styles.dotOn : styles.dot} />
            ))}
          </div>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setOpen(false)}
            aria-label="Zamknij przewodnik"
          >
            ×
          </button>
        </div>
        <div className={styles.body}>
          <StepBody step={step} />
          {phone.error && (
            <p className={styles.error} role="alert">
              {phone.error}
            </p>
          )}
          {lastView && (
            <p className={styles.links}>
              <a href={PATIENT_DEMO_PATH}>Wróć do prezentacji aplikacji pacjenta</a>
              <a href="/lekarz/">Otwórz pełną wersję widoku lekarza</a>
            </p>
          )}
        </div>
        <div className={styles.nav}>
          <button
            type="button"
            className={styles.back}
            disabled={stage !== 'view' || view === 0}
            onClick={() => setView((v) => v - 1)}
            title={stage === 'view' && view > 0 ? 'Wstecz (←)' : undefined}
          >
            Wstecz
          </button>
          {stage === 'qr' && (
            <button
              type="button"
              className={styles.next}
              disabled={!qrPayload || phone.busy}
              onClick={() => qrPayload && void phone.simulate(qrPayload)}
              title={qrPayload && !phone.busy ? 'Symuluj telefon pacjentki (→)' : undefined}
            >
              {phone.busy ? 'Łączenie…' : 'Symuluj telefon pacjentki'}
            </button>
          )}
          {stage === 'verify' && (
            <button
              type="button"
              className={styles.next}
              onClick={confirmCode}
              title="Kody są zgodne (→)"
            >
              Kody są zgodne
            </button>
          )}
          {stage === 'view' && (
            <button
              type="button"
              className={styles.next}
              onClick={() => (lastView ? setOpen(false) : setView((v) => v + 1))}
              title={lastView ? 'Zakończ (→)' : 'Dalej (→)'}
            >
              {lastView ? 'Zakończ' : 'Dalej'}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
