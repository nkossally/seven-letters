import { useSelector } from "react-redux";
import Letter from "./Letter";
import _ from "lodash";

const Hand = () => {
  const hand = useSelector((state) => state.hand);

  return (
    <div className="hand">
      {hand.map((letter, i) => {
        return (
          <Letter
            letter={letter}
            // Add random number to the key in order to prevent a glitch in which,
            // when a tile is dragged and dropped, another tile with the same letter
            // is not also moved.
            key={`draggable-${i}.${letter}.${Math.random()}`}
            handIdx={i}
            isInHand={true}
          />
        );
      })}
    </div>
  );
};

export default Hand;
