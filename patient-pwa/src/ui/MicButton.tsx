import styles from './MicButton.module.css';

type Props = {
  listening?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label?: string;
};

export function MicButton({ listening, disabled, onClick, label = 'Mów' }: Props) {
  return (
    <button
      type="button"
      className={[styles.mic, listening && styles.listening].filter(Boolean).join(' ')}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={listening}
      aria-label={listening ? 'Zatrzymaj nagrywanie' : label}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </svg>
    </button>
  );
}
