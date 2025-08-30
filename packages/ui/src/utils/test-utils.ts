import { Station, Tour } from "@smartcompanion/data";

export const stations: Station[] = [
  {
    id: '1',
    number: '1',
    language: 'en',
    title: 'Station 1',
    subtitle: 'Crocodile',
    collectedPercentage: 0.25,
    audios: [
      { id: 'crocodileaudio', filename: 'crocodile.mp3', internalWebUrl: 'station-assets/crocodile.mp3', internalFileUrl: 'station-assets/crocodile.mp3', externalUrl: '' }
    ],
    images: [
      { id: 'crocodile', filename: 'crocodile.jpg', internalWebUrl: 'station-assets/crocodile.jpg', internalFileUrl: 'station-assets/crocodile.jpg', externalUrl: '' },
      { id: 'crocodile', filename: 'crocodile.jpg', internalWebUrl: 'station-assets/crocodile.jpg', internalFileUrl: 'station-assets/crocodile.jpg', externalUrl: '' }
    ]
  },
  {
    id: '2',
    number: '2',
    language: 'en',
    title: 'Station 2',
    subtitle: 'Elephant',
    collectedPercentage: 0.55,
    audios: [
      { id: 'elephantaudio', filename: 'elephant.mp3', internalWebUrl: 'station-assets/elephant.mp3', internalFileUrl: 'station-assets/elephant.mp3', externalUrl: '' }
    ],
    images: [
      { id: 'elephant', filename: 'elephant.jpg', internalWebUrl: 'station-assets/elephant.jpg', internalFileUrl: 'station-assets/elephant.jpg', externalUrl: '' },
      { id: 'elephant', filename: 'elephant.jpg', internalWebUrl: 'station-assets/elephant.jpg', internalFileUrl: 'station-assets/elephant.jpg', externalUrl: '' }
    ]
  },
  {
    id: '3',
    number: '3',
    language: 'en',
    title: 'Station 3',
    subtitle: 'Leopard',
    collectedPercentage: 0.35,
    audios: [
      { id: 'leopardaudio', filename: 'leopard.mp3', internalWebUrl: 'station-assets/leopard.mp3', internalFileUrl: 'station-assets/leopard.mp3', externalUrl: '' }
    ],
    images: [
      { id: 'leopard', filename: 'leopard.jpg', internalWebUrl: 'station-assets/leopard.jpg', internalFileUrl: 'station-assets/leopard.jpg', externalUrl: '' },
      { id: 'leopard', filename: 'leopard.jpg', internalWebUrl: 'station-assets/leopard.jpg', internalFileUrl: 'station-assets/leopard.jpg', externalUrl: '' }
    ]
  },
];

export const tours: Tour[] = [
  {
    id: '1',
    title: 'Tour 1',
    description: 'Dangerous Crocodile Tour',
    duration: '30 min',
    language: 'en',
    default: true,
    images: [
      { id: 'crocodile', filename: 'crocodile.jpg', internalWebUrl: 'station-assets/crocodile.jpg', internalFileUrl: 'station-assets/crocodile.jpg', externalUrl: '' },
    ],
    stations: []
  },
  {
    id: '2',
    title: 'Tour 2',
    description: 'Majestic Elephant Tour',
    language: 'en',
    default: false,
    duration: '45 min',
    images: [
      { id: 'elephant', filename: 'elephant.jpg', internalWebUrl: 'station-assets/elephant.jpg', internalFileUrl: 'station-assets/elephant.jpg', externalUrl: '' },
    ],
    stations: []
  }
];
