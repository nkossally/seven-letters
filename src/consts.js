export const BOARD_SIZE = 15;
export const HAND_SIZE = 7;
export const DICTIONARY_ENDPOINT =
  "https://api.dictionaryapi.dev/api/v2/entries/en/";
export const HUNDRED_THOUSAND = 100000;
export const MID_IDX = 7;
export const MAX_LETTERS = 7;
export const ANIMATION_DURATION = 2000;

export const LETTER_TO_SCORE = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
  "-": 0,
};

// Ranges calculated from data found at
// http://en.wikipedia.org/wiki/Letter_frequency
export const LETTER_FREQUENCIES = {
  A: 8167,
  B: 9659,
  C: 12441,
  D: 16694,
  E: 29396,
  F: 31624,
  G: 33639,
  H: 39733,
  I: 46699,
  J: 46852,
  K: 47624,
  L: 51649,
  M: 54055,
  N: 60804,
  O: 68311,
  P: 70240,
  Q: 70335,
  R: 76322,
  S: 82649,
  T: 91705,
  U: 94463,
  V: 95441,
  W: 97801,
  X: 97951,
  Y: 99925,
  Z: HUNDRED_THOUSAND,
};

export const DIRS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];

export const LETTER_COUNTS = {
  A: 9,
  B: 2,
  C: 2,
  D: 4,
  E: 12,
  F: 2,
  G: 3,
  H: 2,
  I: 9,
  J: 1,
  K: 1,
  L: 4,
  M: 2,
  N: 6,
  O: 8,
  P: 2,
  Q: 1,
  R: 6,
  S: 4,
  T: 6,
  U: 4,
  V: 2,
  W: 2,
  X: 1,
  Y: 2,
  Z: 1,
  "-": 10,
};