import {
  BOARD_SIZE,
  LETTER_TO_SCORE,
  DICTIONARY_ENDPOINT,
  HUNDRED_THOUSAND,
  MID_IDX,
  MAX_LETTERS,
  ANIMATION_DURATION,
  LETTER_FREQUENCIES,
  DIRS,
  LETTER_COUNTS,
} from "./consts";
import { removeDumpSelections } from "./reducers/selectedForDumpingHandIndicesSlice";
import { modifyHand } from "./reducers/handSlice";
import { modifyComputerHand } from "./reducers/computerHandSlice";
import { modifyLettersLeft } from "./reducers/lettersLeftSlice";
import { updateScore } from "./reducers/scoreSlice";
import { updateComputerScore } from "./reducers/computerScoreSlice";
import {
  addLetterToBoard,
  removeLetterFromBoard,
} from "./reducers/boardValuesSlice";
import { removeTempLetterFromBoard } from "./reducers/tempBoardValuesSlice";
import { setIsComputersTurn } from "./reducers/isComputersTurn.slice";
import { setResolvedWord } from "./reducers/resolvedWordSlice";
import {
  addZeroCoordinates,
  resetZeroPointCoordinates,
} from "./reducers/zeroPointCoordinatesSlice";

let blankTileLetters = [];

// Deprecated. No longer using this endpoint.
export const lookUpWord = async (word) => {
  try {
    const resp = await fetch(`${DICTIONARY_ENDPOINT}${word}`);
    const responseJson = await resp.json();
    return responseJson[0]["meanings"][0]["definitions"][0]["definition"];
  } catch (e) {}
};

const shuffle = (array) => {
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

const getAllPermutationsOfSizeN = (arr, n) => {
  const result = [];
  const elemsAndIndices = arr.map((letter, idx) => {
    return { letter, idx };
  });
  const helper = (selections, leftovers) => {
    if (selections.length === n) {
      result.push(selections);
      return;
    }

    for (let i = 0; i < leftovers.length; i++) {
      helper(
        [...selections, leftovers[i]],
        leftovers.slice(0, i).concat(leftovers.slice(i + 1))
      );
    }
  };

  helper([], elemsAndIndices);
  return result;
};

const tileScoreIdx = {
  ct: [112],
  tw: [0, 7, 14, 105, 119, 210, 217, 224],
  tl: [20, 24, 76, 80, 84, 88, 136, 140, 144, 148, 200, 204],
  dw: [16, 28, 32, 42, 48, 56, 64, 70, 154, 160, 168, 176, 182, 192, 196, 208],
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

export const pass =
  (dispatch, setIsComputersTurn, hand, tempBoardValues) => () => {
    dispatch(removeDumpSelections());
    removeAllTempLetters(
      /** putBackInHand */ true,
      dispatch,
      hand,
      tempBoardValues
    );
    dispatch(setIsComputersTurn(true));
  };

export const startGame = (dispatch, hand, boardValues, tempBoardValues) => {
  let letters = [];
  Object.keys(LETTER_COUNTS).forEach((letter) => {
    for (let i = 0; i < LETTER_COUNTS[letter]; i++) {
      letters.push(letter);
    }
  });
  letters = shuffle(letters);
  removeAllTempLetters(
    /** putBackInHand */ false,
    dispatch,
    hand,
    tempBoardValues
  );
  removeAllLetters(dispatch, boardValues);
  dispatch(modifyHand(letters.slice(0, 7)));
  dispatch(modifyComputerHand(letters.slice(7, 14)));
  dispatch(modifyLettersLeft(letters.slice(14)));
  dispatch(updateComputerScore(0));
  dispatch(updateScore(0));
  dispatch(resetZeroPointCoordinates());
};

const buildEmptyBoard = () => {
  const arr = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    arr.push([]);
  }
  return arr;
};

const handleSetInvalidWords = (text, setInvalidWords) => {
  setInvalidWords(text);
  setTimeout(() => {
    setInvalidWords("");
  }, ANIMATION_DURATION);
};

export const submitWord =
 (
    virtualBoard,
    indices,
    setInvalidWords,
    dispatch,
    isComputersTurn,
    setSelectedComputerTiles,
    setIsComputersTurn,
    localDictionary,
    computerScore,
    playerScore,
    computerHand,
    lettersLeft,
    hand,
    boardValues,
    tempBoardValues,
    zeroPointCoordinates
  ) =>
  async () => {
    dispatch(removeDumpSelections());
    const lettersOnBoard = getPermanentlyPlacedLetters(boardValues);
    const isFirstPlay = lettersOnBoard.length === 0;

    const rowsAndCols = getPlacedLettersRowsAndCols(
      virtualBoard,
      tempBoardValues
    );

    let rows = rowsAndCols.rows;
    let cols = rowsAndCols.cols;

    if (rows.length === 0 && cols.length === 0) {
      handleSetInvalidWords(
        "Place letters on the board to form a word.",
        setInvalidWords
      );
      return;
    }
    if (rows.length > 1 && cols.length > 1) {
      handleSetInvalidWords(
        "Letters should be in same row or column.",
        setInvalidWords
      );
      return;
    }
    if (
      !getIsContinuousWord(
        rows,
        cols,
        virtualBoard,
        boardValues,
        tempBoardValues
      )
    ) {
      handleSetInvalidWords(
        "Letters must form a continuous word.",
        setInvalidWords
      );
      return;
    }
    if (!isFirstPlay && !getIsConnectedToPrevWord(rows, cols, boardValues)) {
      handleSetInvalidWords(
        "Words must connect to previous words.",
        setInvalidWords
      );
      return;
    }
    if (isFirstPlay && (!rows.includes(MID_IDX) || !cols.includes(MID_IDX))) {
      handleSetInvalidWords(
        "First word must have a tile in the center of board.",
        setInvalidWords
      );
      return;
    }

    const allWordsInDict = checkAllWordsOnBoard(
      virtualBoard,
      localDictionary,
      dispatch,
      computerScore,
      playerScore,
      boardValues,
      tempBoardValues,
      zeroPointCoordinates
    );

    if (isComputersTurn) {
      if (allWordsInDict) {
        setSelectedComputerTiles(indices);
        await delay(1000);
        permanentlyPlaceLetters(
          virtualBoard,
          computerHand,
          dispatch,
          lettersLeft,
          hand,
          tempBoardValues
        );
        dispatch(setIsComputersTurn(false));
        setSelectedComputerTiles([]);
        return true;
      } else {
        dispatch(setIsComputersTurn(false));
        return false;
      }
    } else {
      if (allWordsInDict) {
         permanentlyPlaceLetters(
          virtualBoard,
          computerHand,
          dispatch,
          lettersLeft,
          hand,
          tempBoardValues
        );
        await delay(100);
        dispatch(setIsComputersTurn(true));
      } else {
        handleSetInvalidWords(
          "Word(s) not found in dictionary.",
          setInvalidWords
        );
      }
    }
  };

const checkAllWordsOnBoard = (
  virtualBoard,
  localDictionary,
  dispatch,
  computerScore,
  playerScore,
  boardValues,
  tempBoardValues,
  zeroPointCoordinates
) => {
  const rowsAndCols = getPlacedLettersRowsAndCols(
    virtualBoard,
    tempBoardValues
  );
  let rows = rowsAndCols.rows;
  let cols = rowsAndCols.cols;
  let score = 0;

  let word = "";
  let maxWordLength = 0;
  let allWordsInDict = true;
  // if the word is vertical
  if (rows.length > 1) {
    const col = cols[0];
    const wordAndScore = getVerticalWordAtCoordinate(
      rows[0],
      col,
      virtualBoard,
      boardValues,
      tempBoardValues,
      zeroPointCoordinates
    );
    word = wordAndScore.word;
    maxWordLength = Math.max(maxWordLength, word.length);
    if (word.length > 1) {
      score += wordAndScore.wordScore;
      const isValidWord = getIsValidWord(word, localDictionary);
      if (!isValidWord) allWordsInDict = false;
    }
    // check if any of the letters in a vertical word adjoin an already placed horizontal words.
    rows.forEach((row) => {
      const wordAndScore = getHorizontalWordAtCoordinate(
        row,
        col,
        virtualBoard,
        boardValues,
        tempBoardValues,
        zeroPointCoordinates
      );
      if (wordAndScore) {
        const word = wordAndScore.word;
        maxWordLength = Math.max(maxWordLength, word.length);
        if (word.length > 1) {
          score += wordAndScore.wordScore;
          const isValidWord = getIsValidWord(word, localDictionary);
          if (!isValidWord) allWordsInDict = false;
        }
      }
    });
  } else {
    // word is horizontal
    const row = rows[0];
    const wordAndScore = getHorizontalWordAtCoordinate(
      row,
      cols[0],
      virtualBoard,
      boardValues,
      tempBoardValues,
      zeroPointCoordinates
    );
    word = wordAndScore.word;
    maxWordLength = Math.max(maxWordLength, word.length);
    if (word.length > 1) {
      score += wordAndScore.wordScore;
      const isValidWord = getIsValidWord(word, localDictionary);

      if (!isValidWord) allWordsInDict = false;
    }
    cols.forEach((col) => {
      const wordAndScore = getVerticalWordAtCoordinate(
        row,
        col,
        virtualBoard,
        boardValues,
        tempBoardValues,
        zeroPointCoordinates
      );
      if (wordAndScore) {
        const word = wordAndScore.word;
        maxWordLength = Math.max(maxWordLength, word.length);
        if (word.length > 1) {
          const isValidWord = getIsValidWord(word, localDictionary);
          score += wordAndScore.wordScore;
          if (!isValidWord) allWordsInDict = false;
        }
      }
    });
  }
  // don't submit any one letter words
  if (maxWordLength < 2) return false;
  if (allWordsInDict) {
    const tempLetterArr = getAllTempLetters(virtualBoard, tempBoardValues);
    const maybeFifty = tempLetterArr.length === 7 ? 50 : 0;
    if (virtualBoard) {
      dispatch(updateComputerScore(computerScore + score + maybeFifty));
    } else {
      dispatch(updateScore(playerScore + score + maybeFifty));
    }
  }

  return allWordsInDict;
};

const permanentlyPlaceLetters = (
  virtualBoard,
  computerHand,
  dispatch,
  lettersLeft,
  hand,
  tempBoardValues
) => {
  let wordSoFar = "";
  let letterCount = 0;
  const computerHandCopy = Array.from(computerHand);
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      let letter =
        getTempLetterAtCoordinate(i, j, tempBoardValues) ||
        getTempLetterOnVirtualBoard(i, j, virtualBoard);
      if (letter === "-") {
        letter = blankTileLetters.shift();
        dispatch(addZeroCoordinates(JSON.stringify([i, j])));
      }
      if (letter) {
        wordSoFar += letter;
        dispatch(addLetterToBoard({ row: i, col: j, letter }));
        letterCount++;
        if (virtualBoard) {
          const k = computerHandCopy.indexOf(letter);
          computerHandCopy.splice(k, 1);
          dispatch(
            modifyComputerHand(
              computerHand.slice(0, k).concat(computerHand.slice(k + 1))
            )
          );
        } else {
          dispatch(removeTempLetterFromBoard({ row: i, col: j }));
        }
      }
    }
  }

  if (virtualBoard) {
    dispatch(
      modifyComputerHand(
        computerHandCopy.concat(lettersLeft.slice(0, letterCount))
      )
    );
  } else {
    dispatch(modifyHand(hand.concat(lettersLeft.slice(0, letterCount))));
  }
  dispatch(modifyLettersLeft(lettersLeft.slice(letterCount)));
};

const removeAllTempLetters = (
  putBackInHand,
  dispatch,
  hand,
  tempBoardValues
) => {
  const tempLetters = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const letter = getTempLetterAtCoordinate(i, j, tempBoardValues);
      if (letter) {
        tempLetters.push(letter);
        dispatch(removeTempLetterFromBoard({ row: i, col: j }));
      }
    }
  }
  if (putBackInHand) {
    dispatch(modifyHand(hand.concat(tempLetters)));
  }
};

const removeAllLetters = (dispatch, boardValues) => {
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (getLetterAtCoordinate(i, j, boardValues)) {
        dispatch(removeLetterFromBoard({ row: i, col: j }));
      }
    }
  }
};

const getPlacedLettersRowsAndCols = (virtualBoard, tempBoardValues) => {
  const rows = new Set();
  const cols = new Set();
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (getTempLetterOnVirtualBoard(i, j, virtualBoard)) {
        rows.add(i);
        cols.add(j);
      } else if (getTempLetterAtCoordinate(i, j, tempBoardValues)) {
        rows.add(i);
        cols.add(j);
      }
    }
  }
  const rowsArr = Array.from(rows).sort((a, b) => a - b);
  const colsArr = Array.from(cols).sort((a, b) => a - b);

  return { rows: rowsArr, cols: colsArr };
};

const getIsContinuousWord = (
  rows,
  cols,
  virtualBoard,
  boardValues,
  tempBoardValues
) => {
  if (rows.length === 1 && cols.length === 1) return true;
  let dx = 0;
  let dy = 0;
  let dist;
  let result = true;
  if (rows.length > 1) {
    dx = 1;
    dist = rows[rows.length - 1] - rows[0];
  } else {
    dy = 1;
    dist = cols[cols.length - 1] - cols[0];
  }
  let x = rows[0];
  let y = cols[0];

  for (let i = 0; i < dist; i++) {
    x += dx;
    y += dy;
    if (
      !getLetterAtCoordinate(x, y, boardValues) &&
      !getTempLetterAtCoordinate(x, y, tempBoardValues) &&
      !getTempLetterOnVirtualBoard(x, y, virtualBoard)
    ) {
      result = false;
      break;
    }
  }
  return result;
};

const getLetterAtCoordinate = (x, y, boardValues) => {
  if (!boardValues) return;
  return isOnBoard(x, y) ? boardValues[x][y] : undefined;
};

const getTempLetterAtCoordinate = (x, y, tempBoardValues) => {
  if (!tempBoardValues) return;
  return isOnBoard(x, y) ? tempBoardValues[x][y] : undefined;
};

const getTempLetterOnVirtualBoard = (x, y, virtualBoard) => {
  if (!virtualBoard) return;
  if (!virtualBoard[x]) return;
  return isOnBoard(x, y) ? virtualBoard[x][y] : undefined;
};

const getIsConnectedToPrevWord = (rows, cols, boardValues) => {
  let result = false;
  if (rows.length > 1) {
    const col = cols[0];
    rows.forEach((row) => {
      if (getAdjacentToPlacedLetter(row, col, boardValues)) {
        result = true;
      }
    });
  } else {
    const row = rows[0];
    cols.forEach((col) => {
      if (getAdjacentToPlacedLetter(row, col, boardValues)) {
        result = true;
      }
    });
  }
  return result;
};

const getAdjacentToPlacedLetter = (x, y, boardValues) => {
  let result = false;
  DIRS.forEach((dir) => {
    const x1 = x + dir[0];
    const y1 = y + dir[1];
    if (isOnBoard(x1, y1) && getLetterAtCoordinate(x1, y1, boardValues)) {
      result = true;
    }
  });
  return result;
};

const isOnBoard = (x, y) => {
  return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
};

const getVerticalWordAtCoordinate = (
  x,
  y,
  virtualBoard,
  boardValues,
  tempBoardValues,
  zeroPointCoordinates
) => {
  let currX = x;
  let word = "";
  let wordScore = 0;
  let multiplier = 1;
  while (
    getTempLetterAtCoordinate(currX, y, tempBoardValues) ||
    getLetterAtCoordinate(currX, y, boardValues) ||
    getTempLetterOnVirtualBoard(currX, y, virtualBoard)
  ) {
    word +=
      getTempLetterAtCoordinate(currX, y, tempBoardValues) ||
      getLetterAtCoordinate(currX, y, boardValues) ||
      getTempLetterOnVirtualBoard(currX, y, virtualBoard);
    const letterScoreObj = calculateScoreFromLetter(
      currX,
      y,
      virtualBoard,
      undefined,
      boardValues,
      tempBoardValues,
      zeroPointCoordinates
    );
    wordScore += letterScoreObj.letterPoints;
    multiplier *= letterScoreObj.wordMultiplier;
    currX++;
  }
  currX = x - 1;
  while (
    getTempLetterAtCoordinate(currX, y, tempBoardValues) ||
    getLetterAtCoordinate(currX, y, boardValues) ||
    getTempLetterOnVirtualBoard(currX, y, virtualBoard)
  ) {
    word =
      (getTempLetterAtCoordinate(currX, y, tempBoardValues) ||
        getLetterAtCoordinate(currX, y, boardValues) ||
        getTempLetterOnVirtualBoard(currX, y, virtualBoard)) + word;
    const letterScoreObj = calculateScoreFromLetter(
      currX,
      y,
      virtualBoard,
      undefined,
      boardValues,
      tempBoardValues,
      zeroPointCoordinates
    );
    wordScore += letterScoreObj.letterPoints;
    multiplier *= letterScoreObj.wordMultiplier;
    currX--;
  }
  wordScore *= multiplier;
  return { word, wordScore };
};

const getHorizontalWordAtCoordinate = (
  x,
  y,
  virtualBoard,
  boardValues,
  tempBoardValues,
  zeroPointCoordinates
) => {
  let currY = y;
  let word = "";
  let wordScore = 0;
  let multiplier = 1;
  while (
    getTempLetterAtCoordinate(x, currY, tempBoardValues) ||
    getLetterAtCoordinate(x, currY, boardValues) ||
    getTempLetterOnVirtualBoard(x, currY, virtualBoard)
  ) {
    word +=
      getTempLetterAtCoordinate(x, currY, tempBoardValues) ||
      getLetterAtCoordinate(x, currY, boardValues) ||
      getTempLetterOnVirtualBoard(x, currY, virtualBoard);
    const letterScoreObj = calculateScoreFromLetter(
      x,
      currY,
      virtualBoard,
      undefined,
      boardValues,
      tempBoardValues,
      zeroPointCoordinates
    );
    wordScore += letterScoreObj.letterPoints;
    multiplier *= letterScoreObj.wordMultiplier;
    currY++;
  }
  currY = y - 1;
  while (
    getTempLetterAtCoordinate(x, currY, tempBoardValues) ||
    getLetterAtCoordinate(x, currY, boardValues) ||
    getTempLetterOnVirtualBoard(x, currY, virtualBoard)
  ) {
    word =
      (getTempLetterAtCoordinate(x, currY, tempBoardValues) ||
        getLetterAtCoordinate(x, currY, boardValues) ||
        getTempLetterOnVirtualBoard(x, currY, virtualBoard)) + word;
    const letterScoreObj = calculateScoreFromLetter(
      x,
      currY,
      virtualBoard,
      undefined,
      boardValues,
      tempBoardValues,
      zeroPointCoordinates
    );
    wordScore += letterScoreObj.letterPoints;
    multiplier *= letterScoreObj.wordMultiplier;
    currY--;
  }
  wordScore *= multiplier;
  return { word, wordScore };
};

const calculateScoreFromLetter = (
  i,
  j,
  virtualBoard,
  letterArg,
  boardValues,
  tempBoardValues,
  zeroPointCoordinates
) => {
  const letter =
    letterArg ||
    getTempLetterAtCoordinate(i, j, tempBoardValues) ||
    getLetterAtCoordinate(i, j, boardValues) ||
    getTempLetterOnVirtualBoard(i, j, virtualBoard);
  let letterPoints =
    zeroPointCoordinates[JSON.stringify([i, j])] === true
      ? 0
      : LETTER_TO_SCORE[letter];
  let wordMultiplier = 1;

  if (
    letterArg ||
    getTempLetterAtCoordinate(i, j, tempBoardValues) ||
    getTempLetterOnVirtualBoard(i, j, virtualBoard)
  ) {
    const specialScore = getSpecialTileScoreIdx(i, j);

    switch (specialScore) {
      case "ct":
        wordMultiplier = 2;
        break;
      case "tw":
        wordMultiplier = 3;
        break;
      case "tl":
        letterPoints *= 3;
        break;
      case "dw":
        wordMultiplier = 2;
        break;
      case "dl":
        letterPoints *= 2;
        break;
    }
  }
  return { letterPoints, wordMultiplier };
};

export const handleComputerStep = async (
  setInvalidWords,
  dispatch,
  isComputersTurn,
  setSelectedComputerTiles,
  setIsComputersTurn,
  localDictionary,
  computerScore,
  lettersLeft,
  boardValues,
  tempBoardValues,
  computerHand,
  hand,
  setComputerPasses,
  playerScore,
  zeroPointCoordinates
) => {
  const lettersOnBoard = getPermanentlyPlacedLetters(boardValues);

  if (lettersOnBoard.length === 0) {
    handleComputerStepOnEmptyBoard(
      boardValues,
      tempBoardValues,
      computerHand,
      localDictionary,
      setSelectedComputerTiles,
      dispatch,
      lettersLeft,
      zeroPointCoordinates
    );
    return;
  }
  let result;
  let n = computerHand.length;

  while (n > 0) {
    const permsWithIndices = getAllPermutationsOfSizeN(computerHand, n);

    for (let i = 0; i < permsWithIndices.length; i++) {
      const permWithIndices = permsWithIndices[i];
      const perm = permWithIndices.map((elem) => elem.letter);

      const indices = permWithIndices.map((elem) => elem.idx);
      result = await tryToPlaceComputerLetters(
        perm,
        indices,
        setInvalidWords,
        dispatch,
        isComputersTurn,
        setSelectedComputerTiles,
        setIsComputersTurn,
        localDictionary,
        computerScore,
        computerHand,
        lettersLeft,
        hand,
        boardValues,
        tempBoardValues,
        playerScore,
        zeroPointCoordinates
      );
      if (result) break;
    }
    if (result) break;
    n--;
  }
  if (!result) {
    setComputerPasses(true);
    setTimeout(() => {
      setComputerPasses(false);
    }, ANIMATION_DURATION);
  }
  dispatch(setIsComputersTurn(false));
};

const tryToPlaceComputerLetters = async (
  arr,
  indices,
  setInvalidWords,
  dispatch,
  isComputersTurn,
  setSelectedComputerTiles,
  setIsComputersTurn,
  localDictionary,
  computerScore,
  computerHand,
  lettersLeft,
  hand,
  boardValues,
  tempBoardValues,
  playerScore,
  zeroPointCoordinates
) => {
  let result;
  let virtualBoard;
  const lettersOnBoard = getPermanentlyPlacedLetters(boardValues);
  for (let i = 0; i < lettersOnBoard.length; i++) {
    const boardLetterObj = lettersOnBoard[i];
    const row = boardLetterObj.row;
    const col = boardLetterObj.col;
    const wordAndCoordinates = placeLettersAroundSpot(
      row,
      col,
      arr,
      localDictionary,
      boardValues
    );
    if (wordAndCoordinates) {
      const coordinates = wordAndCoordinates.coordinates;
      virtualBoard = buildEmptyBoard();
      coordinates.forEach((coords, i) => {
        virtualBoard[coords[0]][coords[1]] = arr[i];
      });
      result = await submitWord(
        virtualBoard,
        indices,
        setInvalidWords,
        dispatch,
        isComputersTurn,
        setSelectedComputerTiles,
        setIsComputersTurn,
        localDictionary,
        computerScore,
        playerScore,
        computerHand,
        lettersLeft,
        hand,
        boardValues,
        tempBoardValues,
        zeroPointCoordinates
      )();
    }
    if (result) break;
  }
  return result;
};

const getPermanentlyPlacedLetters = (boardValues) => {
  const arr = [];

  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const letter = getLetterAtCoordinate(i, j, boardValues);
      if (letter) {
        arr.push({ row: i, col: j, letter });
      }
    }
  }
  return arr;
};

const placeLettersAroundSpot = (
  i,
  j,
  arr,
  localDictionary,
  boardValues,
  dispatch
) => {
  let result;
  for (let m = 0; m <= arr.length; m++) {
    // place horizontally
    const wordAndCoordinates = placeLettersMLettersBeforeAndNLettersAfter(
      i,
      j,
      m,
      arr.length - m,
      arr,
      0,
      1,
      boardValues
    );
    // place vertically
    if (!wordAndCoordinates)
      placeLettersMLettersBeforeAndNLettersAfter(
        i,
        j,
        m,
        arr.length - m,
        arr,
        1,
        0,
        boardValues
      );

    if (wordAndCoordinates) {
      const word = wordAndCoordinates.word;
      if (getIsValidWord(word, localDictionary)) {
        result = wordAndCoordinates;
        break;
      }
    }
  }
  return result;
};

const placeLettersMLettersBeforeAndNLettersAfter = (
  i,
  j,
  m,
  n,
  arr,
  dx,
  dy,
  boardValues
) => {
  let word = boardValues[i][j];
  let count = 0;
  let x = i;
  let y = j;
  let arrIdx = m - 1;
  let coordinates = [];
  while (count < m) {
    if (!isOnBoard(x - dx, y - dy)) break;
    y -= dy;
    x -= dx;
    if (!boardValues[x][y]) {
      coordinates.unshift([x, y]);
      word = arr[arrIdx] + word;
      arrIdx--;
      count++;
    } else {
      word = boardValues[x][y] + word;
    }
  }
  if (count < m) return undefined;
  while (isOnBoard(x - dx, y - dy) && boardValues[x - dx][y - dy]) {
    y -= dy;
    x -= dx;
    word = boardValues[x][y] + word;
  }

  x = i;
  y = j;
  arrIdx = m;
  count = 0;
  while (count < n) {
    if (!isOnBoard(x + dx, y + dy)) break;
    y += dy;
    x += dx;
    if (!boardValues[x][y]) {
      coordinates.push([x, y]);
      word += arr[arrIdx];
      arrIdx++;
      count++;
    } else {
      word += boardValues[x][y];
    }
  }
  if (count < n) return undefined;
  while (isOnBoard(x + dx, y + dy) && boardValues[x + dx][y + dy]) {
    y += dy;
    x += dx;
    word += boardValues[x][y];
  }
  return { word, coordinates };
};

const handleComputerStepOnEmptyBoard = async (
  boardValues,
  tempBoardValues,
  computerHand,
  localDictionary,
  setSelectedComputerTiles,
  dispatch,
  lettersLeft,
  zeroPointCoordinates
) => {
  let lettersToPlay = MAX_LETTERS;

  let result;
  const computerHandCopy = Array.from(computerHand);
  while (lettersToPlay > 2) {
    const permsWithIndices = getAllPermutationsOfSizeN(
      computerHand,
      lettersToPlay
    );
    for (let i = 0; i < permsWithIndices.length; i++) {
      const permWithIndices = permsWithIndices[i];
      const perm = permWithIndices.map((elem) => elem.letter);
      const indices = permWithIndices.map((elem) => elem.idx);
      const word = perm.join("");
      const isValidWord = getIsValidWord(word, localDictionary);

      if (isValidWord) {
        let wordScore = 0;
        let multiplier = 1;
        setSelectedComputerTiles(indices);
        await delay(1000);
        setSelectedComputerTiles([]);
        for (let j = 0; j < perm.length; j++) {
          const k = computerHandCopy.indexOf(perm[j]);
          computerHandCopy.splice(k, 1);
          const firstRow = MID_IDX - Math.ceil((perm.length - 1) / 2);
          const letterScoreObj = calculateScoreFromLetter(
            firstRow + j,
            7,
            null,
            perm[j],
            boardValues,
            tempBoardValues,
            zeroPointCoordinates
          );
          wordScore += letterScoreObj.letterPoints;
          multiplier *= letterScoreObj.wordMultiplier;
          const resolvedLetter = isValidWord[j];

          if (perm[j] === "-") {
            dispatch(addZeroCoordinates(JSON.stringify([firstRow + j, 7])));
          }

          dispatch(
            addLetterToBoard({
              row: firstRow + j,
              col: 7,
              letter: resolvedLetter,
            })
          );
        }
        wordScore *= multiplier;
        const maybeFifty = perm.length === 7 ? 50 : 0;
        dispatch(updateComputerScore(wordScore + maybeFifty));
        result = word;
        break;
      }
    }
    lettersToPlay--;
    if (result) break;
  }
  dispatch(
    modifyComputerHand(
      computerHandCopy.concat(lettersLeft.slice(0, result.length))
    )
  );
  dispatch(modifyLettersLeft(lettersLeft.slice(result.length)));
  dispatch(setIsComputersTurn(false));
};

const getIsValidWord = (word, localDictionary, dispatch) => {
  blankTileLetters = []
  let localBlankTileLetters = []
  if (localDictionary.has(word)) return word;

  let resolvedWord = false;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  if (word.includes("-")) {
    const buildWord = (prefix, idx, arr) => {
      if (resolvedWord) return;
      if (idx === word.length) {
        if (localDictionary.has(prefix)) {
          resolvedWord = prefix;
          localBlankTileLetters = arr
        }
        return;
      }
      if (word[idx] === "-") {
        alphabet.forEach((letter) => {
          buildWord(prefix + letter, idx + 1, [...arr, letter]);
        });
      } else {
        buildWord(prefix + word[idx], idx + 1, arr);
      }
    };
    buildWord("", 0, []);
  }
  blankTileLetters = localBlankTileLetters;
  return resolvedWord;
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const getAllTempLetters = (virtualBoard, tempBoardValues) => {
  const arr = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const letter =
        getTempLetterOnVirtualBoard(i, j, virtualBoard) ||
        getTempLetterAtCoordinate(i, j, tempBoardValues);
      if (letter) {
        arr.push(letter);
      }
    }
  }
  return arr;
};

export const handleNewGameClick =
  (
    dispatch,
    hand,
    boardValues,
    tempBoardValues,
    setGameStarted,
    setIsGameOver
  ) =>
  () => {
    setGameStarted(false);
    setIsGameOver(false);
    dispatch(removeDumpSelections());
    startGame(dispatch, hand, boardValues, tempBoardValues);
  };

export const handleDump =
  (
    dispatch,
    hand,
    tempBoardValues,
    selectedForDumpingHandIndices,
    lettersLeft
  ) =>
  () => {
    const dumpNum = selectedForDumpingHandIndices.length;
    if (dumpNum > 0) {
      let newHand = [];
      for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
          if (tempBoardValues[i][j]) {
            newHand.push(tempBoardValues[i][j]);
          }
        }
      }
      const dumpedLetters = [];
      for (let i = 0; i < 7; i++) {
        if (selectedForDumpingHandIndices.includes(i)) {
          dumpedLetters.push(hand[i]);
        } else if (hand[i]) {
          newHand.push(hand[i]);
        }
      }
      newHand = newHand.concat(lettersLeft.slice(0, dumpNum));
      const newLettersLeft = shuffle(
        lettersLeft.slice(dumpNum).concat(dumpedLetters)
      );
      removeAllTempLetters(
        /** putBackInHand */ false,
        dispatch,
        hand,
        tempBoardValues
      );
      dispatch(modifyHand(newHand));
      dispatch(modifyLettersLeft(newLettersLeft));
      dispatch(removeDumpSelections());
      setTimeout(() => {
        dispatch(setIsComputersTurn(true));
      }, 30);
    }
  };
