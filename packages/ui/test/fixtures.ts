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
      { id: 'crocodileaudio', filename: 'crocodile.mp3', title: 'Crocodile Audio', duration: 94, internalWebUrl: 'station-assets/crocodile.mp3', internalFileUrl: 'station-assets/crocodile.mp3', externalUrl: '' }
    ],
    images: [
      { id: 'crocodile', filename: 'crocodile.jpg', internalWebUrl: 'station-assets/crocodile.jpg', internalFileUrl: 'station-assets/crocodile.jpg', externalUrl: '' },
      { id: 'crocodile', filename: 'crocodile.jpg', internalWebUrl: 'station-assets/crocodile.jpg', internalFileUrl: 'station-assets/crocodile.jpg', externalUrl: '' }
    ],
    description: 'The crocodile is a large aquatic reptile that lives throughout the tropics in Africa, Asia, the Americas and Australia. Crocodiles tend to congregate in freshwater habitats like rivers, lakes, wetlands and sometimes in brackish water.'
  },
  {
    id: '2',
    number: '2',
    language: 'en',
    title: 'Station 2',
    subtitle: 'Elephant',
    collectedPercentage: 0.55,
    audios: [
      { id: 'elephantaudio', filename: 'elephant.mp3', title: 'Elephant Audio', duration: 124, internalWebUrl: 'station-assets/elephant.mp3', internalFileUrl: 'station-assets/elephant.mp3', externalUrl: '' }
    ],
    images: [
      { id: 'elephant', filename: 'elephant.jpg', internalWebUrl: 'station-assets/elephant.jpg', internalFileUrl: 'station-assets/elephant.jpg', externalUrl: '' },
      { id: 'elephant', filename: 'elephant.jpg', internalWebUrl: 'station-assets/elephant.jpg', internalFileUrl: 'station-assets/elephant.jpg', externalUrl: '' }
    ],
    description: 'The elephant is the largest land animal on Earth, known for its intelligence, social behavior, and strong family bonds. Elephants are found in various habitats, including savannas, forests, and grasslands.'
  },
  {
    id: '3',
    number: '3',
    language: 'en',
    title: 'Station 3',
    subtitle: 'Leopard',
    collectedPercentage: 0.35,
    audios: [
      { id: 'leopardaudio', filename: 'leopard.mp3', title: 'Leopard Audio', duration: 64, internalWebUrl: 'station-assets/leopard.mp3', internalFileUrl: 'station-assets/leopard.mp3', externalUrl: '' }
    ],
    images: [
      { id: 'leopard', filename: 'leopard.jpg', internalWebUrl: 'station-assets/leopard.jpg', internalFileUrl: 'station-assets/leopard.jpg', externalUrl: '' },
      { id: 'leopard', filename: 'leopard.jpg', internalWebUrl: 'station-assets/leopard.jpg', internalFileUrl: 'station-assets/leopard.jpg', externalUrl: '' }
    ],
    description: 'The leopard is a large feline species found in various habitats, including savannas, forests, and mountains. Known for their agility and strength, leopards are skilled hunters and are primarily nocturnal.'
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

export const getMultiAudioStation = (): Station => {
  const station: Station = stations[0];
  station.audios = [
    ...(stations[0].audios as string[]),
    ...(stations[1].audios as string[]),
    ...(stations[2].audios as string[])
  ];
  return station;
};
