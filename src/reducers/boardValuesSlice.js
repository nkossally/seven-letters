import { createSlice, current } from "@reduxjs/toolkit";
import { createEmptyBoard } from "../util";

export const boardValuesSlice = createSlice({
  name: "boardValues",
  initialState: createEmptyBoard(),
  reducers: {
    addLetterToBoard: (state, action) => {
      const row = action.payload.row;
      const col = action.payload.col;
      state[row][col] = action.payload.letter;
    },
  },
});

export const { addLetterToBoard } = boardValuesSlice.actions;

export default boardValuesSlice.reducer;
