import {configureStore} from "@reduxjs/toolkit";

import shapesReducer from "Features/shapes/shapesSlice";
import threedEditorReducer from "Features/threedEditor/threedEditorSlice";
import mapEditorReducer from "Features/mapEditor/mapEditorSlice";

export default configureStore({
  reducer: {
    shapes: shapesReducer,
    mapEditor: mapEditorReducer,
    threedEditor: threedEditorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
