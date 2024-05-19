import { createSlice, current } from "@reduxjs/toolkit";

export const resolvedWordSlice = createSlice({
  name: "resolvedWord",
  initialState: "",
  reducers: {
    setResolvedWord: (state, action) => {
       return action.payload;
    },
  },
});

export const { setResolvedWord } = resolvedWordSlice.actions;

export default resolvedWordSlice.reducer;
