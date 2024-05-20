import { createSlice, current } from "@reduxjs/toolkit";

export const zeroPointCoordinatesSlice = createSlice({
  name: "zeroPointCoordinates",
  initialState: {},
  reducers: {
    addZeroCoordinates: (state, action) => {
       state[action.payload] = true;
    },
    resetZeroPointCoordinates: (state, action) => {
        return {}
     },
  },
});

export const { addZeroCoordinates, resetZeroPointCoordinates } = zeroPointCoordinatesSlice.actions;

export default zeroPointCoordinatesSlice.reducer;
