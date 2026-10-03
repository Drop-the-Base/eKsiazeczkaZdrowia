import type { IsoDateTime } from '@ez/shared';
import { db } from '../../db';
import { waitForTarget } from './showMe';
import type { TourStep } from './steps';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Puts the step's screen back the way the demonstration expects it, so a repeat looks like the
 * first run: no open sheet, the step's screen, its element in view, and nothing left over from
 * the previous run of this step (records it added since `previousRun` are removed).
 */
export async function restoreBaseScreen(
  step: TourStep,
  previousRun: IsoDateTime | undefined,
  /** Router path now (without the `/demo` basename) and how to change it. */
  pathname: string,
  goTo: (path: string) => void,
  targetTop: number,
): Promise<void> {
  document.querySelector<HTMLElement>('[data-tour="sheet-backdrop"]')?.click();

  if (previousRun) {
    const [intakes, notes] = await Promise.all([db.intakes.list(), db.visitNoteItems.list()]);
    await Promise.all([
      ...intakes.filter((i) => i.confirmedAt >= previousRun).map((i) => db.intakes.remove(i.id)),
      ...notes.filter((n) => n.createdAt >= previousRun).map((n) => db.visitNoteItems.remove(n.id)),
    ]);
  }

  if (step.path && pathname !== step.path) goTo(step.path);
  const el = step.target ? await waitForTarget(step.target) : null;
  if (!el) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    window.scrollBy({ top: el.getBoundingClientRect().top - targetTop, behavior: 'smooth' });
  }
  await sleep(500);
}
