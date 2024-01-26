import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { modifyHand } from "../reducers/handSlice";
import { addLetterToBoard } from "../reducers/boardValuesSlice";

import Draggable from "react-draggable";
import $ from "jquery";
import _ from "lodash";

const Letter = ({ letter, idx, isInHand }) => {
  const [count, setCount] = useState(0);
  const hand = useSelector((state) => state.hand);
  console.log("hand", hand);
  const boardValues = useSelector((state) => state.boardValues);

  const dispatch = useDispatch();

  var getHitElements = function (e) {
    var x = e.pageX;
    var y = e.pageY;
    var hitElements = [];

    $(":visible").each(function () {
      var offset = $(this).offset();

      if (
        offset.left < x &&
        offset.left + 30 > x &&
        offset.top < y &&
        offset.top + 30 > y
      ) {
        hitElements.push($(this));
      }
    });

    return hitElements;
  };

  const onStop = (e) => {
    const elems = getHitElements(e);
    console.log(elems);
    let row;
    let col;
    for (let i = 0; i < elems.length; i++) {
      const maybeRow = parseInt(elems[i][0].getAttribute("data-row"));
      const maybeCol = parseInt(elems[i][0].getAttribute("data-col"));
      if (!isNaN(maybeCol) && !isNaN(maybeRow)) {
        row = maybeRow;
        col = maybeCol;
        console.log(row, col);
        if (isInHand) {
          dispatch(modifyHand(hand.slice(0, idx).concat(hand.slice(idx + 1))));
        }
        dispatch(addLetterToBoard({ row, col, letter }));
        // setCount(count + 1)
        break;
      }
    }
    if (!(!isNaN(row) && !isNaN(col))) {
      if(isInHand){
      // If the letter tile was not dragged to a spot on the board
      // trigger a re-render that snaps the letter back to the original hand placement.
      dispatch(modifyHand(hand.map((elem) => elem.toLowerCase())));
      setTimeout(() => {
        dispatch(modifyHand(hand));
      }, 0);
    } else {
      dispatch(modifyHand(hand.concat([letter])));
    }

      // dispatch(modifyHand(hand.slice(0, idx).concat(hand.slice(idx + 1)).concat([letter])))
      setCount(count + 1);
    }
  };
  return (
    <Draggable onStop={onStop}>
      <div className="hand-tile">{letter}</div>
    </Draggable>
  );
};

export default Letter;
