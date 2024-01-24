import { useState, useEffect } from "react";
import { randomAtoZ, lookUpWord } from "./util";
import MultipleDragList from './components/multiple-list-dnd.component';
import ScrabbleBoard from './components/ScrabbleBoard';
import ScrabbleBoard2 from './components/ScrabbleBoard2';
import InstructionsModal from './components/InstructionsModal'
import Hand from './components/Hand';
import "./styles.scss";

const HAND_SIZE = 7;

function App() {

  return (
    <div >
      <InstructionsModal />
      <Hand />
      <ScrabbleBoard2 />
     </div>
  );
}

export default App;
