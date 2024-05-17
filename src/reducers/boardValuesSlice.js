import { createSlice, current } from "@reduxjs/toolkit";
// import { createEmptyBoard } from "../util";

const BOARD_SIZE = 15;
const createEmptyBoard = () => {
  const arr = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    arr.push([]);
  }
  return arr;
};

export const boardValuesSlice = createSlice({
  name: "boardValues",
  initialState: createEmptyBoard(),
  reducers: {
    addLetterToBoard: (state, action) => {
      const row = action.payload.row;
      const col = action.payload.col;
      state[row][col] = action.payload.letter;
    },
    removeLetterFromBoard: (state, action) => {
      const row = action.payload.row;
      const col = action.payload.col;
      state[row][col] = undefined;
    },
  },
});

export const { addLetterToBoard, removeLetterFromBoard } = boardValuesSlice.actions;

export default boardValuesSlice.reducer;
