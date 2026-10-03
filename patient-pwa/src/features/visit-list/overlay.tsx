import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomSheet } from '../../ui';
import { BeforeVisitSheet } from './components/BeforeVisitSheet';
import { NoteForm } from './components/NoteForm';
import { VISIT_PATH } from './route';
import styles from './overlay.module.css';

/**
 * "Powiem lekarzowi" from any screen (except the list itself, which has its own form),
 * plus the list opening by itself before a follow-up visit.
 */
export default function TellDoctorOverlay() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  if (pathname === VISIT_PATH) return null;
  // Not over the visit flows (sharing, post-visit, the summary shown to a doctor abroad).
  const inVisitFlow = pathname.startsWith(`${VISIT_PATH}/`);
  return (
    <>
      {!inVisitFlow && <BeforeVisitSheet />}
      <button
        type="button"
        className={styles.fab}
        onClick={() => setOpen(true)}
        aria-label="Powiem lekarzowi"
      >
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
          <path
            d="M4 5h16v10H9l-5 4V5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M12 8v4M10 10h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      {saved && (
        <div className={styles.toast} role="status">
          Dodano do listy na wizytę
        </div>
      )}
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Powiem lekarzowi">
        <NoteForm
          onSaved={() => {
            setOpen(false);
            setSaved(true);
            window.setTimeout(() => setSaved(false), 2500);
          }}
        />
      </BottomSheet>
    </>
  );
}
