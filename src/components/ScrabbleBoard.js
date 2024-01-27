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

const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]];

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
    let rows = rowsAndCols.rows;
    let cols = rowsAndCols.cols;
    if(rows.length > 1 && cols.length > 1) return;
    let word = "";
    const letterCount = Math.max(rows.length, cols.length)
    if(!getIsContinuousWord(rows, cols)) return;

    if(rows.length > 1){
      word =  getVerticalWordAtCoordinate(rows[0], cols[0])
    } else {
      word = getHorizontalWordAtCoordinate(rows[0], cols[0])
    }

    if(turns > 1 && !getIsConnectedToPrevWord(rows, cols)) return;

    console.log("word", word);
    if (word.length >= 2) {
      const definition = await lookUpWord(word);
      console.log("definition", definition)
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
        if (getTempLetterAtCoordinate(i, j)) {
          rows.add(i);
          cols.add(j);
        }
      }
    }
    const rowsArr = Array.from(rows).sort((a, b) => a - b)
    const colsArr = Array.from(cols).sort((a, b) => a - b)

    return { rows: rowsArr, cols: colsArr };
  };

  const getIsContinuousWord = (rows, cols) =>{
    if(rows.length === 1 && cols.length === 1) return true;
    let dx = 0;
    let dy = 0;
    let dist;
    let result = true;
    if(rows.length > 1){
      dx = 1;
      dist = rows[rows.length - 1] - rows[0]
    } else {
      dy = 1;
      dist = cols[cols.length - 1] - cols[0]
    }
    let x = rows[0];
    let y = cols[0]
    
    for(let i = 0; i < dist; i++){
      x += dx;
      y += dy;
      if(!getLetterAtCoordinate(x, y) && !getTempLetterAtCoordinate(x,  y)){
        result = false;
        break;
      }
    }
    return result;
  }

  const getLetterAtCoordinate = (x, y) =>{
    return isOnBoard(x, y) ? boardValues[x][y] : undefined;
  }

  const getTempLetterAtCoordinate = (x, y) =>{
    return isOnBoard(x, y) ? tempBoardValues[x][y]: undefined;
  }

  const getIsConnectedToPrevWord = (rows, cols) =>{
    let result = false;
    if(rows.length > 1){
      const col = cols[0]
      rows.forEach(row =>{
        if(getAdjacentToPlacedLetter(row, col)){
          result = true;
        }
      })

    } else {
      const row = rows[0]
      cols.forEach(col =>{
        if(getAdjacentToPlacedLetter(row, col)){
          result = true;
        }
      })
    }
    return result
  }

  const getAdjacentToPlacedLetter = (x, y) =>{
    let result = false;
    DIRS.forEach(dir =>{
      const x1 = x + dir[0];
      const y1 = y + dir[1]
      if(isOnBoard(x1, y1) && getLetterAtCoordinate(x1, y1)){
        result = true;
      }
    })
    return result;
  }

  const isOnBoard = (x, y) =>{
    return x >= 0 && x < BOARD_SIZE && y>= 0 && y < BOARD_SIZE;
  }

  const getVerticalWordAtCoordinate = (x, y) =>{
    let currX = x;
    let word = "";
    while(getTempLetterAtCoordinate(currX, y) || getLetterAtCoordinate(currX, y)){
      word += getTempLetterAtCoordinate(currX, y) || getLetterAtCoordinate(currX, y)
      currX++;
    }
    currX = x - 1;
    while(getTempLetterAtCoordinate(currX, y) || getLetterAtCoordinate(currX, y)){
      word = getTempLetterAtCoordinate(currX, y) || getLetterAtCoordinate(currX, y) + word
      currX--;
    }
    return word;
  }

  const getHorizontalWordAtCoordinate = (x, y) =>{
    let currY = y;
    let word = "";
    while(getTempLetterAtCoordinate(x, currY) || getLetterAtCoordinate(x, currY)){
      word += getTempLetterAtCoordinate(x, currY) || getLetterAtCoordinate(x, currY)
      currY++;
    }
    currY = y - 1;
    while(getTempLetterAtCoordinate(x, currY) || getLetterAtCoordinate(x, currY)){
      word = getTempLetterAtCoordinate(x, currY) || getLetterAtCoordinate(x, currY) + word
      currY--;
    }
    return word;
  }


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
