import { createSlice, current } from "@reduxjs/toolkit";

export const zeroPointCoordinatesSlice = createSlice({
  name: "zeroPointCoordinates",
  initialState: {},
  reducers: {
    addCoordinates: (state, action) => {
       state[action.payload] = true;
    },
    resetZeroPointCoordinates: (state, action) => {
        return {}
     },
  },
});

export const { addCoordinates, resetZeroPointCoordinates } = zeroPointCoordinatesSlice.actions;

export default zeroPointCoordinatesSlice.reducer;
