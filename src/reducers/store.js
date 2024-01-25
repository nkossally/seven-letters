import { configureStore } from '@reduxjs/toolkit'
import  boardValuesReducer from './boardValuesSlice'
export default configureStore({
  reducer: {
    boardValues: boardValuesReducer
  },
})