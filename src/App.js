import { useState, useEffect } from "react";
import ScrabbleBoard from "./components/ScrabbleBoard";
import InstructionsModal from "./components/InstructionsModal";
import Hand from "./components/Hand";
import ComputerHand from "./components/ComputerHand";

import "./styles.scss";
import ScoreCard from "./components/ScoreCard";

function App() {

  return (
    <>
      <InstructionsModal />
      <ScoreCard />
      <Hand />
      <ComputerHand />
      <ScrabbleBoard
        
      />
    </>
  );
}

export default App;
