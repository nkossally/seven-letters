import { configureStore } from "@reduxjs/toolkit";
import boardValuesReducer from "./boardValuesSlice";
import tempBoardValuesReducer from "./tempBoardValuesSlice";
import handReducer from "./handSlice";
import computerHandReducer from "./computerHandSlice";
import lettersLeftReducer from "./lettersLeftSlice"
import scoreSliceReducer from "./scoreSlice";
import computerScoreSliceReducer from "./computerScoreSlice";
import isComputersTurnSliceReducer from "./isComputersTurn.slice";
import selectedForDumpingHandIndicesReducer from "./selectedForDumpingHandIndicesSlice";

export default configureStore({
  reducer: {
    boardValues: boardValuesReducer,
    tempBoardValues: tempBoardValuesReducer,
    hand: handReducer,
    computerHand: computerHandReducer,
    lettersLeft: lettersLeftReducer,
    score: scoreSliceReducer, 
    computerScore: computerScoreSliceReducer,
    isComputersTurn: isComputersTurnSliceReducer,
    selectedForDumpingHandIndices: selectedForDumpingHandIndicesReducer,
  },
});
