import { describe, expect, it } from 'vitest';
import { appendTranscript } from './voice.logic';

describe('appendTranscript', () => {
  it('joins with a single space and ignores empty additions', () => {
    expect(appendTranscript('', ' boli mnie głowa ')).toBe('boli mnie głowa');
    expect(appendTranscript('od rana ', 'boli mnie głowa')).toBe('od rana boli mnie głowa');
    expect(appendTranscript('od rana', '  ')).toBe('od rana');
  });
});
