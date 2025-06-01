import { expect, test } from '@jest/globals';
import { FileMatcher } from '../../src/file';

const fileMatcher = new FileMatcher();

test('get files to remove 1', () => {
    expect(
        fileMatcher.getFilesToRemove(['a', 'b', 'c'], ['b', 'c', 'd'])
    ).toEqual(['a']);
});

test('get files to remove 2', () => {
    expect(
        fileMatcher.getFilesToRemove(['a', 'b', 'c'], ['a', 'b', 'c', 'd'])
    ).toEqual([]);
});

test('get files to download 1', () => {
    expect(
        fileMatcher.getFilesToDownload(['a', 'b', 'c'], ['a', 'b', 'c', 'd', 'e'])
    ).toEqual(['d', 'e']);
});

test('get files to download 2', () => {
    expect(
        fileMatcher.getFilesToDownload(['a', 'b', 'c'], ['a', 'b'])
    ).toEqual([]);
});

test('match files', () => {
    expect(
        fileMatcher.match(['a', 'b', 'c', 'f'], ['a', 'b', 'c', 'd', 'e'])
    ).toEqual({
        "remove": ['f'],
        "download": ['d', 'e']
    });
})