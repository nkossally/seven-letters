import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { modifyHand } from "../reducers/handSlice";
import {
  addLetterToBoard,
  removeLetterFromBoard,
} from "../reducers/boardValuesSlice";
import {
  addTempLetterToBoard,
  removeTempLetterFromBoard,
} from "../reducers/tempBoardValuesSlice";

import Draggable from "react-draggable";
import $ from "jquery";
import _ from "lodash";

const Letter = ({
  letter,
  handIdx,
  isInHand,
  boardRow,
  boardCol,
  permanentlyOnBoard,
}) => {
  const hand = useSelector((state) => state.hand);

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
    let row;
    let col;
    for (let i = 0; i < elems.length; i++) {
      const maybeRow = parseInt(elems[i][0].getAttribute("data-row"));
      const maybeCol = parseInt(elems[i][0].getAttribute("data-col"));
      if (!isNaN(maybeCol) && !isNaN(maybeRow)) {
        row = maybeRow;
        col = maybeCol;
        if (isInHand) {
          dispatch(
            modifyHand(hand.slice(0, handIdx).concat(hand.slice(handIdx + 1)))
          );
        } else {
          dispatch(removeTempLetterFromBoard({ row: boardRow, col: boardCol }));
        }
        dispatch(addTempLetterToBoard({ row, col, letter }));

        break;
      }
    }
    if (!(!isNaN(row) && !isNaN(col))) {
      if (isInHand) {
        // If the letter tile was not dragged to a spot on the board
        // trigger a re-render that snaps the letter back to the original hand placement.
        dispatch(modifyHand(hand.map((elem) => elem.toLowerCase())));
        setTimeout(() => {
          dispatch(modifyHand(hand));
        }, 0);
      } else {
        dispatch(modifyHand(hand.concat([letter])));
        dispatch(removeTempLetterFromBoard({ row: boardRow, col: boardCol }));
      }
    }
  };
  if (permanentlyOnBoard) return <div className="hand-tile-permanent">{letter}</div>;
  return (
    <Draggable onStop={onStop}>
      <div className="hand-tile">{letter}</div>
    </Draggable>
  );
};

export default Letter;
