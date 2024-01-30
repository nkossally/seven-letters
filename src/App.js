import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@mui/material";
import ScrabbleBoard from "./components/ScrabbleBoard";
import InstructionsModal from "./components/InstructionsModal";
import Hand from "./components/Hand";
import ComputerHand from "./components/ComputerHand";
import ScoreCard from "./components/ScoreCard";
import { BOARD_SIZE, LETTER_TO_SCORE } from "./consts";
import AllWords from "./words.txt";
import {
  LETTER_COUNTS,
  shuffle,
  getAllPermutationsOfSizeN,
  getSpecialTileScoreIdx,
} from "./util";
import { modifyHand } from "./reducers/handSlice";
import { modifyComputerHand } from "./reducers/computerHandSlice";
import { modifyLettersLeft } from "./reducers/lettersLeftSlice";
import { setIsComputersTurn } from "./reducers/isComputersTurn.slice";
import { updateScore } from "./reducers/scoreSlice";
import { updateComputerScore } from "./reducers/computerScoreSlice";
import { addLetterToBoard } from "./reducers/boardValuesSlice";
import { removeTempLetterFromBoard } from "./reducers/tempBoardValuesSlice";

import "./styles.scss";

const resetButtonStyle = {
  position: "absolute",
  top: 5,
  left: 5,
  "text-transform": "uppercase",
  color: "#00e0ff",
  "font-size": 20,
  "border-color": "#00e0ff",
};

const MID_IDX = 7;
const MAX_LETTERS = 7;

const DIRS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];

const App = () => {
  const [localDictionary, setLocalDictionary] = useState(new Set());
  const boardValues = useSelector((state) => state.boardValues);
  const tempBoardValues = useSelector((state) => state.tempBoardValues);
  const lettersLeft = useSelector((state) => state.lettersLeft);
  const hand = useSelector((state) => state.hand);
  const computerHand = useSelector((state) => state.computerHand);
  const playerScore = useSelector((state) => state.score);
  const computerScore = useSelector((state) => state.computerScore);
  const isComputersTurn = useSelector((state) => state.isComputersTurn);

  const dispatch = useDispatch();

  useEffect(() => {
    const getSetOfDictionaryWords = async () => {
      const result = await fetch(AllWords);
      const text = await result.text();
      const dict = text.split("\r\n").map((elem) => elem.toUpperCase());
      // console.log(dict.includes("ZO"));

      setLocalDictionary(new Set(dict));
    };
    getSetOfDictionaryWords();
  }, []);

  useEffect(() => {}, [
    JSON.stringify(tempBoardValues),
    JSON.stringify(boardValues),
    tempBoardValues.length,
    boardValues.length,
    isComputersTurn,
  ]);

  useEffect(() => {
    startGame();
  }, []);

  useEffect(() => {
    if (isComputersTurn) {
      handleComputerStep();
    }
  }, [isComputersTurn]);

  const pass = () => {
    removeAllTempLetters();
    dispatch(setIsComputersTurn(true));
  };

  const startGame = () => {
    let letters = [];
    Object.keys(LETTER_COUNTS).forEach((letter) => {
      for (let i = 0; i < LETTER_COUNTS[letter]; i++) {
        letters.push(letter);
      }
    });
    letters = shuffle(letters);
    dispatch(modifyHand(letters.slice(0, 7)));
    dispatch(modifyComputerHand(letters.slice(7, 14)));
    dispatch(modifyLettersLeft(letters.slice(14)));
  };

  const buildEmptyBoard = () => {
    const arr = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      arr.push([]);
    }
    return arr;
  };

  const submitWord = (virtualBoard) => {
    const lettersOnBoard = getPermanentlyPlacedLetters();
    const isFirstPlay = lettersOnBoard.length === 0;

    const rowsAndCols = getPlacedLettersRowsAndCols(virtualBoard);
    let rows = rowsAndCols.rows;
    let cols = rowsAndCols.cols;
    if (rows.length > 1 && cols.length > 1) return;
    if (!getIsContinuousWord(rows, cols, virtualBoard)) return;
    if (!isFirstPlay && !getIsConnectedToPrevWord(rows, cols)) return;
    if (isFirstPlay && (!rows.includes(MID_IDX) || !cols.includes(MID_IDX)))
      return;

    const allWordsInDict = checkAllWordsOnBoard(virtualBoard);

    if (allWordsInDict) {
      permanentlyPlaceLetters(virtualBoard);
    }
    if (isComputersTurn) {
      dispatch(setIsComputersTurn(false));
    } else {
      if (allWordsInDict) {
        dispatch(setIsComputersTurn(true));
      }
    }
    if (allWordsInDict) {
      return true;
    }
  };

  const checkAllWordsOnBoard = (virtualBoard) => {
    const rowsAndCols = getPlacedLettersRowsAndCols(virtualBoard);
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
        virtualBoard
      );
      word = wordAndScore.word;
      maxWordLength = Math.max(maxWordLength, word.length)
      if (word.length > 1) {
        score += wordAndScore.wordScore;
        const definition = localDictionary.has(word);
        if (!definition) allWordsInDict = false;
      }
      // check if any of the letters in a vertical word adjoin an already placed horizontal words.
      rows.forEach((row) => {
        const wordAndScore = getHorizontalWordAtCoordinate(
          row,
          col,
          virtualBoard
        );
        if (wordAndScore) {
          const word = wordAndScore.word;
          maxWordLength = Math.max(maxWordLength, word.length)
          if (word.length > 1) {
            score += wordAndScore.wordScore;
            const definition = localDictionary.has(word);

            if (!definition) allWordsInDict = false;
          }
        }
      });
    } else {
      // word is horizontal
      const row = rows[0];
      const wordAndScore = getHorizontalWordAtCoordinate(
        row,
        cols[0],
        virtualBoard
      );
      word = wordAndScore.word;
      maxWordLength = Math.max(maxWordLength, word.length)
      if (word.length > 1) {
        score += wordAndScore.wordScore;
        const definition = localDictionary.has(word);

        if (!definition) allWordsInDict = false;
      }
      cols.forEach((col) => {
        const wordAndScore = getVerticalWordAtCoordinate(
          row,
          col,
          virtualBoard
        );
        if (wordAndScore) {
          const word = wordAndScore.word;
          maxWordLength = Math.max(maxWordLength, word.length)
          if (word.length > 1) {
            const definition = localDictionary.has(word);
            score += wordAndScore.wordScore;
            if (!definition) allWordsInDict = false;
          }
        }
      });
    }
    // don't submit any one letter words
    if(maxWordLength < 2) return false;
    if (allWordsInDict) {
      const tempLetterArr = getAllTempLetters();
      const maybeFifty = tempLetterArr.length === 7 ? 50 : 0;
      if (virtualBoard) {
        dispatch(updateComputerScore(computerScore + score + maybeFifty));
      } else {
        dispatch(updateScore(playerScore + score + maybeFifty));
      }
    }

    return allWordsInDict;
  };

  const permanentlyPlaceLetters = (virtualBoard) => {
    let letterCount = 0;
    const computerHandCopy = Array.from(computerHand);
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const letter =
          getTempLetterAtCoordinate(i, j) ||
          (virtualBoard && virtualBoard[i][j]);
        if (letter) {
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

  const removeAllTempLetters = () => {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (getTempLetterAtCoordinate(i, j)) {
          dispatch(removeTempLetterFromBoard({ row: i, col: j }));
        }
      }
    }
  };

  const getPlacedLettersRowsAndCols = (virtualBoard) => {
    const rows = new Set();
    const cols = new Set();
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (virtualBoard) {
          if (virtualBoard[i][j]) {
            rows.add(i);
            cols.add(j);
          }
        } else if (getTempLetterAtCoordinate(i, j)) {
          rows.add(i);
          cols.add(j);
        }
      }
    }
    const rowsArr = Array.from(rows).sort((a, b) => a - b);
    const colsArr = Array.from(cols).sort((a, b) => a - b);

    return { rows: rowsArr, cols: colsArr };
  };

  const getIsContinuousWord = (rows, cols, virtualBoard) => {
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
        !getLetterAtCoordinate(x, y) &&
        !getTempLetterAtCoordinate(x, y) &&
        !(virtualBoard && virtualBoard[x][y])
      ) {
        result = false;
        break;
      }
    }
    return result;
  };

  const getLetterAtCoordinate = (x, y) => {
    return isOnBoard(x, y) ? boardValues[x][y] : undefined;
  };

  const getTempLetterAtCoordinate = (x, y) => {
    return isOnBoard(x, y) ? tempBoardValues[x][y] : undefined;
  };

  const getIsConnectedToPrevWord = (rows, cols) => {
    let result = false;
    if (rows.length > 1) {
      const col = cols[0];
      rows.forEach((row) => {
        if (getAdjacentToPlacedLetter(row, col)) {
          result = true;
        }
      });
    } else {
      const row = rows[0];
      cols.forEach((col) => {
        if (getAdjacentToPlacedLetter(row, col)) {
          result = true;
        }
      });
    }
    return result;
  };

  const getAdjacentToPlacedLetter = (x, y) => {
    let result = false;
    DIRS.forEach((dir) => {
      const x1 = x + dir[0];
      const y1 = y + dir[1];
      if (isOnBoard(x1, y1) && getLetterAtCoordinate(x1, y1)) {
        result = true;
      }
    });
    return result;
  };

  const isOnBoard = (x, y) => {
    return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
  };

  const getVerticalWordAtCoordinate = (x, y, virtualBoard) => {
    let currX = x;
    let word = "";
    let wordScore = 0;
    let multiplier = 1;
    while (
      getTempLetterAtCoordinate(currX, y) ||
      getLetterAtCoordinate(currX, y) ||
      (virtualBoard && virtualBoard[currX][y])
    ) {
      word +=
        getTempLetterAtCoordinate(currX, y) ||
        getLetterAtCoordinate(currX, y) ||
        (virtualBoard && virtualBoard[currX][y]);
      const letterScoreObj = calculateScoreFromLetter(currX, y, virtualBoard);
      wordScore += letterScoreObj.letterPoints;
      multiplier *= letterScoreObj.wordMultiplier;
      currX++;
    }
    currX = x - 1;
    while (
      getTempLetterAtCoordinate(currX, y) ||
      getLetterAtCoordinate(currX, y) ||
      (virtualBoard && virtualBoard[currX][y])
    ) {
      word =
        (getTempLetterAtCoordinate(currX, y) ||
          getLetterAtCoordinate(currX, y) ||
          (virtualBoard && virtualBoard[currX][y])) + word;
      const letterScoreObj = calculateScoreFromLetter(currX, y, virtualBoard);
      wordScore += letterScoreObj.letterPoints;
      multiplier *= letterScoreObj.wordMultiplier;
      currX--;
    }
    wordScore *= multiplier;
    return { word, wordScore };
  };

  const getHorizontalWordAtCoordinate = (x, y, virtualBoard) => {
    let currY = y;
    let word = "";
    let wordScore = 0;
    let multiplier = 1;
    while (
      getTempLetterAtCoordinate(x, currY) ||
      getLetterAtCoordinate(x, currY) ||
      (virtualBoard && virtualBoard[x][currY])
    ) {
      word +=
        getTempLetterAtCoordinate(x, currY) ||
        getLetterAtCoordinate(x, currY) ||
        (virtualBoard && virtualBoard[x][currY]);
      const letterScoreObj = calculateScoreFromLetter(x, currY, virtualBoard);
      wordScore += letterScoreObj.letterPoints;
      multiplier *= letterScoreObj.wordMultiplier;
      currY++;
    }
    currY = y - 1;
    while (
      getTempLetterAtCoordinate(x, currY) ||
      getLetterAtCoordinate(x, currY) ||
      (virtualBoard && virtualBoard[x][currY])
    ) {
      word =
        getTempLetterAtCoordinate(x, currY) ||
        getLetterAtCoordinate(x, currY) ||
        (virtualBoard && virtualBoard[x][currY]) + word;
      const letterScoreObj = calculateScoreFromLetter(x, currY, virtualBoard);
      wordScore += letterScoreObj.letterPoints;
      multiplier *= letterScoreObj.wordMultiplier;
      currY--;
    }

    wordScore *= multiplier;
    return { word, wordScore };
  };

  const calculateScoreFromLetter = (i, j, virtualBoard, letterArg) => {
    const letter =
      letterArg ||
      getTempLetterAtCoordinate(i, j) ||
      getLetterAtCoordinate(i, j) ||
      (virtualBoard && virtualBoard[i][j]);
    let letterPoints = LETTER_TO_SCORE[letter];
    let wordMultiplier = 1;

    if (
      letterArg ||
      getTempLetterAtCoordinate(i, j) ||
      (virtualBoard && virtualBoard[i][j])
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

  const handleComputerStep = () => {
    const lettersOnBoard = getPermanentlyPlacedLetters();

    if (lettersOnBoard.length === 0) {
      handleComputerStepOnEmptyBoard();
      return;
    }
    let result;
    let n = computerHand.length;

    while (n > 1) {
      const perms = getAllPermutationsOfSizeN(computerHand, n);

      for (let i = 0; i < perms.length; i++) {
        result = tryToPlaceComputerLetters(perms[i]);
        if (result) break;
      }
      if (result) break;
      n--;
    }
    dispatch(setIsComputersTurn(false));
  };

  const tryToPlaceComputerLetters = (arr) => {
    let result;
    let virtualBoard;
    const lettersOnBoard = getPermanentlyPlacedLetters();
    for (let i = 0; i < lettersOnBoard.length; i++) {
      const boardLetterObj = lettersOnBoard[i];
      const row = boardLetterObj.row;
      const col = boardLetterObj.col;
      const wordAndCoordinates = placeLettersAroundSpot(row, col, arr);

      if (wordAndCoordinates) {
        const coordinates = wordAndCoordinates.coordinates;
        virtualBoard = buildEmptyBoard();
        coordinates.forEach((coords, i) => {
          virtualBoard[coords[0]][coords[1]] = arr[i];
        });
        result = submitWord(virtualBoard);
      }
      if (result) break;
    }
    return result;
  };

  const getPermanentlyPlacedLetters = () => {
    const arr = [];

    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const letter = getLetterAtCoordinate(i, j);
        if (letter) {
          arr.push({ row: i, col: j, letter });
        }
      }
    }
    return arr;
  };

  const placeLettersAroundSpot = (i, j, arr) => {
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
        1
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
          0
        );

      if (wordAndCoordinates) {
        const word = wordAndCoordinates.word;
        if (localDictionary.has(word)) {
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
    dy
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
    while (isOnBoard(x - dx, y - dy) && boardValues[x][y - dy]) {
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
      y++;
      word += boardValues[x][y];
    }
    return { word, coordinates };
  };

  const handleComputerStepOnEmptyBoard = () => {
    let lettersToPlay = MAX_LETTERS;

    let result;
    const computerHandCopy = Array.from(computerHand);
    while (lettersToPlay > 2) {
      const perms = getAllPermutationsOfSizeN(computerHand, lettersToPlay);

      for (let i = 0; i < perms.length; i++) {
        const perm = perms[i];
        const word = perm.join("");
        const definition = localDictionary.has(word);

        if (definition) {
          let wordScore = 0;
          let multiplier = 1;
          for (let j = 0; j < perm.length; j++) {
            const k = computerHandCopy.indexOf(perm[j]);
            computerHandCopy.splice(k, 1);
            const firstRow = MID_IDX - Math.ceil((perm.length - 1) / 2);
            const letterScoreObj = calculateScoreFromLetter(
              firstRow + j,
              7,
              null,
              perm[j]
            );
            wordScore += letterScoreObj.letterPoints;
            multiplier *= letterScoreObj.wordMultiplier;

            dispatch(
              addLetterToBoard({
                row: firstRow + j,
                col: 7,
                letter: perm[j],
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

  const getAllTempLetters = (virtualBoard) => {
    const arr = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const letter =
          (virtualBoard && virtualBoard[i][j]) ||
          getTempLetterAtCoordinate(i, j);
        if (letter) {
          arr.push(letter);
        }
      }
    }
    return arr;
  };

  return (
    <>
      <InstructionsModal />
      <ScoreCard />
      <Button variant="outlined" sx={resetButtonStyle} onClick={startGame}>
        New Game
      </Button>
      <div className="player-row">
        <Hand />
        <div>
          <button
            className="submit-button"
            disabled={isComputersTurn}
            onClick={() => submitWord(undefined)}
          >
            {" "}
            Submit{" "}
          </button>
          <button className="pass-button" onClick={pass}>
            {" "}
            Pass{" "}
          </button>
        </div>
      </div>
      <div className="board-and-computer-hand">
        <ComputerHand />
        <ScrabbleBoard />
      </div>
    </>
  );
};

export default App;
