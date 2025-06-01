import { expect, test, describe } from '@jest/globals';
import { FileUpdater, File } from '../../src/file';
import { MemoryStorage, Storage } from '../../src/storage';

describe('test file updater', () => {
    let fileUpdater: FileUpdater;
    let downloadFn: jest.Mock;
    let removeFn: jest.Mock;
    let saveFn: jest.Mock;
    let listFn: jest.Mock;
    let progressFn: jest.Mock;
    let memoryStorage: Storage;

    beforeEach(() => {
        downloadFn = jest.fn();
        removeFn = jest.fn();
        saveFn = jest.fn();
        listFn = jest.fn();
        progressFn = jest.fn();
        memoryStorage = new MemoryStorage();

        fileUpdater = new FileUpdater(
            downloadFn,
            removeFn,
            saveFn,
            listFn,
            progressFn,
            memoryStorage
        );
    });

    test('should download and save files', async () => {
        const files: File[] = [
            { filename: 'a.png', externalUrl: 'http://somewhere.com/a.png' },
            { filename: 'b.png', externalUrl: 'http://somewhere.com/b.png' },
            { filename: 'c.png', externalUrl: 'http://somewhere.com/c.png' },
        ];

        downloadFn
            .mockReturnValueOnce('a_file_data')
            .mockReturnValueOnce('b_file_data')
            .mockReturnValueOnce('c_file_data');

        await fileUpdater.downloadFiles(files);

        // download files
        expect(downloadFn.mock.calls.length).toEqual(3);
        expect(downloadFn.mock.calls[0][0]).toEqual('http://somewhere.com/a.png');
        expect(downloadFn.mock.calls[1][0]).toEqual('http://somewhere.com/b.png');
        expect(downloadFn.mock.calls[2][0]).toEqual('http://somewhere.com/c.png');

        // save files
        expect(saveFn.mock.calls.length).toEqual(3);
        expect(saveFn.mock.calls[0][0]).toEqual('a.png');
        expect(saveFn.mock.calls[0][1]).toEqual('a_file_data');
        expect(saveFn.mock.calls[1][0]).toEqual('b.png');
        expect(saveFn.mock.calls[1][1]).toEqual('b_file_data');
        expect(saveFn.mock.calls[2][0]).toEqual('c.png');
        expect(saveFn.mock.calls[2][1]).toEqual('c_file_data');

        // progress
        expect(progressFn.mock.calls.length).toEqual(3);       
        expect(progressFn.mock.calls[0][0]).toEqual(33);
        expect(progressFn.mock.calls[1][0]).toEqual(66);
        expect(progressFn.mock.calls[2][0]).toEqual(100);
    });

    test('should download 2 files and remove 1 file', async () => {
        const oldFiles = ['c.png', 'e.png'];
        const newFiles: File[] = [
            { filename: 'a.png', externalUrl: 'http://somewhere.com/a.png' },
            { filename: 'b.png', externalUrl: 'http://somewhere.com/b.png' },
            { filename: 'c.png', externalUrl: 'http://somewhere.com/c.png' },
        ];

        listFn.mockReturnValueOnce(oldFiles);
        downloadFn.mockReturnValue('content');

        await fileUpdater.update(newFiles);

        expect(listFn.mock.calls.length).toEqual(1);
        expect(downloadFn.mock.calls.length).toEqual(2);
        expect(saveFn.mock.calls.length).toEqual(2);
        expect(progressFn.mock.calls.length).toEqual(2);
        expect(removeFn.mock.calls.length).toEqual(1);
    });

    test('should download 0 files and remove 0 files and trigger 0 progress calls', async () => {
        const oldFiles = ['a.png', 'b.png', 'c.png'];
        const newFiles: File[] = [
            { filename: 'a.png', externalUrl: 'http://somewhere.com/a.png' },
            { filename: 'b.png', externalUrl: 'http://somewhere.com/b.png' },
            { filename: 'c.png', externalUrl: 'http://somewhere.com/c.png' },
        ];

        listFn.mockReturnValueOnce(oldFiles);

        await fileUpdater.update(newFiles);

        expect(listFn.mock.calls.length).toEqual(1);
        expect(downloadFn.mock.calls.length).toEqual(0);
        expect(saveFn.mock.calls.length).toEqual(0);
        expect(progressFn.mock.calls.length).toEqual(0);
        expect(removeFn.mock.calls.length).toEqual(0);
    });
});
