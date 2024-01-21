import classNames from "classnames";
const ScrabbleBoard = () => {
  var boardSize = 14;
  var tileScore = {};
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
  const arr = Array(15).fill("");
  const toTileIndex = (row, column) => {
    var boardLen = 15;
    if (row < boardLen && row >= 0 && column < boardLen && column >= 0) {
      return row * boardLen + column;
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

  return (
    <div id="js-board">
      <div className="board">
        {arr.map((elem, i) => {
          return (
            <div className="row" key={`row${i}`}>
              {arr.map((elem, j) => {
                const specialScore = getSpecialTileScoreIdx(i, j);
                const addLetters =
                  specialScore && (i !== boardSize / 2 || j !== boardSize / 2);
                return (
                  <div
                    className={classNames(
                      "tile",
                      specialScore && `tile-${specialScore}`
                    )}
                    data-row={i}
                    data-col={j}
                    key={`tile${i}.${j}`}
                  >
                    <div className="decal">
                      {" "}
                      {addLetters && specialScore.toUpperCase()}
                    </div>
                    <input maxLength={1} readOnly={1}></input>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>{" "}
    </div>
  );

  // tabletop.append(board);
  // // listener for tile keydown event
  // tabletop.on('keydown', '.tile input', function(event) {
  //   var elem = $(this);
  //   var ltr = event.key;
  //   var keyCode = event.keyCode;
  //   // only update on alphabet char
  //   if(keyCode >= 65 && keyCode <= 90) {
  //     elem.val(ltr);
  //     elem.addClass('filled');
  //     elem.parent(".tile").attr("data-value", sb.letterValue(ltr));
  //   }
  //   // clear on backspace or delete
  //   else if(keyCode == 8 || keyCode == 46) {
  //     elem.removeClass('filled');
  //     elem.parent(".tile").removeAttr("data-value");
  //   }
  //   // allow change
  //   return true;
  // });
};

export default ScrabbleBoard;
