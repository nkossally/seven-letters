import { useSelector } from "react-redux";
import Letter from "./Letter";
import _ from "lodash";

const ComputerHand = () => {
  const computerHand = useSelector((state) => state.computerHand);

  return (
    <div className="hand">
      {computerHand.map((letter, i) => {
        return (
          <Letter
            letter={letter}
            key={`draggable-${i}.${letter}`}
            handIdx={i}
            isInComputerHand={true}
          />
        );
      })}
    </div>
  );
};

export default ComputerHand;
