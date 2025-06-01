import { expect, test, describe, beforeEach } from '@jest/globals';
import { MemoryStorage } from '../../../src/storage';
import { TextRepository } from '../../../src/data';

describe('test text repository', () => {

    let memoryStorage = new MemoryStorage();
    let repository = new TextRepository(memoryStorage);

    beforeEach(() => {
        memoryStorage = new MemoryStorage();
        repository = new TextRepository(memoryStorage);
    });
  
    test('text should return default if no language and no text is available', () => {
        expect(repository.getText('TRY_AGAIN')).toEqual('try again');
    });

    test('text should return default if no text is available', () => {
        memoryStorage.set('language', 'xy');
        expect(repository.getText('TRY_AGAIN')).toEqual('try again');
    });

    test('text should return translation if available', () => {
        memoryStorage.set('language', 'xy');
        memoryStorage.set('texts-xy-TRY_AGAIN', 'Neu Laden');

        expect(repository.getText('TRY_AGAIN')).toEqual('Neu Laden');
    });

});