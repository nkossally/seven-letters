import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@mui/material";
import ScrabbleBoard from "./components/ScrabbleBoard";
import InstructionsModal from "./components/InstructionsModal";
import GameOverModal from "./components/GameOverModal";
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
import {
  addLetterToBoard,
  removeLetterFromBoard,
} from "./reducers/boardValuesSlice";
import { removeTempLetterFromBoard } from "./reducers/tempBoardValuesSlice";
import classNames from "classnames";

import "./styles.scss";

const resetButtonStyle = {
  position: "absolute",
  top: 5,
  left: 5,
  "text-transform": "uppercase",
  color: "#00e0ff",
  "font-size": 20,
  "border-color": "#00e0ff",
  "z-index": 1,
};

const buttonStyle = {
  "text-transform": "uppercase",
  color: "#00e0ff",
  "font-size": 20,
  "font-weight": 900,
  "border-color": "#00e0ff",
  margin: "0 10px",
  // "z-index": 1,
};

const MID_IDX = 7;
const MAX_LETTERS = 7;
const ANIMATION_DURATION = 2000;

const DIRS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const App = () => {
  const [localDictionary, setLocalDictionary] = useState(new Set());
  const [selectedComputerTiles, setSelectedComputerTiles] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [invalidWords, setInvalidWords] = useState(false);
  const [computerPasses, setComputerPasses] = useState(false);
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
    if (
      gameStarted &&
      lettersLeft.length === 0 &&
      (computerHand.length === 0 || hand.length === 0)
    ) {
      setIsGameOver(true);
    }
  }, [lettersLeft]);

  useEffect(() => {
    const getSetOfDictionaryWords = async () => {
      const result = await fetch(AllWords);
      const text = await result.text();
      const dict = text.split("\r\n").map((elem) => elem.toUpperCase());

      setLocalDictionary(new Set(dict));
    };
    getSetOfDictionaryWords();
  }, []);

  useEffect(() => {}, [
    tempBoardValues,
    boardValues,
    isComputersTurn,
    selectedComputerTiles,
    lettersLeft,
    isGameOver,
    hand,
    computerHand
  ]);

  useEffect(() => {
    startGame();
    setGameStarted(true);
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
    removeAllTempLetters();
    removeAllLetters();
    dispatch(modifyHand(letters.slice(0, 7)));
    dispatch(modifyComputerHand(letters.slice(7, 14)));
    dispatch(modifyLettersLeft(letters.slice(14)));
    dispatch(updateComputerScore(0));
    dispatch(updateScore(0));
  };

  const buildEmptyBoard = () => {
    const arr = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      arr.push([]);
    }
    return arr;
  };

  const handleSetInvalidWords = (text) => {
    setInvalidWords(text);
    setTimeout(() => {
      setInvalidWords("");
    }, ANIMATION_DURATION);
  };

  const submitWord = async (virtualBoard, indices) => {
    const lettersOnBoard = getPermanentlyPlacedLetters();
    const isFirstPlay = lettersOnBoard.length === 0;

    const rowsAndCols = getPlacedLettersRowsAndCols(virtualBoard);
    let rows = rowsAndCols.rows;
    let cols = rowsAndCols.cols;
    if (rows.length === 0 && cols.length === 0) {
      handleSetInvalidWords("Place letters on the board to form a word.");
      return;
    }
    if (rows.length > 1 && cols.length > 1) {
      handleSetInvalidWords("Letters should be in same row or column.");
      return;
    }
    if (!getIsContinuousWord(rows, cols, virtualBoard)) {
      handleSetInvalidWords("Letters must form a continuous word.");
      return;
    }
    if (!isFirstPlay && !getIsConnectedToPrevWord(rows, cols)) {
      handleSetInvalidWords("Words must connect to previous words.");
      return;
    }
    if (isFirstPlay && (!rows.includes(MID_IDX) || !cols.includes(MID_IDX))) {
      handleSetInvalidWords(
        "First word must have a tile in the center of board."
      );
      return;
    }

    const allWordsInDict = checkAllWordsOnBoard(virtualBoard);

    if (isComputersTurn) {
      if (allWordsInDict) {
        setSelectedComputerTiles(indices);
        await delay(1000);
        permanentlyPlaceLetters(virtualBoard);
        dispatch(setIsComputersTurn(false));
        setSelectedComputerTiles([]);
        return true;
      } else {
        dispatch(setIsComputersTurn(false));
        return false;
      }
    } else {
      if (allWordsInDict) {
        permanentlyPlaceLetters();
        dispatch(setIsComputersTurn(true));
      } else {
        handleSetInvalidWords("Word(s) not found in dictionary.");
      }
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
      maxWordLength = Math.max(maxWordLength, word.length);
      if (word.length > 1) {
        score += wordAndScore.wordScore;
        const definition = localDictionary.has(word);
        // console.log("word", word, definition)
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
          maxWordLength = Math.max(maxWordLength, word.length);
          if (word.length > 1) {
            score += wordAndScore.wordScore;
            const definition = localDictionary.has(word);
            // console.log("word", word, definition)
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
      maxWordLength = Math.max(maxWordLength, word.length);
      if (word.length > 1) {
        score += wordAndScore.wordScore;
        const definition = localDictionary.has(word);
        // console.log("word", word, definition)

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
          maxWordLength = Math.max(maxWordLength, word.length);
          if (word.length > 1) {
            const definition = localDictionary.has(word);
            // console.log("word", word, definition)
            score += wordAndScore.wordScore;
            if (!definition) allWordsInDict = false;
          }
        }
      });
    }
    // don't submit any one letter words
    if (maxWordLength < 2) return false;
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
          getTempLetterOnVirtualBoard(i, j, virtualBoard);
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

  const removeAllLetters = () => {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (getLetterAtCoordinate(i, j)) {
          dispatch(removeLetterFromBoard({ row: i, col: j }));
        }
      }
    }
  };

  const getPlacedLettersRowsAndCols = (virtualBoard) => {
    const rows = new Set();
    const cols = new Set();
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (getTempLetterOnVirtualBoard(i, j, virtualBoard)) {
          rows.add(i);
          cols.add(j);
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
        !getTempLetterOnVirtualBoard(x, y, virtualBoard)
      ) {
        result = false;
        break;
      }
    }
    return result;
  };

  const getLetterAtCoordinate = (x, y) => {
    if (!boardValues) return;
    return isOnBoard(x, y) ? boardValues[x][y] : undefined;
  };

  const getTempLetterAtCoordinate = (x, y) => {
    if (!tempBoardValues) return;
    return isOnBoard(x, y) ? tempBoardValues[x][y] : undefined;
  };

  const getTempLetterOnVirtualBoard = (x, y, virtualBoard) => {
    if (!virtualBoard) return;
    if (!virtualBoard[x]) return;
    return isOnBoard(x, y) ? virtualBoard[x][y] : undefined;
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
      getTempLetterOnVirtualBoard(currX, y, virtualBoard)
    ) {
      word +=
        getTempLetterAtCoordinate(currX, y) ||
        getLetterAtCoordinate(currX, y) ||
        getTempLetterOnVirtualBoard(currX, y, virtualBoard);
      const letterScoreObj = calculateScoreFromLetter(currX, y, virtualBoard);
      wordScore += letterScoreObj.letterPoints;
      multiplier *= letterScoreObj.wordMultiplier;
      currX++;
    }
    currX = x - 1;
    while (
      getTempLetterAtCoordinate(currX, y) ||
      getLetterAtCoordinate(currX, y) ||
      getTempLetterOnVirtualBoard(currX, y, virtualBoard)
    ) {
      word =
        (getTempLetterAtCoordinate(currX, y) ||
          getLetterAtCoordinate(currX, y) ||
          getTempLetterOnVirtualBoard(currX, y, virtualBoard)) + word;
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
      getTempLetterOnVirtualBoard(x, currY, virtualBoard)
    ) {
      word +=
        getTempLetterAtCoordinate(x, currY) ||
        getLetterAtCoordinate(x, currY) ||
        getTempLetterOnVirtualBoard(x, currY, virtualBoard);
      const letterScoreObj = calculateScoreFromLetter(x, currY, virtualBoard);
      wordScore += letterScoreObj.letterPoints;
      multiplier *= letterScoreObj.wordMultiplier;
      currY++;
    }
    currY = y - 1;
    while (
      getTempLetterAtCoordinate(x, currY) ||
      getLetterAtCoordinate(x, currY) ||
      getTempLetterOnVirtualBoard(x, currY, virtualBoard)
    ) {
      word =
        getTempLetterAtCoordinate(x, currY) ||
        getLetterAtCoordinate(x, currY) ||
        getTempLetterOnVirtualBoard(x, currY, virtualBoard) + word;
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
      getTempLetterOnVirtualBoard(i, j, virtualBoard);
    let letterPoints = LETTER_TO_SCORE[letter];
    let wordMultiplier = 1;

    if (
      letterArg ||
      getTempLetterAtCoordinate(i, j) ||
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

  const handleComputerStep = async () => {
    const lettersOnBoard = getPermanentlyPlacedLetters();

    if (lettersOnBoard.length === 0) {
      handleComputerStepOnEmptyBoard();
      return;
    }
    let result;
    let n = computerHand.length;

    while (n > 1) {
      const permsWithIndices = getAllPermutationsOfSizeN(computerHand, n);

      for (let i = 0; i < permsWithIndices.length; i++) {
        const permWithIndices = permsWithIndices[i];
        const perm = permWithIndices.map((elem) => elem.letter);

        const indices = permWithIndices.map((elem) => elem.idx);
        result = await tryToPlaceComputerLetters(perm, indices);
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

  const tryToPlaceComputerLetters = async (arr, indices) => {
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
        result = await submitWord(virtualBoard, indices);
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
        // console.log("word", word, localDictionary.has(word))
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

  const handleComputerStepOnEmptyBoard = async () => {
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
        const definition = localDictionary.has(word);
        // console.log("word", word, definition)

        if (definition) {
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
          getTempLetterOnVirtualBoard(i, j, virtualBoard) ||
          getTempLetterAtCoordinate(i, j);
        if (letter) {
          arr.push(letter);
        }
      }
    }
    return arr;
  };

  let gameOverText = "";
  if (computerScore < playerScore) {
    gameOverText = "You Win";
  } else if (computerScore > playerScore) {
    gameOverText = "Computer Wins";
  } else {
    gameOverText = "It's a tie";
  }

  const handleNewGameClick = () => {
    setGameStarted(false);
    startGame();
  };

  return (
    <div className="App">
      <InstructionsModal />
      {isGameOver ? <GameOverModal text={gameOverText} /> : ""}
      <ScoreCard />
      <Button
        variant="outlined"
        sx={resetButtonStyle}
        onClick={handleNewGameClick}
      >
        New Game
      </Button>
      <div className="player-row">
        <Hand />
        <div>
          <Button
            variant="outlined"
            sx={buttonStyle}
            disabled={isComputersTurn}
            onClick={() => submitWord(undefined)}
          >
            {" "}
            Submit{" "}
          </Button>
          <Button
            variant="outlined"
            sx={buttonStyle}
            disabled={isComputersTurn}
            onClick={pass}
          >
            {" "}
            Pass{" "}
          </Button>
        </div>
      </div>
      <div
        className={classNames(
          "notification-text",
          invalidWords || computerPasses ? "fade-in-and-out" : ""
        )}
      >
        {computerPasses && <>Computer passes</>}
        {invalidWords && <>{invalidWords}</>}
      </div>
      <div className="board-and-computer-hand">
        <ScrabbleBoard />
        <ComputerHand selectedTiles={selectedComputerTiles} />
      </div>
    </div>
  );
};

export default App;
