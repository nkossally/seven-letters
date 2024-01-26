import { configureStore } from '@reduxjs/toolkit'
import  boardValuesReducer from './boardValuesSlice'
import handReducer from './handSlice'
export default configureStore({
  reducer: {
    boardValues: boardValuesReducer,
    hand: handReducer
  },
})