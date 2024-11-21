# Scrabble Design Doc

## Section 1 - Description
 
This project is a web implementation of the board game Scrabble using React/Redux on the frontend, Flask in the backend, and  Redis for storage. This repo contends the frontend code.

## Section 2 - Architecture

User actions trigger requests to the API. The API retrieves game state from Redis, changes game state, serializes game state and sends the serialized state to a Redis database, and then sends game state to the frontend.