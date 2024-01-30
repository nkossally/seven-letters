import classNames from "classnames";
import { useSelector } from "react-redux";
import { BOARD_SIZE } from "../consts";
import Letter from "./Letter";
import { getSpecialTileScoreIdx } from "../util";
import { LETTER_TO_SCORE } from "../consts";

const ScrabbleBoard2 = () => {
  const boardValues = useSelector((state) => state.boardValues);
  const tempBoardValues = useSelector((state) => state.tempBoardValues);

  var boardSize = BOARD_SIZE - 1;

  const arr = Array(BOARD_SIZE).fill("");

  return (
    <>
      <div id="js-board">
        <div className="board">
          {arr.map((elem, i) => {
            return (
              <div className="row" key={`row${i}`}>
                {arr.map((elem, j) => {
                  const specialScore = getSpecialTileScoreIdx(i, j);
                  const addLetters =
                    specialScore &&
                    (i !== boardSize / 2 || j !== boardSize / 2);
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
    </>
  );
};

export default ScrabbleBoard2;
