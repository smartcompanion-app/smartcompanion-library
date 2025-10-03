import { test, expect } from '@jest/globals';
import { formatSeconds } from '../../src/utils/formatting-utils';

test('formatSeconds formats seconds correctly', () => {
  expect(formatSeconds(0)).toBe('00:00');
  expect(formatSeconds(61)).toBe('01:01');
  expect(formatSeconds(120)).toBe('02:00');
  expect(formatSeconds(3661)).toBe('61:01');
});
