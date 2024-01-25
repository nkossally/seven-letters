import { useState, useEffect } from "react";
import ScrabbleBoard2 from './components/ScrabbleBoard2';
import InstructionsModal from './components/InstructionsModal'
import Hand from './components/Hand';
import "./styles.scss";

const HAND_SIZE = 7;
const BOARD_SIZE = 15;

function App() {
  const [placedLetters, setPlacedLetters] = useState([]);

  useEffect(()=>{
    const arr = []
    for(let i = 0; i < BOARD_SIZE; i++){
      arr.push([])
    }
    setPlacedLetters(arr)
  }, [])

  return (
    <div >
      <InstructionsModal />
      <Hand placedLetters={placedLetters} setPlacedLetters={setPlacedLetters}/>
      <ScrabbleBoard2 placedLetters={placedLetters} setPlacedLetters={setPlacedLetters}/>
     </div>
  );
}

export default App;
