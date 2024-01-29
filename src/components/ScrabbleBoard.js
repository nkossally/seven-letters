import classNames from "classnames";
import { BOARD_SIZE, LETTER_TO_SCORE, VOWELS } from "../consts";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Letter from "./Letter";

import {
  lookUpWord,
  LETTER_COUNTS,
  shuffle,
  getAllPermutationsOfSizeN,
} from "../util";
import {
  removeTempLetterFromBoard,
  addTempLetterToBoard,
} from "../reducers/tempBoardValuesSlice";
import { addLetterToBoard } from "../reducers/boardValuesSlice";
import { modifyHand } from "../reducers/handSlice";
import { modifyComputerHand } from "../reducers/computerHandSlice";
import { modifyLettersLeft } from "../reducers/lettersLeftSlice";
import { updateScore } from "../reducers/scoreSlice";
import AllWords from "../words.txt";

const DIRS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];
const MID_IDX = 7;
const MAX_LETTERS = 7;
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const ScrabbleBoard2 = () => {
  const [turns, setTurns] = useState(1);
  const [currScore, setCurrScore] = useState(0);
  const [placedLettersArr, setPlacedLettersArr] = useState([]);
  const [placedTempLettersArr, setPlacedTempLettersArr] = useState([]);
  const [localDictionary, setLocalDictionary] = useState(new Set());
  const [isComputersTurn, setIsComputersTurn] = useState(true)

  const boardValues = useSelector((state) => state.boardValues);
  const tempBoardValues = useSelector((state) => state.tempBoardValues);
  const lettersLeft = useSelector((state) => state.lettersLeft);
  const hand = useSelector((state) => state.hand);
  const computerHand = useSelector((state) => state.computerHand);
  const score = useSelector((state) => state.score);
  const dispatch = useDispatch();

  var boardSize = BOARD_SIZE - 1;

  useEffect(() => {
    startGame();
  }, []);

  useEffect(() => {
    const getSetOfDictionaryWords = async () => {
      const result = await fetch(AllWords);
      const text = await result.text();
      const dict = text.split("\r\n").map((elem) => elem.toUpperCase());
      setLocalDictionary(new Set(dict));
      console.log(dict)
    };
    getSetOfDictionaryWords();
  }, []);

  useEffect(() => {
    const placedLetters = [];
    const placedTempLetters = [];

    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const letter = getLetterAtCoordinate(i, j);
        const tempLetter = getTempLetterAtCoordinate(i, j);
        if (letter) {
          placedLetters.push({ row: i, col: j, letter });
        }
        if (tempLetter) {
          placedTempLetters.push({ row: i, col: j, letter });
        }
      }
    }
    setPlacedLettersArr(placedLetters);
    setPlacedTempLettersArr(placedTempLetters);
  }, [
    JSON.stringify(tempBoardValues),
    JSON.stringify(boardValues),
    tempBoardValues.length,
    boardValues.length,
    turns,
  ]);

  const buildEmptyBoard = () => {
    const arr = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      arr.push([]);
    }
    return arr;
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

  var tileScoreIdx = {
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
  const arr = Array(BOARD_SIZE).fill("");
  const toTileIndex = (row, column) => {
    if (row < BOARD_SIZE && row >= 0 && column < BOARD_SIZE && column >= 0) {
      return row * BOARD_SIZE + column;
    } else {
      return -1;
    }
  };

  const getSpecialTileScoreIdx = (i, j) => {
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

  /**
   * Get the letter score value
   */
  const letterValue = (letter) => {
    var tileScore = {
      0: "?",
      1: "a,e,i,l,n,o,r,s,t,u",
      2: "d,g",
      3: "b,c,m,p",
      4: "f,h,v,w,y",
      5: "k",
      8: "j,x",
      10: "q,z",
    };
    if (letter.length === 1) {
      for (var v in tileScore) {
        if (tileScore[v].indexOf(letter.toLowerCase()) >= 0) {
          return v;
        }
      }
    }
    return null;
  };

  const submitWord = (virtualBoard) => {
    const rowsAndCols = getPlacedLettersRowsAndCols(virtualBoard);
    let rows = rowsAndCols.rows;
    let cols = rowsAndCols.cols;
    if (rows.length > 1 && cols.length > 1) return;
    if (!getIsContinuousWord(rows, cols, virtualBoard)) return;
    if (turns > 1 && !getIsConnectedToPrevWord(rows, cols)) return;
    if (turns === 1 && (!rows.includes(MID_IDX) || !cols.includes(MID_IDX)))
      return;

    const allWordsInDict = checkAllWordsOnBoard(virtualBoard);

    if (allWordsInDict) {
      permanentlyPlaceLetters(virtualBoard);
      dispatch(updateScore(score + currScore));

      setTurns(turns + 1)
    }
    setCurrScore(0);
    if (allWordsInDict) return true;
  };

  const checkAllWordsOnBoard = (virtualBoard) => {
    const rowsAndCols = getPlacedLettersRowsAndCols(virtualBoard);
    let rows = rowsAndCols.rows;
    let cols = rowsAndCols.cols;

    let word = "";
    let allWordsInDict = true;
    if (rows.length > 1) {
      word = getVerticalWordAtCoordinate(rows[0], cols[0], virtualBoard);
      if (word.length > 1) {
        const definition = localDictionary.has(word);
        if (!definition) allWordsInDict = false;
      }
      rows.forEach((row) => {
        const word = getHorizontalWordAtCoordinate(row, cols[0], virtualBoard);
        if (word.length > 1) {
          const definition = localDictionary.has(word);

          if (!definition) allWordsInDict = false;
        }
      });
    } else {
      word = getHorizontalWordAtCoordinate(rows[0], cols[0], virtualBoard);
      if (word.length > 1) {
        const definition = localDictionary.has(word);

        if (!definition) allWordsInDict = false;
      }
      cols.forEach((col) => {
        const word = getVerticalWordAtCoordinate(rows[0], col, virtualBoard);
        if (word.length > 1) {
          const definition = localDictionary.has(word);

          if (!definition) allWordsInDict = false;
        }
      });
    }

    return allWordsInDict;
  };

  const permanentlyPlaceLetters = (virtualBoard) => {
    let letterCount = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const letter =
          getTempLetterAtCoordinate(i, j) ||
          (virtualBoard && virtualBoard[i][j]);
        if (letter) {
          dispatch(addLetterToBoard({ row: i, col: j, letter }));
          dispatch(removeTempLetterFromBoard({ row: i, col: j }));
          letterCount++;
        }
      }
    }

    dispatch(modifyHand(hand.concat(lettersLeft.slice(0, letterCount))));
    dispatch(modifyLettersLeft(lettersLeft.slice(letterCount)));
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
    console.log("getVerticalWordAtCoordinate" )
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
      const letterScoreObj = calculateScoreFromLetter(currX, y);
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
      const letterScoreObj = calculateScoreFromLetter(currX, y);
      wordScore += letterScoreObj.letterPoints;
      multiplier *= letterScoreObj.wordMultiplier;
      currX--;
    }
    console.log("getVerticalWordAtCoordinate", word)
    wordScore *= multiplier;
    setCurrScore(currScore + wordScore);
    return word;
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
      const letterScoreObj = calculateScoreFromLetter(x, currY);
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
      const letterScoreObj = calculateScoreFromLetter(x, currY);
      wordScore += letterScoreObj.letterPoints;
      multiplier *= letterScoreObj.wordMultiplier;
      currY--;
    }
    console.log("getHorizontalWord", word)

    wordScore *= multiplier;
    setCurrScore(currScore + wordScore);
    return word;
  };

  const calculateScoreFromLetter = (i, j) => {
    const letter =
      getTempLetterAtCoordinate(i, j) || getLetterAtCoordinate(i, j);
    let letterPoints = LETTER_TO_SCORE[letter];
    let wordMultiplier = 1;

    if (getTempLetterAtCoordinate(i, j)) {
      letterPoints = LETTER_TO_SCORE[letter];
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
    let result;
    let n = Math.max(MAX_LETTERS, computerHand.length);

    while (n > 1) {
      const perms = getAllPermutationsOfSizeN(computerHand, n);

      for (let i = 0; i < perms.length; i++) {
        result = tryToPlaceComputerLetters(perms[i]);
        if (result) break;
      }
      if (result) break;
      n--;
    }
  };

  const tryToPlaceComputerLetters = (arr) => {
    let result;
    let virtualBoard;
    for (let i = 0; i < placedLettersArr.length; i++) {
      const boardLetterObj = placedLettersArr[i];
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

  const handleFirstComputerStep = () => {
    let lettersToPlay = MAX_LETTERS;

    let result;
    while (lettersToPlay > 2) {
      const perms = getAllPermutationsOfSizeN(computerHand, lettersToPlay);

      for (let i = 0; i < perms.length; i++) {
        const perm = perms[i];
        const word = perm.join("");
        const definition = localDictionary.has(word);

        if (definition) {
          for (let j = 0; j < perm.length; j++) {
            dispatch(
              addLetterToBoard({
                row: MID_IDX - 2 + j,
                col: 7,
                letter: perm[j],
              })
            );
          }
          result = word;
          break;
        }
      }
      lettersToPlay--;
      if (result) break;
    }
    setTurns(turns + 1);
  };

  return (
    <div id="js-board">
      <button onClick={() => submitWord(undefined)}>press here</button>
      <p />
      <button onClick={handleFirstComputerStep}>computer first step</button>
      <p />
      <button onClick={handleComputerStep}>computer play</button>
      <div className="board">
        {arr.map((elem, i) => {
          return (
            <div className="row" key={`row${i}`}>
              {arr.map((elem, j) => {
                const specialScore = getSpecialTileScoreIdx(i, j);
                const addLetters =
                  specialScore && (i !== boardSize / 2 || j !== boardSize / 2);
                return (
                  <>
                    {typeof boardValues[i][j] === "string" && (
                      <Letter
                        letter={boardValues[i][j]}
                        boardRow={i}
                        boardCol={j}
                        permanentlyOnBoard={true}
                        key={`tile${i}.${j}.boardVal`}
                      />
                    )}
                    {typeof tempBoardValues[i][j] === "string" && (
                      <Letter
                        letter={tempBoardValues[i][j]}
                        boardRow={i}
                        boardCol={j}
                        key={`tile${i}.${j}.tempBoardVal`}
                      />
                    )}
                    {typeof tempBoardValues[i][j] !== "string" &&
                      typeof boardValues[i][j] !== "string" && (
                        <div
                          className={classNames(
                            "tile",
                            specialScore && `tile-${specialScore}`
                          )}
                          data-row={i}
                          data-col={j}
                          key={`tile${i}.${j}`}
                        >
                          <div className="decal" data-row={i} data-col={j}>
                            {addLetters && specialScore.toUpperCase()}
                          </div>
                        </div>
                      )}
                  </>
                );
              })}
            </div>
          );
        })}{" "}
      </div>{" "}
    </div>
  );
};

export default ScrabbleBoard2;
