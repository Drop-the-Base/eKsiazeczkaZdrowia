import { describe, expect, it } from 'vitest';
import { isEditableTarget, resolveGuideKeyAction } from './guide.logic';

describe('isEditableTarget', () => {
  it('returns false for null or non-element targets', () => {
    expect(isEditableTarget(null)).toBe(false);
    expect(isEditableTarget({} as unknown as EventTarget)).toBe(false);
  });

  it('detects form fields and contenteditable', () => {
    expect(isEditableTarget({ tagName: 'INPUT' } as unknown as EventTarget)).toBe(true);
    expect(isEditableTarget({ tagName: 'TEXTAREA' } as unknown as EventTarget)).toBe(true);
    expect(isEditableTarget({ tagName: 'SELECT' } as unknown as EventTarget)).toBe(true);
    expect(
      isEditableTarget({ tagName: 'DIV', isContentEditable: true } as unknown as EventTarget),
    ).toBe(true);
    expect(isEditableTarget({ tagName: 'DIV' } as unknown as EventTarget)).toBe(false);
  });
});

describe('resolveGuideKeyAction', () => {
  const baseState = {
    open: true,
    stage: 'qr' as const,
    isBusy: false,
    hasQrPayload: true,
    view: 0,
    lastView: false,
  };

  it('returns null if guide is closed or busy', () => {
    expect(resolveGuideKeyAction('ArrowRight', { ...baseState, open: false }, null)).toBeNull();
    expect(resolveGuideKeyAction('ArrowRight', { ...baseState, isBusy: true }, null)).toBeNull();
  });

  it('returns null if target is editable', () => {
    const input = { tagName: 'INPUT' } as unknown as EventTarget;
    expect(resolveGuideKeyAction('ArrowRight', baseState, input)).toBeNull();
  });

  it('handles stage qr', () => {
    expect(resolveGuideKeyAction('ArrowRight', baseState, null)).toBe('simulate');
    expect(
      resolveGuideKeyAction('ArrowRight', { ...baseState, hasQrPayload: false }, null),
    ).toBeNull();
    expect(resolveGuideKeyAction('ArrowLeft', baseState, null)).toBeNull();
  });

  it('handles stage verify', () => {
    const verifyState = { ...baseState, stage: 'verify' as const };
    expect(resolveGuideKeyAction('ArrowRight', verifyState, null)).toBe('confirm');
    expect(resolveGuideKeyAction('ArrowLeft', verifyState, null)).toBeNull();
  });

  it('handles stage view', () => {
    const viewState = { ...baseState, stage: 'view' as const, view: 0, lastView: false };
    expect(resolveGuideKeyAction('ArrowRight', viewState, null)).toBe('nextView');
    expect(resolveGuideKeyAction('ArrowLeft', viewState, null)).toBeNull();

    const viewStateMiddle = { ...baseState, stage: 'view' as const, view: 2, lastView: false };
    expect(resolveGuideKeyAction('ArrowRight', viewStateMiddle, null)).toBe('nextView');
    expect(resolveGuideKeyAction('ArrowLeft', viewStateMiddle, null)).toBe('prevView');

    const viewStateLast = { ...baseState, stage: 'view' as const, view: 5, lastView: true };
    expect(resolveGuideKeyAction('ArrowRight', viewStateLast, null)).toBe('close');
    expect(resolveGuideKeyAction('ArrowLeft', viewStateLast, null)).toBe('prevView');
  });

  it('ignores other keys', () => {
    expect(resolveGuideKeyAction('Enter', baseState, null)).toBeNull();
    expect(resolveGuideKeyAction('Space', baseState, null)).toBeNull();
  });
});
