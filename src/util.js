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
  M: 60804,
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
