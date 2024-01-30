import { BOARD_SIZE } from "./consts";
const DICTIONARY_ENDPOINT = "https://api.dictionaryapi.dev/api/v2/entries/en/"
const HUNDRED_THOUSAND = 100000;

// Ranges calculated from data found at
  // http://en.wikipedia.org/wiki/Letter_frequency
var LETTER_FREQUENCIES = {
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

export const randomAtoZ = () => {
  var random = Math.random() * HUNDRED_THOUSAND;
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  let result;
  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i];
    if (LETTER_FREQUENCIES[letter] > random) {
      result = letter;
      break;
    }
  }
  return result;
};

export const lookUpWord = async (word) => {
  try {
    const resp = await fetch(`${DICTIONARY_ENDPOINT}${word}`);
    const responseJson = await resp.json();
    return responseJson[0]["meanings"][0]["definitions"][0]["definition"];
  } catch (e) {
  }
};

export const createEmptyBoard = () =>{
  const arr = [];
  for(let i = 0; i < BOARD_SIZE; i++){
    arr.push([])
  }
  return arr;
}

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
  // "": 2,
};

export const shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

export const getAllPermutationsOfSizeN = (arr, n) =>{
  const result = [];
  const elemsAndIndices = arr.map((letter, idx) =>{ return {letter, idx}})
  const helper = (selections, leftovers) => {
    if(selections.length === n){
      result.push(selections)
      return;
    }

    for(let i = 0; i < leftovers.length; i++){
      helper([...selections, leftovers[i]], leftovers.slice(0, i).concat(leftovers.slice(i + 1)))
    }
  }

  helper([], elemsAndIndices)
  return result;
}

const tileScoreIdx = {
  ct: [112],
  tw: [0, 7, 14, 105, 119, 210, 217, 224],
  tl: [20, 24, 76, 80, 84, 88, 136, 140, 144, 148, 200, 204],
  dw: [
    16, 28, 32, 42, 48, 56, 64, 70, 154, 160, 168, 176, 182, 192, 196, 208,
  ],
  dl: [
    3, 11, 36, 38, 45, 52, 59, 88, 92, 96, 98, 102, 108, 116, 122, 126, 128,
    132, 165, 172, 179, 186, 188, 213, 221,
  ],
};

const toTileIndex = (row, column) => {
  if (row < BOARD_SIZE && row >= 0 && column < BOARD_SIZE && column >= 0) {
    return row * BOARD_SIZE + column;
  } else {
    return -1;
  }
};

export const getSpecialTileScoreIdx = (i, j) => {
  var ti = toTileIndex(i, j);
  let result = "";
  for (var t in tileScoreIdx) {
    var idx = tileScoreIdx[t].indexOf(ti);
    if (idx >= 0) {
      result = t;
      break;
    }
  }
  return result;
};