import { configureStore } from "@reduxjs/toolkit";
import boardValuesReducer from "./boardValuesSlice";
import tempBoardValuesReducer from "./tempBoardValuesSlice";
import handReducer from "./handSlice";
import lettersLeftReducer from "./lettersLeftSlice"
import scoreSliceReducer from "./scoreSlice";

export default configureStore({
  reducer: {
    boardValues: boardValuesReducer,
    tempBoardValues: tempBoardValuesReducer,
    hand: handReducer,
    lettersLeft: lettersLeftReducer,
    score: scoreSliceReducer, 
  },
});
