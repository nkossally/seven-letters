import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { modifyHand } from "../reducers/handSlice";
import { modifyLettersLeft } from "../reducers/lettersLeftSlice";
import Letter from "./Letter";
import { LETTER_COUNTS, shuffle } from "../util";
import _ from "lodash";

const Hand = () => {
  const hand = useSelector((state) => state.hand);
  const lettersLeft = useSelector((state) => state.lettersLeft);
  const [count, setCount] = useState(0);
  const dispatch = useDispatch();
  console.log("hand size", hand.length);

  useEffect(() => {
    let letters = [];
    Object.keys(LETTER_COUNTS).forEach((letter) => {
      for (let i = 0; i < LETTER_COUNTS[letter]; i++) {
        letters.push(letter);
      }
    });
    letters = shuffle(letters);
    dispatch(modifyHand(letters.slice(0, 7)));
    dispatch(modifyLettersLeft(letters.slice(7)));
    setCount(count + 1);
  }, []);

  return (
    <div className="hand">
      {hand.map((letter, i) => {
        return (
          <Letter
            letter={letter}
            key={`draggable-${i}.${letter}.${count}`}
            handIdx={i}
            isInHand={true}
          />
        );
      })}
    </div>
  );
};

export default Hand;
