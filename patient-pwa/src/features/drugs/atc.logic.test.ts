import { describe, expect, it } from 'vitest';
import { atcGroupName } from './atc.logic';

describe('atcGroupName', () => {
  it('prefers level 2, falls back to level 1', () => {
    expect(atcGroupName('B01AF01')).toBe('Leki przeciwzakrzepowe');
    expect(atcGroupName('l01ea02')).toBe('Leki przeciwnowotworowe');
    expect(atcGroupName('D07AC13')).toBe('Dermatologia');
    expect(atcGroupName('')).toBeUndefined();
  });
});
