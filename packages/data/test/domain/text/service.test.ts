import { expect, test, describe, beforeEach } from '@jest/globals';
import { MemoryStorage } from '../../../src/storage';
import { TextService } from '../../../src/domain';

describe('test text service', () => {

  let memoryStorage = new MemoryStorage();
  let service = new TextService(memoryStorage);

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
    service = new TextService(memoryStorage);
  });

  test('text should return default if no language and no text is available', () => {
    expect(service.getText('TRY_AGAIN')).toEqual('try again');
  });

  test('text should return default if no text is available', () => {
    memoryStorage.set('language', 'xy');
    expect(service.getText('TRY_AGAIN')).toEqual('try again');
  });

  test('text should return translation if available', () => {
    memoryStorage.set('language', 'xy');
    memoryStorage.set('texts-xy-TRY_AGAIN', 'Neu Laden');

    expect(service.getText('TRY_AGAIN')).toEqual('Neu Laden');
  });
});
