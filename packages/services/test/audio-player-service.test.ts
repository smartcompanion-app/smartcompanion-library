import { test, expect } from '@jest/globals';
import { Station } from '@smartcompanion/data';
import { AudioPlayerService } from '../src/services/audio-player-service/audio-player-service';

const audioPlayerService = new AudioPlayerService("a subtitle");

const station: Station = {
  id: "test1",
  title: "test1",
  language: "en",
  images: [
    {
      id: "test1-image",
      filename: "test1-image.jpg",
      externalUrl: "http://external.com/test1-image.jpg",
      internalFileUrl: "file://storage/test1-image.jpg"
    }
  ],
  audios: [
    {
      id: "test1-audio1",
      title: "test1-audio1",
      filename: "test1-audio1.mp3",
      externalUrl: "http://external.com/test1-audio1.mp3",
      internalFileUrl: "file://storage/test1-audio1.mp3"
    },
    {
      id: "test1-audio2",
      title: "test1-audio2",
      filename: "test1-audio2.mp3",
      externalUrl: "http://external.com/test1-audio2.mp3",
      internalFileUrl: "file://storage/test1-audio2.mp3"
    }
  ]
};

const stations: Station[] = [
  {
    id: "test1",
    title: "test1",
    language: "en",
    images: [
      {
        id: "test1-image",
        filename: "test1-image.jpg",
        externalUrl: "http://external.com/test1-image.jpg",
        internalFileUrl: "file://storage/test1-image.jpg"
      }
    ],
    audios: [
      {
        id: "test1-audio1",
        title: "test1-audio1",
        filename: "test1-audio1.mp3",
        externalUrl: "http://external.com/test1-audio1.mp3",
        internalFileUrl: "file://storage/test1-audio1.mp3"
      }
    ]
  },
  {
    id: "test2",
    title: "test2",
    language: "en",
    images: [
      {
        id: "test2-image",
        filename: "test2-image.jpg",
        externalUrl: "http://external.com/test2-image.jpg",
        internalFileUrl: "file://storage/test2-image.jpg"
      }
    ],
    audios: [
      {
        id: "test2-audio1",
        title: "test2-audio1",
        filename: "test2-audio1.mp3",
        externalUrl: "http://external.com/test2-audio1.mp3",
        internalFileUrl: "file://storage/test2-audio1.mp3"
      }
    ]
  }
];

test('test get index of id, station of audios', () => {
  audioPlayerService.stations = [station];
  expect(audioPlayerService.getIndex("test1-audio2")).toEqual(1);
});

test('test get index of id, stations with one audio', () => {
  audioPlayerService.stations = stations;
  expect(audioPlayerService.getIndex("test2-audio1")).toEqual(1);
});

test('test get id of index, station of audios', () => {
  audioPlayerService.stations = [station];
  expect(audioPlayerService.getId(1)).toEqual("test1-audio2");
});

test('test get id of index, stations with one audio', () => {
  audioPlayerService.stations = stations;
  expect(audioPlayerService.getId(1)).toEqual("test2-audio1");
});

test('test setting a single station with multiple audios', () => {
  const items = audioPlayerService.getPlayerItems([station]);

  expect(items.length).toEqual(2);
  expect(items).toStrictEqual([
    {
      id: "test1-audio1",
      title: "test1-audio1",
      subtitle: "a subtitle",
      audioUri: "file://storage/test1-audio1.mp3",
      imageUri: "file://storage/test1-image.jpg"
    },
    {
      id: "test1-audio2",
      title: "test1-audio2",
      subtitle: "a subtitle",
      audioUri: "file://storage/test1-audio2.mp3",
      imageUri: "file://storage/test1-image.jpg"
    }
  ]);
});

test('test setting multiple stations', () => {
  const items = audioPlayerService.getPlayerItems(stations);

  expect(items.length).toEqual(2);
  expect(items).toStrictEqual([
    {
      id: "test1-audio1",
      title: "test1-audio1",
      subtitle: "a subtitle",
      audioUri: "file://storage/test1-audio1.mp3",
      imageUri: "file://storage/test1-image.jpg"
    },
    {
      id: "test2-audio1",
      title: "test2-audio1",
      subtitle: "a subtitle",
      audioUri: "file://storage/test2-audio1.mp3",
      imageUri: "file://storage/test2-image.jpg"
    }
  ]);
});
