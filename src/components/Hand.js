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
            key={`draggable-${i}.${letter}`}
            handIdx={i}
            isInHand={true}
          />
        );
      })}
    </div>
  );
};

export default Hand;
