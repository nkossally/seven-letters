import classNames from "classnames";
import { BOARD_SIZE, LETTER_TO_SCORE } from "../consts";
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
import AllWords from "../words.txt"

const DIRS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];
const MID_IDX = 7;
const delay = ms => new Promise(res => setTimeout(res, ms));


const ScrabbleBoard2 = () => {
  const [turns, setTurns] = useState(1);
  const [currScore, setCurrScore] = useState(0);
  const [placedLettersArr, setPlacedLettersArr] = useState([]);
  const [placedTempLettersArr, setPlacedTempLettersArr] = useState([]);
  const [localDictionary, setLocalDictionary] = useState(new Set())

  const boardValues = useSelector((state) => state.boardValues);
  const tempBoardValues = useSelector((state) => state.tempBoardValues);
  const lettersLeft = useSelector((state) => state.lettersLeft);
  const hand = useSelector((state) => state.hand);
  const computerHand = useSelector((state) => state.computerHand);
  const score = useSelector((state) => state.score);
  const [count, setCount] = useState(0)
  const dispatch = useDispatch();

  var boardSize = BOARD_SIZE - 1;

  useEffect(() => {
    startGame();
  }, []);

  useEffect(()=>{
    // let file = "./words.text";
    // const handleFileRead = e => {
    //   let content = fileReader.result;
    //   // let text = deleteLines(content, 3);
    //   // content = cleanContent(content);
    //   // … do something with the 'content' …
    //   console.log(content);
    // };
    // let fileReader = new FileReader();
    // fileReader.onloadend = handleFileRead;
    // console.log(typeof  "./words.text")
    // fileReader.readAsText( "./words.text");
    const blarg = async ()=>{
      const result = await fetch(AllWords)
      const text = await result.text()
      const dict = text.split("\n").map(elem => elem.toUpperCase());
      setLocalDictionary(new Set(dict))
    }
    blarg()
  
  
  }, [])

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

  const submitWord = async () => {
    if(count > 500) return;
    setCount(count + 1)
    const rowsAndCols = getPlacedLettersRowsAndCols();
    console.log("rowsAndCols", rowsAndCols)
    let rows = rowsAndCols.rows;
    let cols = rowsAndCols.cols;
    if (rows.length > 1 && cols.length > 1) return;
    let word = "";
    if (!getIsContinuousWord(rows, cols)) return;
    if (turns > 1 && !getIsConnectedToPrevWord(rows, cols)) return;
    if (turns === 1 && (!rows.includes(MID_IDX) || !cols.includes(MID_IDX)))
      return;

    let allWordsInDict = true;

    console.log("we here")

    if (rows.length > 1) {
      word = getVerticalWordAtCoordinate(rows[0], cols[0]);
      if (word.length > 1) {
        // await delay(50)
        // const definition = await lookUpWord(word);
        const definition = localDictionary.has(word)
        console.log(word);
        if (!definition) allWordsInDict = false;
      }
      rows.forEach(async (row) => {
        const word = getHorizontalWordAtCoordinate(row, cols[0]);
        if (word.length > 1) {
          console.log(word);
          // await delay(50)
          // const definition = await lookUpWord(word);
          const definition = localDictionary.has(word)

          if (!definition) allWordsInDict = false;
        }
      });
    } else {
      word = getHorizontalWordAtCoordinate(rows[0], cols[0]);
      if (word.length > 1) {
        // await delay(50)
        // const definition = await lookUpWord(word);
        const definition = localDictionary.has(word)

        console.log(word);
        if (!definition) allWordsInDict = false;
      }
      rows.forEach(async (row) => {
        const word = getVerticalWordAtCoordinate(row, cols[0]);
        if (word.length > 1) {
          console.log(word);
          // await delay(50)
          // const definition = await lookUpWord(word);
          const definition = localDictionary.has(word)

          if (!definition) allWordsInDict = false;
        }
      });
    }
    if (allWordsInDict) {
      permanentlyPlaceLetters();
      dispatch(updateScore(score + currScore));
    }
    setCurrScore(0);
            // await delay(80)

    return true;
  };

  const permanentlyPlaceLetters = () => {
    let letterCount = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const letter = getTempLetterAtCoordinate(i, j);
        if (letter) {
          dispatch(addLetterToBoard({ row: i, col: j, letter }));
          dispatch(removeTempLetterFromBoard({ row: i, col: j }));
          letterCount++;
        }
      }
    }

    dispatch(modifyHand(hand.concat(lettersLeft.slice(0, letterCount))));
    dispatch(modifyLettersLeft(lettersLeft.slice(letterCount)));
    setTurns(turns + 1);
  };

  const getPlacedLettersRowsAndCols = () => {
    const rows = new Set();
    const cols = new Set();
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (getTempLetterAtCoordinate(i, j)) {
          rows.add(i);
          cols.add(j);
        }
      }
    }
    const rowsArr = Array.from(rows).sort((a, b) => a - b);
    const colsArr = Array.from(cols).sort((a, b) => a - b);

    return { rows: rowsArr, cols: colsArr };
  };

  const getIsContinuousWord = (rows, cols) => {
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
      if (!getLetterAtCoordinate(x, y) && !getTempLetterAtCoordinate(x, y)) {
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

  const getVerticalWordAtCoordinate = (x, y) => {
    let currX = x;
    let word = "";
    let wordScore = 0;
    let multiplier = 1;
    while (
      getTempLetterAtCoordinate(currX, y) ||
      getLetterAtCoordinate(currX, y)
    ) {
      word +=
        getTempLetterAtCoordinate(currX, y) || getLetterAtCoordinate(currX, y);
      const letterScoreObj = calculateScoreFromLetter(currX, y);
      wordScore += letterScoreObj.letterPoints;
      multiplier *= letterScoreObj.wordMultiplier;
      currX++;
    }
    currX = x - 1;
    while (
      getTempLetterAtCoordinate(currX, y) ||
      getLetterAtCoordinate(currX, y)
    ) {
      word =
        getTempLetterAtCoordinate(currX, y) ||
        getLetterAtCoordinate(currX, y) + word;
      const letterScoreObj = calculateScoreFromLetter(currX, y);
      wordScore += letterScoreObj.letterPoints;
      multiplier *= letterScoreObj.wordMultiplier;
      currX--;
    }
    wordScore *= multiplier;
    console.log(word, wordScore);
    setCurrScore(currScore + wordScore);
    return word;
  };

  const getHorizontalWordAtCoordinate = (x, y) => {
    let currY = y;
    let word = "";
    let wordScore = 0;
    let multiplier = 1;
    while (
      getTempLetterAtCoordinate(x, currY) ||
      getLetterAtCoordinate(x, currY)
    ) {
      word +=
        getTempLetterAtCoordinate(x, currY) || getLetterAtCoordinate(x, currY);
      const letterScoreObj = calculateScoreFromLetter(x, currY);
      wordScore += letterScoreObj.letterPoints;
      multiplier *= letterScoreObj.wordMultiplier;
      currY++;
    }
    currY = y - 1;
    while (
      getTempLetterAtCoordinate(x, currY) ||
      getLetterAtCoordinate(x, currY)
    ) {
      word =
        getTempLetterAtCoordinate(x, currY) ||
        getLetterAtCoordinate(x, currY) + word;
      const letterScoreObj = calculateScoreFromLetter(x, currY);
      wordScore += letterScoreObj.letterPoints;
      multiplier *= letterScoreObj.wordMultiplier;
      currY--;
    }
    wordScore *= multiplier;
    console.log(word, wordScore);
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

  const handleComputerStep = async () => {
    let result;
    let n = 4;

    while (n > 1) {
      const perms = getAllPermutationsOfSizeN(computerHand, n);

      for (let i = 0; i < perms.length; i++) {
        result = await tryToPlaceComputerLetters(perms[i]);
        if (result) break;
      }
      if (result) break;
      n--;
    }

    return result;
  };

  const tryToPlaceComputerLetters = async (arr) => {
    let result;
    for (let i = 0; i < placedLettersArr.length; i++) {
      const boardLetterObj = placedLettersArr[i];
      const row = boardLetterObj.row;
      const col = boardLetterObj.col;
      result = await placeLettersAroundSpot(row, col, arr);

      if (result) break;
    }
    return result;
  };

  const placeLettersAroundSpot = async (i, j, arr) => {
    let result;
    // horizontal
    for (let num = -arr.length; num < arr.length; num++) {
      if (num === 0) return;
      if (result) break;
      let didPlaceLetter = true;
      for (let idx = 0; idx < arr.length; idx++) {
        let stepsAway = num + idx !== 0 ? num + idx : 1;
        const dx = 0;
        const dy = stepsAway < 0 ? -1 : 1;
        const n = Math.abs(stepsAway);
        const position = getEmptyBlockNSpacesFromCoordinate(i, j, n, dx, dy);
        console.log("getEmptyBlockNSpacesFromCoordinate", i, j, n, dx, dy)
        if (position) {
          const row = position.row;
          const col = position.col;
          dispatch(addTempLetterToBoard({ row, col, letter: arr[idx] }));
        } else {
          didPlaceLetter = false;
        }
      }
      if (didPlaceLetter) {
        result = await submitWord();
      }
      removeAllTempLettersFromBoard();
    }
    // vertical
    for (let num = 0; num < 2 * arr.length; num++) {}

    return result;
  };

  const getEmptyBlockNSpacesFromCoordinate = (i, j, n, dx, dy) => {
    let x = i;
    let y = j;
    let result;
    let count = 0;
    while (isOnBoard(x + dx, y + dy)) {
      x += dx;
      y += dy;
      if (!getLetterAtCoordinate(x, y) && !getTempLetterAtCoordinate(x, y)) {
        count++;
      }
      if (count === n) {
        result = { row: x, col: y };
        break;
      }
    }
    return result;
  };

  const removeAllTempLettersFromBoard = () => {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const letter = getTempLetterAtCoordinate(i, j);
        // if (letter) {
          dispatch(removeTempLetterFromBoard({ row: i, col: j }));
        // }
      }
    }
  };

  const handleFirstComputerStep = async () =>{
    const perms = getAllPermutationsOfSizeN(computerHand, 5);
    let result;
    for(let i = 0; i < perms.length; i++){
      const perm = perms[i]
      const word = perm.join("");
      await delay(30)
      // const definition = await lookUpWord(word);
      const definition = localDictionary.has(word)

      if(definition){
        for(let i = 0; i < perm.length; i++){
          dispatch(addTempLetterToBoard({ row: 4 + i, col: 7, letter: perm[i] }));
          await submitWord()
        }
        break
      }
    }

  }

  return (
    <div id="js-board">
      <button onClick={submitWord}>press here</button>
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
