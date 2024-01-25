import Draggable from "react-draggable";

const Letter = ({ letter, onStop }) => {
  return (
    <Draggable onStop={onStop}>
      <div className="hand-tile">{letter}</div>
    </Draggable>
  );
};

export default Letter;
