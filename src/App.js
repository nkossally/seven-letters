import { useState } from "react";
import logo from "./logo.svg";
import {randomAtoZ, lookUpWord} from "./util"
import "./App.css";

function App() {
  const [input, setInput] = useState("");

  const handleInput = (e) => {
    setInput(e.target.value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <input onChange={handleInput}></input>
        <button onClick={() => lookUpWord(input)}> click me </button>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
