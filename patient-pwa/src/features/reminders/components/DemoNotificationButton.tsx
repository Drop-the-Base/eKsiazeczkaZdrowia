import { useState } from 'react';
import { Button } from '../../../ui';
import { showMedicationNotification } from '../reminders';

const RESULT_TEXT = {
  shown: 'Wysłano powiadomienie „Czas na lek” – dotknij go, żeby wrócić tutaj.',
  denied: 'Brak zgody na powiadomienia w przeglądarce.',
  unsupported: 'Ta przeglądarka nie pokazuje powiadomień z aplikacji (zainstaluj PWA w Chrome).',
};

/**
 * Demo przypomnienia: PWA nie zaplanuje powiadomienia bez serwera push, więc na pokazie
 * wywołujemy je przyciskiem. W aplikacji mobilnej: lokalne, zaplanowane powiadomienia.
 */
export function DemoNotificationButton() {
  const [message, setMessage] = useState<string | null>(null);
  return (
    <div>
      <Button
        variant="ghost"
        onClick={() =>
          showMedicationNotification()
            .then((r) => setMessage(RESULT_TEXT[r]))
            .catch(() => setMessage(RESULT_TEXT.unsupported))
        }
      >
        🔔 Pokaż przypomnienie (demo)
      </Button>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
