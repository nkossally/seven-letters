import { useState, useEffect } from "react";
import ScrabbleBoard from "./components/ScrabbleBoard";
import InstructionsModal from "./components/InstructionsModal";
import Hand from "./components/Hand";
import "./styles.scss";
import { BOARD_SIZE } from "./consts";
import { ScopedCssBaseline } from "@mui/material";
import ScoreCard from "./components/ScoreCard";

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
      <ScoreCard />
      <Hand placedLetters={placedLetters} setPlacedLetters={setPlacedLetters} />
      <ScrabbleBoard
        
      />
    </>
  );
}

export default App;
