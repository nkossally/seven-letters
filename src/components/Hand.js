import { useEffect, useState } from "react";
import $ from "jquery";
import Draggable from "react-draggable";

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
  const [hand, setHand] = useState([]);
  const [lettersLeft, setLettersLeft] = useState([]);

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
        offset.left + 50 > x &&
        offset.top < y &&
        offset.top + 50 > y
      ) {
        hitElements.push($(this));
      }
    });

    return hitElements;
  };

  const onStop = (e) => {
    const elems = getHitElements(e);
    elems.forEach(elem =>{

    console.log(elem[0].getAttribute("data-row"))
    console.log(elem[0].getAttribute("data-col"))

    })
  };

  const onDrag = () =>{
    
  }
  return (
    <div className="hand">
      {hand.map((letter, i) => {
        return (
          <Draggable onStop={onStop} key={`draggable-${i}`}>
            <div className="hand-tile">{letter}</div>
          </Draggable>
        );
      })}
    </div>
  );
};

export default Hand;
