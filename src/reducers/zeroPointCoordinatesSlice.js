import { createSlice, current } from "@reduxjs/toolkit";

export const zeroPointCoordinatesSlice = createSlice({
  name: "zeroPointCoordinates",
  initialState: {},
  reducers: {
    addCoordinates: (state, action) => {
       state[action.payload] = true;
    },
  },
});

export const { addCoordinates } = zeroPointCoordinatesSlice.actions;

export default zeroPointCoordinatesSlice.reducer;
