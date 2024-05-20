# Scrabble Design Doc

## Section 1 - Description
 
This project is a web implementation of the board game Scrabble using React and Redux.

## Section 2 - Overview

2.1 Purpose
 
The purpose of this project is to show how clean, well-designed code can manage the tens of thousands of calculations per second needed to automate the computer’s game play during the game of Scrabble.

2.2 Scope
 
Most of the basic game play of Scrabble should be supported. This entails the following:
Render a 15 by 15 grid.
Enable players to drag and drop tiles from their hand to the Scrabble board.
Verify player moves. A player’s placement of letters on the board is valid if the letters are continuous, if they connect to a previous word placed on the board, and if all words that the tiles form are in the dictionary.
Automate computer moves after each player move.
Provide UI indicating when moves are invalid and when the computer passes.
Calculate scores based on the rules of Scrabble. Each letter has a value. In addition, special boxes on the board triple and double letter and word scores.

2.2 Out of Scope
 
Some features of the board game Scrabble are out of scope for this project’s MVP. There are also some features of similar games, such as the New York Times Crossword App, that are not supported at this time. These features should be considered for future implementations.
Enable players to dump unwanted letters (incurring a punishment of having to pass a round).
Add blank tiles. Blank tiles can stand in for any letter and are worth no points.
 This project currently supports users dragging and dropping letter tiles from their hand onto the board. A future implementation could allow users to click a starting block and then type (instead of dragging) in order to place letters on the board. Double clicking could toggle between vertical and horizontal placements.
Make the app mobile friendly.

## Section 3 – System Architecture

3.1 Components
 
There are two basic components, Letter and Board.
Letter: Props for this component include letter, board row, board column, and hand index. Letters can be in a player’s hand, in the computer’s hand, or on the board. Props determine the component’s behavior. For example, letters are draggable only if they are either in a player’s hand, or temporarily placed on the board and not yet submitted.
Board: This is a 15 by 15 grid. No props are needed. Letters that are placed on the board, temporarily or permanently, can be retrieved from Redux state.

3.1 Game Engine
 
Most of the game handling logic can be found in the App component.

In order to keep track of where word tiles are, this app has, at most, three different “boards” in memory at any given time. One board contains all of the permanently placed tiles that have been validated and successfully submitted by player or computer gameplay. This board of “permanent” tiles is in Redux state. Another board, also in Redux state, contains tiles that players have temporarily placed, and have not yet successfully submitted. Finally, when the computer plays, it builds a “virtual board” upon which to try all placements of letters around previously played letters on the “real” board. The algorithm to test all placements of letters is a greedy algorithm that starts by trying to place all seven letters in the computer’s hand, then six, then five, etc. It is not necessary to store this virtual board in state. In fact, it is implausible to store this virtual board in state because of all the calculations that are done on this virtual board. Dispatching hundreds of thousands of actions to reducers for each computer move is not ideal and could easily create glitches (there are 7! = 5040 permutations of the letters in a hand). The virtual board is passed as a function argument.

## Section 4 – Technologies
 
Beyond using React and Redux, this app uses the “react-draggable” library to build draggable letter components. In addition, Material UI is used to render modals and buttons.

Originally, in order to validate words, I used a free dictionary API (https://api.dictionaryapi.dev/api/v2/entries/en/). However, fetching data incurred high latencies. In addition, rate limiters stopped the app from working after making too many fetches. Ultimately, I decided to add a local text file containing words from an official Scrabble library to the app itself.

## Section 5 – References

Inspiration for styling the board was drawn from a public source here.


aspell -d en dump master | aspell -l en expand > words.txt

Collins Scrabble Words (2019). 279,496 words. Words only.
