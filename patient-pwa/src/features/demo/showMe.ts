import type { ShowMe } from './steps';
import styles from './DemoTour.module.css';

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
 * Shows an animated cursor ripple on `el` (its center, or `at` when the center is covered by
 * something else), clicks it, then waits for the animation to finish before returning.
 */
async function clickWithEffect(el: HTMLElement, at?: { x: number; y: number }): Promise<void> {
  const rect = el.getBoundingClientRect();
  const cx = at?.x ?? rect.left + rect.width / 2;
  const cy = at?.y ?? rect.top + rect.height / 2;
  const dot = document.createElement('div');
  dot.className = styles.clickDot ?? '';
  dot.style.left = `${cx}px`;
  dot.style.top = `${cy}px`;
  document.body.appendChild(dot);
  await sleep(80); // small pause so the dot is visible before the click fires
  el.click();
  await sleep(550); // wait for animation to finish
  dot.remove();
}

function animateZoom(el: HTMLElement, from: number, to: number, durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / durationMs);
      // Smooth ease-in-out curve
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const cur = from + (to - from) * ease;
      el.dispatchEvent(new CustomEvent('timeline:zoom', { detail: { zoom: cur } }));
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    };
    requestAnimationFrame(step);
  });
}

/**
 * "Pokaż mi": does what the visitor would do, in the real app. Types the sentence into the voice
 * field (visibly, letter by letter) and sends it; confirms a one-time notice if one appears.
 */
export async function runShowMe(action: ShowMe): Promise<void> {
  if ('action' in action) {
    if (action.action === 'timeline-zoom-scroll') {
      const scroller = await waitForTarget('timeline-scroller');
      if (!scroller) throw new Error('Nie znaleziono osi czasu');

      // 1. Płynne przybliżenie (zoom in)
      await animateZoom(scroller, 1, 2.2, 1200);
      await sleep(400);

      // 2. Płynne przewinięcie w lewo
      const scrollDistance = Math.min(350, Math.max(160, scroller.clientWidth * 0.7));
      scroller.scrollBy({ left: -scrollDistance, behavior: 'smooth' });
      await sleep(1300);

      // 3. Płynne przewinięcie w prawo
      scroller.scrollBy({ left: scrollDistance, behavior: 'smooth' });
      await sleep(1300);

      // 4. Pauza przed oddaleniem
      await sleep(400);

      // 5. Płynne oddalenie (zoom out) do pełnego dopasowania
      await animateZoom(scroller, 2.2, 1, 1100);
      await sleep(300);
      return;
    }

    if (action.action === 'meds-detail') {
      // The lit supplements group: open the mushroom supplement, the hero of the story.
      const group = await waitForTarget('supplements');
      const rows = [...(group?.querySelectorAll<HTMLButtonElement>('li button') ?? [])];
      const supplement = rows.find((b) => /grzyb/i.test(b.textContent ?? '')) ?? rows[0];
      if (!supplement) throw new Error('Nie znaleziono suplementów');
      supplement.scrollIntoView({ block: 'center', behavior: 'smooth' });
      await sleep(400);
      await clickWithEffect(supplement);
      await sleep(3000);
      // Closed the way a person would: a tap on the grey area above the sheet, not on the sheet.
      const backdrop = await waitForTarget('sheet-backdrop');
      if (backdrop) {
        const sheetTop = backdrop.querySelector('[role="dialog"]')?.getBoundingClientRect().top;
        await clickWithEffect(backdrop, { x: window.innerWidth / 2, y: (sheetTop ?? 120) / 2 });
      }
      await sleep(400);
      return;
    }

    if (action.action === 'today-confirm') {
      // One dose taken, the next one skipped, then the as-needed painkiller taken now.
      // Each click re-renders the list, so the next button is looked up afresh.
      const steps = ['dose-take', 'dose-skip', 'as-needed-take'];
      let clicked = 0;
      for (const target of steps) {
        const btn = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
        if (!btn) continue;
        btn.scrollIntoView({ block: 'center', behavior: 'smooth' });
        await sleep(500);
        await clickWithEffect(btn);
        await sleep(700);
        clicked++;
      }
      if (clicked === 0) throw new Error('Nie znaleziono dawek na dziś');
      await sleep(800);
      return;
    }

    if (action.action === 'abroad-es') {
      const esBtn = await waitForTarget('lang-es');
      if (!esBtn) throw new Error('Nie znaleziono wyboru języka');
      // Spanish may be remembered from before: switch away first, so the change is visible.
      if (esBtn.getAttribute('aria-pressed') === 'true') {
        const other = await waitForTarget('lang-en');
        if (other) {
          await clickWithEffect(other);
          await sleep(900);
        }
      }
      await clickWithEffect(esBtn);
      // Long enough to read the hint; then the light moves to the translated medicines.
      await sleep(2200);
      return;
    }

    if (action.action === 'security-fill') {
      const fillBtn = await waitForTarget('demo-fill-pin');
      if (!fillBtn) throw new Error('Nie znaleziono przycisku uzupełnienia PIN');
      fillBtn.scrollIntoView({ block: 'center', behavior: 'smooth' });
      await sleep(400);
      await clickWithEffect(fillBtn);
      await sleep(1500);
      return;
    }
    return;
  }
  if ('press' in action) {
    const button = await waitForTarget(action.press);
    if (!button) throw new Error('Nie znaleziono przycisku na ekranie');
    await clickWithEffect(button);
    return;
  }
  if ('say' in action) {
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
    if (confirm) {
      await sleep(1800); // time to read what is sent (the notice text)
      await clickWithEffect(confirm);
    }
  }
}
