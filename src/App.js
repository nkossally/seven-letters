import { useState, useEffect } from "react";
import { randomAtoZ, lookUpWord } from "./util";
import MultipleDragList from './components/multiple-list-dnd.component';
import ScrabbleBoard from './components/ScrabbleBoard';
import "./styles.scss";

const HAND_SIZE = 7;

function App() {

  return (
    // <div className="App">
      <ScrabbleBoard />
      // <MultipleDragList />
    // </div>
  );
}

export default App;
