import classNames from "classnames";
import { BOARD_SIZE } from "../consts";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Letter from "./Letter";
import { lookUpWord } from "../util";
import { removeTempLetterFromBoard } from "../reducers/tempBoardValuesSlice";
import { addLetterToBoard } from "../reducers/boardValuesSlice";
import { modifyHand } from "../reducers/handSlice";
import { modifyLettersLeft } from "../reducers/lettersLeftSlice";

const ScrabbleBoard2 = () => {
  const [turns, setTurns] = useState(1);
  const boardValues = useSelector((state) => state.boardValues);
  const tempBoardValues = useSelector((state) => state.tempBoardValues);
  const lettersLeft = useSelector((state) => state.lettersLeft);
  const hand = useSelector((state) => state.hand);
  const dispatch = useDispatch();

  var boardSize = BOARD_SIZE - 1;

  useEffect(() => {}, [
    JSON.stringify(tempBoardValues),
    JSON.stringify(boardValues),
    tempBoardValues.length,
    boardValues.length,
    turns,
  ]);

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
    const rowsAndCols = getPlacedLettersRowsAndCols();
    const rows = rowsAndCols.rows;
    const cols = rowsAndCols.cols;
    let word = "";
    const letterCount = Math.max(rows.size, cols.size)
    if (rows.size === 1) {
      const missingNumbers = getMissingConsecutiveNumbers(cols);
      let colsArr = Array.from(cols).sort((a, b) => a - b);
      const row = Array.from(rows)[0];
      const missingCol = missingNumbers[0];
      const boundaries = getBoundaries(colsArr, row, true);

      if (missingNumbers.length > 1) return;
      if (turns === 1 && missingNumbers.length > 0) return;
      if (turns > 1 && missingNumbers.length + boundaries.length === 0) return;
      if (
        turns > 1 &&
        typeof missingCol === "number" &&
        boardValues[row][missingCol] === undefined
      ) {
        return;
      }

      colsArr = colsArr.concat(boundaries).sort((a, b) => a - b);
      for (let i = colsArr[0]; i <= colsArr[colsArr.length - 1]; i++) {
        if (i === missingCol || boundaries.includes(i)) {
          word += boardValues[row][i];
        } else {
          word += tempBoardValues[row][i];
        }
      }

    }
    if (cols.size === 1) {
      const missingNumbers = getMissingConsecutiveNumbers(rows);
      let rowsArr = Array.from(rows).sort((a, b) => a - b);
      const col = Array.from(cols)[0];
      const missingRow = missingNumbers[0];
      const boundaries = getBoundaries(rowsArr, col, false);

      console.log("rowsArr", rowsArr, "col",col, "missingNumbers", missingNumbers, "boundaries", boundaries )

      if (missingNumbers.length > 1) return;
      if (turns === 1 && missingNumbers.length > 0) return;
      if (turns > 1 && missingNumbers.length + boundaries.length === 0) return;
      if (
        turns > 1 &&
        typeof missingRow === "number" &&
        boardValues[missingRow][col] === undefined
      ) {
        return;
      }

      rowsArr = rowsArr.concat(boundaries).sort((a, b) => a - b);
      for (let i = rowsArr[0]; i <= rowsArr[rowsArr.length - 1]; i++) {
        if (i === missingRow || boundaries.includes(i)) {
          word += boardValues[i][col];
        } else {
          word += tempBoardValues[i][col];
        }
      }
    }
    console.log("word", word);
    if (word.length >= 2) {
      const definition = await lookUpWord(word);
      if (definition) {
        for (let i = 0; i < BOARD_SIZE; i++) {
          for (let j = 0; j < BOARD_SIZE; j++) {
            const letter = tempBoardValues[i][j];
            if (letter) {
              dispatch(addLetterToBoard({ row: i, col: j, letter }));
              dispatch(removeTempLetterFromBoard({ row: i, col: j }));
            }
          }
        }
        dispatch(modifyHand(hand.concat(lettersLeft.slice(0, letterCount))));
        dispatch(modifyLettersLeft(lettersLeft.slice(letterCount)));
        setTurns(turns + 1);
      }
    }
  };

  const getPlacedLettersRowsAndCols = () => {
    const rows = new Set();
    const cols = new Set();
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (tempBoardValues[i][j] !== undefined) {
          rows.add(i);
          cols.add(j);
        }
      }
    }
    return { rows, cols };
  };

  const getMissingConsecutiveNumbers = (set) => {
    const missingNumbers = [];
    const arr = Array.from(set).sort((a, b) => a - b);
    for (let i = arr[0]; i <= arr[arr.length - 1]; i++) {
      if (!set.has(i)) {
        missingNumbers.push(i);
      }
    }
    return missingNumbers;
  };

  const getBoundaries = (set, num, isRow) => {
    const arr = Array.from(set).sort((a, b) => a - b);
    const lowerBound = arr[0] - 1;
    const upperBound = arr[arr.length - 1] + 1;
    let boundaries = [];
    if (isRow) {
      if (boardValues[num][lowerBound] !== undefined) {
        boundaries.push(lowerBound);
      }
      if (boardValues[num][upperBound] !== undefined) {
        boundaries.push(upperBound);
      }
    } else {
      if (
        boardValues[lowerBound] &&
        boardValues[lowerBound][num] !== undefined
      ) {
        boundaries.push(lowerBound);
      }
      if (
        boardValues[upperBound] &&
        boardValues[upperBound][num] !== undefined
      ) {
        boundaries.push(upperBound);
      }
    }
    return boundaries;
  };

  return (
    <div id="js-board">
      <button onClick={submitWord}>press here</button>
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
