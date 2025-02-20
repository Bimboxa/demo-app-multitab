import {createSlice} from "@reduxjs/toolkit";

const settingsInitialState = {
  //
  servicesConfig: {},
  servicesConfigQrCode: null,
  //
  servicesConfigIsReady: false, // for async loading of the file.
  //
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState: settingsInitialState,
  reducers: {
    setServicesConfig: (state, action) => {
      state.servicesConfig = action.payload;
    },
    setServicesConfigQrCode: (state, action) => {
      state.servicesConfigQrCode = action.payload;
    },
    setServicesConfigIsReady: (state, action) => {
      state.servicesConfigIsReady = action.payload;
    },
  },
});

export const {
  setServicesConfig,
  setServicesConfigQrCode,
  setServicesConfigIsReady,
  //
} = settingsSlice.actions;

export default settingsSlice.reducer;
