import type { ShowMe } from './steps';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Polls for a `data-tour` element: screens render their data a moment after navigation. */
export async function waitForTarget(target: string, timeoutMs = 3000): Promise<HTMLElement | null> {
  const end = Date.now() + timeoutMs;
  for (;;) {
    const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
    if (el || Date.now() > end) return el;
    await sleep(100);
  }
}

/** Sets a React-controlled textarea the way typing does (React listens to the native setter + input). */
function setText(field: HTMLTextAreaElement, text: string): void {
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set?.call(field, text);
  field.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * "Pokaż mi": does what the visitor would do, in the real app. Types the sentence into the voice
 * field (visibly, letter by letter) and sends it; confirms a one-time notice if one appears.
 */
export async function runShowMe(action: ShowMe): Promise<void> {
  if ('press' in action) {
    const button = await waitForTarget(action.press);
    if (!button) throw new Error('Nie znaleziono przycisku na ekranie');
    button.click();
    return;
  }
  const form = await waitForTarget('voice');
  const field = form?.querySelector('textarea');
  if (!(form instanceof HTMLFormElement) || !field)
    throw new Error('Nie znaleziono pola tekstowego');
  field.scrollIntoView({ block: 'center', behavior: 'instant' });
  for (let i = 2; i < action.say.length; i += 2) {
    setText(field, action.say.slice(0, i));
    await sleep(20);
  }
  setText(field, action.say);
  await sleep(350);
  form.requestSubmit();
  const confirm = await waitForTarget('confirm', 800);
  confirm?.click();
}
