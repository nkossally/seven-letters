const env = process.env.NODE_ENV
const API_URL = env === "development" ? "" : "https://scrabble-backend.vercel.app";
// const API_URL = ""
console.log("process.env", process.env, "API_URL", API_URL);

export const setUpGame = async () => {
  try {
    const resp = await fetch(API_URL+"/start");
    const json = await resp.json();
    return json;
  } catch {}
};

export const getComputerFirstMove = async (key = "") => {
  try {
    const resp = await fetch(`${API_URL}/get-computer-first-move?key=${key}`);
    const json = await resp.json();
    return json;
  } catch {}
};

export const getBestMove = async (key = "", boardValues, hand, computerHand, lettersLeft) => {
    try {
      const resp = await fetch(API_URL + "/get-best-move", {
        method: "POST",
        body: JSON.stringify({
          board_values: boardValues,
          key,
          hand,
          computer_hand: computerHand,
          tile_bag: lettersLeft
        }),
        headers: {
          "Content-type": "application/json",
        },
      });
      const json = await resp.json();
      return json;
    } catch {}
  };

  export const insertTilesInBackend = async (
    lettersAndCoordinates,
    key = "",
    maxWord,
    startRow,
    startCol,
    isVertical,
    hand, 
    computerHand,
    lettersLeft,
    boardValues,
  ) => {
    console.log("insertTilesInBackend");
    try {
      const resp = await fetch(API_URL + "/insert-letters", {
        method: "POST",
        body: JSON.stringify({
          letters_and_coordinates: lettersAndCoordinates,
          key,
          max_word: maxWord,
          start_row: startRow,
          start_col: startCol,
          is_vertical: isVertical,
          hand,
          computer_hand: computerHand,
          tile_bag: lettersLeft,
          board_values: boardValues
        }),
        headers: {
          "Content-type": "application/json",
        },
      });
      const json = await resp.json();
      console.log("resp in fetch", json);
      return json;
    } catch {}
  };

  export const dumpLetters = async (letters, key = "",  hand, computerHand, lettersLeft, boardValues) => {
    try {
      const resp = await fetch(API_URL + "/dump-letters", {
        method: "POST",
        body: JSON.stringify({ 
          letters, 
          key,
          hand,
          computer_hand: computerHand,
          tile_bag: lettersLeft,
          board_values: boardValues
         }),
        headers: {
          "Content-type": "application/json",
        },
      });
      const json = await resp.json();
      return json;
    } catch {}
  };
  