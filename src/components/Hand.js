import { useEffect, useState, useRef } from "react";
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

const Hand = ({setPlacedLetters, placedLetters}) => {
  const [hand, setHand] = useState([]);
  const [lettersLeft, setLettersLeft] = useState([]);
  const [count, setCount] = useState(0);

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
    setHand(letters.slice(0, 7));
    setCount(count + 1);
    setLettersLeft(letters.slice(7));
  }, []);

  var getHitElements = function (e) {
    var x = e.pageX;
    var y = e.pageY;
    var hitElements = [];

    $(":visible").each(function () {
      var offset = $(this).offset();
      //     console.log(offset)

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

  const onStop = (e, idx, letter) => {
    const elems = getHitElements(e);
    let row;
    let col;
    for (let i = 0; i < elems.length; i++) {
      const maybeRow = parseInt(elems[i][0].getAttribute("data-row"));
      const maybeCol = parseInt(elems[i][0].getAttribute("data-col"));
      if (!isNaN( maybeCol)  && !isNaN(maybeRow)) {
        row = maybeRow;
        col = maybeCol;
        const newPlacedLetters = _.cloneDeep(placedLetters)
        newPlacedLetters[row][col] = letter;
        setPlacedLetters(newPlacedLetters)
        setCount(count + 1)
        setHand(hand.slice(0, idx).concat(hand.slice(idx + 1)));
        break;
      }
    }
    if (!(typeof col === "number" && typeof row === "number")) {
      setCount(count + 1)
      setHand(hand)
    }
    console.log(row, col);
  };

  return (
    <div className="hand">
      {hand.map((letter, i) => {
        return (
          <Letter
            onStop={(e) => onStop(e, i, letter)}
            letter={letter}
            key={`draggable-${i}.${letter}.${count}`}
          />
        );
      })}
    </div>
  );
};

export default Hand;
