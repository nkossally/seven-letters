# Scrabble Design Doc

## Section 1 - Description
 
This project is a web implementation of the board game Scrabble using React and Redux.

## Section 2 - Overview

### 2.1 Purpose
 


### 2.2 Scope
 
Most of the basic game play of Scrabble should be supported. This entails the following:
Render a 15 by 15 grid.
Enable players to drag and drop tiles from their hand to the Scrabble board.
Verify player moves. A player’s placement of letters on the board is valid if the letters are continuous, if they connect to a previous word placed on the board, and if all words that the tiles form are in the dictionary.
Automate computer moves after each player move.
Provide UI indicating when moves are invalid and when the computer passes.
Calculate scores based on the rules of Scrabble. Each letter has a value. In addition, special boxes on the board triple and double letter and word scores.

### 2.3 Out of Scope
 
Some features of the board game Scrabble are out of scope for this project’s MVP. These features may be considered for future implementations.
Add blank tiles. Blank tiles can stand in for any letter and are worth no points.

## Section 3 – System Architecture

### 3.1 Components
 
There are two basic components, Letter and Board.
Letter: Props for this component include letter, board row, board column, and hand index. Letters can be in a player’s hand, in the computer’s hand, or on the board. Props determine the component’s behavior. For example, letters are draggable only if they are either in a player’s hand, or temporarily placed on the board and not yet submitted.
Board: This is a 15 by 15 grid. No props are needed. Letters that are placed on the board, temporarily or permanently, can be retrieved from Redux state.

### 3.2 Data Structures and Algorithms

DAWG Directed Acyclical Word Graph, backtracking Appel and Jacobson's "The World's Fastest Scrabble Program"

## Section 4 – Technologies
 
Beyond using React and Redux, this app uses the “react-draggable” library to build draggable letter components. In addition, Material UI is used to render modals and buttons.

Originally, in order to validate words, I used a free dictionary API (https://api.dictionaryapi.dev/api/v2/entries/en/). However, fetching data incurred high latencies. In addition, rate limiters stopped the app from working after making too many fetches. Ultimately, I decided to add a local text file containing words from an official Scrabble library to the app itself.

## Section 5 – References

Inspiration for styling the board was drawn from a public source here.


aspell -d en dump master | aspell -l en expand > words.txt

Collins Scrabble Words (2019). 279,496 words. Words only.
