import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { modifyHand } from "../reducers/handSlice"
import { addLetterToBoard } from "../reducers/boardValuesSlice"
import $ from "jquery";
import Letter from "./Letter";
import _ from 'lodash';

const LETTER_COUNTS = {
  A: 9,
  B: 2,
  C: 2,
  D: 4,
  E: 12,
  F: 2,
  G: 3,
  H: 2,
  I: 9,
  J: 1,
  K: 1,
  L: 4,
  M: 2,
  N: 6,
  O: 8,
  P: 2,
  Q: 1,
  R: 6,
  S: 4,
  T: 6,
  U: 4,
  V: 2,
  W: 2,
  X: 1,
  Y: 2,
  Z: 1,
  "": 2,
};

const Hand = () => {
  const hand = useSelector((state) => state.hand);
  const [lettersLeft, setLettersLeft] = useState([]);
  const [count, setCount] = useState(0);
  const dispatch = useDispatch();

  const shuffle = (array) => {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  };

  useEffect(() => {
    let letters = [];
    Object.keys(LETTER_COUNTS).forEach((letter) => {
      for (let i = 0; i < LETTER_COUNTS[letter]; i++) {
        letters.push(letter);
      }
    });
    letters = shuffle(letters);
    dispatch(modifyHand(letters.slice(0, 7)))
    setCount(count + 1);
    setLettersLeft(letters.slice(7));
  }, []);

  return (
    <div className="hand">
      {hand.map((letter, i) => {
        return (
          <Letter
            letter={letter}
            key={`draggable-${i}.${letter}.${count}`}
            idx={i}
            isInHand={true}
          />
        );
      })}
    </div>
  );
};

export default Hand;
