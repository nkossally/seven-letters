import { useState, useEffect } from "react";
import { randomAtoZ, lookUpWord } from "./util";
import WordTile from "./components/WordTile";
import { Container } from "./Container";
import MultipleDragList from './components/multiple-list-dnd.component';
import "./styles.scss";

const HAND_SIZE = 7;

function App() {
  const [input, setInput] = useState("");
  const [hand, setHand] = useState([]);
  const [hasGameStarted, setHasGameStarted] = useState(false);

  useEffect(() => {
    if (!hasGameStarted) {
      let handBuilder = [];
      for (let i = 0; i < HAND_SIZE; i++) {
        const letter = randomAtoZ();
        handBuilder.push(letter);
      }
      setHand(handBuilder);
      setHasGameStarted(true);
    }
  }, [hasGameStarted]);

  const handleInput = (e) => {
    setInput(e.target.value);
  };

  return (
    <div className="App">
      <input onChange={handleInput}></input>
      <button onClick={() => lookUpWord(input)}> click me </button>
      <MultipleDragList hand={hand} />
    </div>
  );
}

export default App;
