import { expect, test, beforeAll } from '@jest/globals';
import { BrowserStorage } from '../src/storage';

const browserStorage = new BrowserStorage();

beforeAll(() => {
  // @ts-ignore:next-line
  globalThis.localStorage = {};
});

test('set json', () => {
  const mockSet = jest.fn();
  globalThis.localStorage.setItem = mockSet;

  browserStorage.set('key', { abc: 'abc' });
  expect(mockSet.mock.calls[0][0]).toEqual('key');
  expect(mockSet.mock.calls[0][1]).toEqual(`json:${JSON.stringify({ abc: 'abc' })}`);
});

test('set number', () => {
  const mockSet = jest.fn();
  globalThis.localStorage.setItem = mockSet;

  browserStorage.set('key', 123);
  expect(mockSet.mock.calls[0][0]).toEqual('key');
  expect(mockSet.mock.calls[0][1]).toEqual(`strg:123`);
});

test('set string', () => {
  const mockSet = jest.fn();
  globalThis.localStorage.setItem = mockSet;

  browserStorage.set('key', '123');
  expect(mockSet.mock.calls[0][0]).toEqual('key');
  expect(mockSet.mock.calls[0][1]).toEqual(`strg:123`);
});

test('get string', () => {
  const mockSet = jest.fn();
  mockSet.mockReturnValueOnce('strg:123');
  globalThis.localStorage.getItem = mockSet;

  const result = browserStorage.get('key');
  expect(mockSet.mock.calls[0][0]).toEqual('key');
  expect(result).toEqual('123');
});

test('get object', () => {
  const mockSet = jest.fn();
  mockSet.mockReturnValueOnce('json:{"abc":123}')
  globalThis.localStorage.getItem = mockSet;

  const result = browserStorage.get('key');
  expect(mockSet.mock.calls[0][0]).toEqual('key');
  expect(result).toEqual({ "abc": 123 });
});

test('get array', () => {
  const mockSet = jest.fn();
  mockSet.mockReturnValueOnce('json:[1,2,3]')
  globalThis.localStorage.getItem = mockSet;

  const result = browserStorage.get('key');
  expect(mockSet.mock.calls[0][0]).toEqual('key');
  expect(result).toEqual([1, 2, 3]);
});

test('get unset key', () => {
  const mockSet = jest.fn();
  mockSet.mockReturnValueOnce(null)
  globalThis.localStorage.getItem = mockSet;

  expect(() => browserStorage.get('key')).toThrow('reading key was a null value');
});
