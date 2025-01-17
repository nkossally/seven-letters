# Scrabble Design Doc

## Section 1 - Description
 
This project is a web implementation of the board game Scrabble using React and Redux.

## Section 2 - Overview

### 2.1 Purpose
 
Use React and other libraries to render an easy to use and understand implementation of Scrabble. Use efficient data structures and algorithms to optimize the speed at which the computer finds 
moves that maximize the number of tiles played. The underlying algorithm does not maximize for points. It maximizes for letters played.

### 2.2 Scope
 
Most of the basic game play of Scrabble should be supported. This entails the following:
Render a 15 by 15 grid.
Enable players to drag and drop tiles from their hand to the Scrabble board.
Verify player moves. A player’s placement of letters on the board is valid if the letters are continuous, if they connect to a previous word placed on the board, and if all words that the tiles form are in the dictionary.
Automate computer moves after each player move.
Provide UI indicating when moves are invalid and when the computer passes.
Calculate scores based on the rules of Scrabble. Each letter has a value. In addition, special boxes on the board triple and double letter and word scores.

### 2.3 Out of Scope
 
One feature of the board game Scrabble, blank tiles, is out of scope for this project’s MVP. 

## Section 3 – System Architecture

This project uses React to build components. The benefits of React include efficent rendering due to its virtual DOM, and reusable components.
This project uses Redux for state management. Among other variables, player hand, computer hand, played letters and letters staged on the board are stored in global state. Storing these variables in global states avoids prop drilling.

### 3.1 Components
 
There are five basic components to this project: App, ScrabbleBoard, Hand, ComputerHand and Letter. App controls game logic and renders the ScrabbleBoard. ScrabbleBoard contains the layout of the game, and contains the child components Hand and ComputerHand. The two hand components render Letter components.
Props for the Letter component include letter, board row, board column, and hand index. Letters can be in a player’s hand, in the computer’s hand, or on the board. Props determine the component’s behavior. For example, letters are draggable only if they are either in a player’s hand, or temporarily placed on the board and not yet submitted.

### 3.2 Data Structures and Algorithms

The efficient data structure that enables the word search algorithm is a trie. When the game loads, a text file containing valid Scrabble words is parsed and converted into a trie. The trie structure enables the computer to only try to place words that exist, instead of every permutation of letters in the computer's hand.
In "The World's Fastest Scrabble Program," Appel and Jacobson explain how they used a Directed Acyclical Word Graphs (DAWG) to make their Scrabble Solver algorithm efficient. DAWGs are like tries, but take up much less space. In the future, this project can add a python backend that implements a DAWG for storing the dictionary and searching for the best word to place.

## Section 4 – Technologies
 
Beyond using React and Redux, this app uses the “react-draggable” library to build draggable letter components. In addition, Material UI is used to render modals and buttons.

Originally, in order to validate words, I used a free dictionary API (https://api.dictionaryapi.dev/api/v2/entries/en/). However, fetching data incurred high latencies. In addition, rate limiters stopped the app from working after making too many fetches. Ultimately, I decided to add a local text file containing words from an official Scrabble library to the app itself.

## Section 5 – References

Inspiration for styling the board was drawn from a public source here.


aspell -d en dump master | aspell -l en expand > words.txt

Collins Scrabble Words (2019). 279,496 words. Words only.
