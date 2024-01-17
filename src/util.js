const DICTIONARY_ENDPOINT = "https://api.dictionaryapi.dev/api/v2/entries/en/"

export const randomAtoZ = () => {
  const HUNDRED_THOUSAND = 100000;
  // Ranges calculated from data found at
  // http://en.wikipedia.org/wiki/Letter_frequency
  var lookup = {
    a: 8167,
    b: 9659,
    c: 12441,
    d: 16694,
    e: 29396,
    f: 31624,
    g: 33639,
    h: 39733,
    i: 46699,
    j: 46852,
    k: 47624,
    l: 51649,
    m: 54055,
    n: 60804,
    o: 68311,
    p: 70240,
    q: 70335,
    r: 76322,
    s: 82649,
    t: 91705,
    u: 94463,
    v: 95441,
    w: 97801,
    x: 97951,
    y: 99925,
    z: HUNDRED_THOUSAND,
  };

  var random = Math.random() * HUNDRED_THOUSAND;
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");

  let result;
  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i];
    if (lookup[letter] > random) {
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

    console.log(responseJson[0]["meanings"][0]["definitions"][0]["definition"]);
    console.log("nikitta!!!!!!");
  } catch (e) {}
};
