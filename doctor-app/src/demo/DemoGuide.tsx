import { useEffect, useState } from 'react';
import { useSession } from '../session/SessionContext';
import { useDemoPhone } from './DemoPhone';
import { useQrChannel } from './useQrChannel';
import { PATIENT_DEMO_PATH } from './demoMode';
import { GUIDE_TOTAL, QR_STEP, VERIFY_STEP, VIEW_STEPS, type GuideStep } from './steps';
import { useScrollLock } from './useScrollLock';
import { useSpot, type Spot } from './useSpot';
import styles from './DemoGuide.module.css';

const RING_PADDING = 6;

/** Dims everything except the lit element and takes the clicks there; the hole stays clickable. */
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
          <span className={styles.label}>W prawdziwej historii</span>
          <p>{step.story}</p>
        </div>
      )}
      {step.why && (
        <div className={styles.why}>
          <span className={styles.label}>Dlaczego to ważne</span>
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

  useScrollLock(shown);
  const spot = useSpot(shown ? step?.target : undefined, step);

  // The step's section tab. All sections stay rendered, so the lit element exists right away.
  const tab = stage === 'view' ? VIEW_STEPS[view]?.tab : undefined;
  useEffect(() => {
    if (tab) document.querySelector<HTMLElement>(`[data-tour="tab-${tab}"]`)?.click();
  }, [tab, snapshot]);

  if (!step) return null;
  if (!open) {
    return (
      <button type="button" className={styles.reopen} onClick={() => setOpen(true)}>
        Przewodnik demo
      </button>
    );
  }

  const lastView = stage === 'view' && view === VIEW_STEPS.length - 1;
  return (
    <>
      <Mask spot={spot} />
      <aside className={styles.card} aria-label="Przewodnik demo">
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
        <div className={styles.body} data-allow-scroll>
          <StepBody step={step} />
          {phone.error && (
            <p className={styles.error} role="alert">
              {phone.error}
            </p>
          )}
          {lastView && (
            <p className={styles.links}>
              <a href={PATIENT_DEMO_PATH}>Wróć do demo pacjentki</a>
              <a href="/lekarz/">Prawdziwy widok lekarza</a>
            </p>
          )}
        </div>
        <div className={styles.nav}>
          <button
            type="button"
            className={styles.back}
            disabled={stage !== 'view' || view === 0}
            onClick={() => setView((v) => v - 1)}
          >
            Wstecz
          </button>
          {stage === 'qr' && (
            <button
              type="button"
              className={styles.next}
              disabled={!qrPayload || phone.busy}
              onClick={() => qrPayload && void phone.simulate(qrPayload)}
            >
              {phone.busy ? 'Łączę…' : 'Symuluj telefon pacjentki'}
            </button>
          )}
          {stage === 'verify' && (
            <button type="button" className={styles.next} onClick={confirmCode}>
              Kody się zgadzają
            </button>
          )}
          {stage === 'view' && (
            <button
              type="button"
              className={styles.next}
              onClick={() => (lastView ? setOpen(false) : setView((v) => v + 1))}
            >
              {lastView ? 'Koniec' : 'Dalej →'}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
