import { useState, useEffect } from "react";
import ScrabbleBoard2 from "./components/ScrabbleBoard2";
import InstructionsModal from "./components/InstructionsModal";
import Hand from "./components/Hand";
import "./styles.scss";
import { BOARD_SIZE } from "./consts";

function App() {
  const [placedLetters, setPlacedLetters] = useState([]);

  useEffect(() => {
    const arr = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      arr.push([]);
    }
    setPlacedLetters(arr);
  }, []);

  return (
    <>
      <InstructionsModal />
      <Hand placedLetters={placedLetters} setPlacedLetters={setPlacedLetters} />
      <ScrabbleBoard2
        placedLetters={placedLetters}
        setPlacedLetters={setPlacedLetters}
      />
    </>
  );
}

export default App;
