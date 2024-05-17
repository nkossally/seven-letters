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

export const tempBoardValuesSlice = createSlice({
  name: "tempBoardValues",
  initialState: createEmptyBoard(),
  reducers: {
    addTempLetterToBoard: (state, action) => {
      const row = action.payload.row;
      const col = action.payload.col;
      state[row][col] = action.payload.letter;
    },
    removeTempLetterFromBoard: (state, action) => {
      const row = action.payload.row;
      const col = action.payload.col;
      state[row][col] = undefined;
    },
  },
});

export const { addTempLetterToBoard, removeTempLetterFromBoard } = tempBoardValuesSlice.actions;

export default tempBoardValuesSlice.reducer;
