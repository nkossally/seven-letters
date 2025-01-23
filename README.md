# Scrabble Design Doc

## Section 1 - Description
 
This project is a web implementation of the board game Scrabble using React/Redux on the frontend, Flask in the backend, and  Redis for storage. This repo contends the frontend code.

## Section 2 - Architecture

When a user starts a new game, a request is sent to the API to construct a DAWG (directeed acyclical word graph) of all valid words in the Scrabble dictionary. This DAWG is serialized and stored in a Redis server. When a user attempts to submit a word, a request is sent to the API containing game state, which is stored in Redux, and the attempted play. The API retrieves the DAWG from Redis and then validates or rejects the move. Similarly, when it is the computer's turn, the API retrieves game state from the frontend and the DAWG from Redis. The API then finds the longest word that the computer can play.

## Section 3 - Local Development
In order to test locally, download this repo and download the backend repo at https://github.com/nkossally/scrabble-backend.

From the fontend directory, start the React app with the command:  
npm run start

From backend directory, run the following commands:  
source venv/bin/activate  
flask run

To test and run Redis locally, run the following:  
redis-server



