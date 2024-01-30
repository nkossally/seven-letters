import { useSelector } from "react-redux";
import Letter from "./Letter";
import _ from "lodash";

const ComputerHand = ({selectedTiles}) => {
  const computerHand = useSelector((state) => state.computerHand);


  return (
    <div className="computer-hand">
      {computerHand.map((letter, i) => {
        return (
          <Letter
            letter={letter}
            selected={selectedTiles.includes(i)}
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
