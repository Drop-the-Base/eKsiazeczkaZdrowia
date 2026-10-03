export type GuideStage = 'qr' | 'verify' | 'view';

export type GuideKeyAction = 'simulate' | 'confirm' | 'nextView' | 'close' | 'prevView' | null;

/** True when the keyboard event target is an interactive or editable form field. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== 'object') return false;

  if (typeof HTMLElement !== 'undefined' && target instanceof HTMLElement) {
    return (
      target.isContentEditable ||
      Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
    );
  }

  // Fallback for mocked/node environments
  if ('tagName' in target && typeof (target as { tagName: unknown }).tagName === 'string') {
    const el = target as {
      tagName: string;
      isContentEditable?: boolean;
      closest?: (selector: string) => unknown;
    };
    if (el.isContentEditable) return true;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName.toUpperCase())) return true;
    if (typeof el.closest === 'function') {
      return Boolean(el.closest('input, textarea, select, [contenteditable="true"]'));
    }
  }

  return false;
}

export interface GuideNavState {
  open: boolean;
  stage?: GuideStage;
  isBusy: boolean;
  hasQrPayload: boolean;
  view: number;
  lastView: boolean;
}

export function resolveGuideKeyAction(
  key: string,
  state: GuideNavState,
  target: EventTarget | null,
): GuideKeyAction {
  if (!state.open || !state.stage || state.isBusy) return null;
  if (isEditableTarget(target)) return null;

  if (key === 'ArrowRight') {
    if (state.stage === 'qr') {
      return state.hasQrPayload ? 'simulate' : null;
    }
    if (state.stage === 'verify') {
      return 'confirm';
    }
    if (state.stage === 'view') {
      return state.lastView ? 'close' : 'nextView';
    }
  }

  if (key === 'ArrowLeft') {
    if (state.stage === 'view' && state.view > 0) {
      return 'prevView';
    }
  }

  return null;
}
