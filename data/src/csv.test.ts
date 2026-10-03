import { describe, expect, it } from 'vitest';
import { parseCsv } from './csv';

describe('parseCsv', () => {
  it('parses quoted fields with separators, newlines and escaped quotes', () => {
    const text = '﻿"a";"b"\r\n"1;2";"line\nnext"\n"say ""hi""";""\n';
    expect(parseCsv(text)).toEqual([
      ['a', 'b'],
      ['1;2', 'line\nnext'],
      ['say "hi"', ''],
    ]);
  });

  it('handles a last row without trailing newline', () => {
    expect(parseCsv('x;y\n1;2')).toEqual([
      ['x', 'y'],
      ['1', '2'],
    ]);
  });
});
