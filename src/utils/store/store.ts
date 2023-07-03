import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import userReducer from "./user.slice";
import rememberMeReducer from "./remember.slice";
import formReducer from "../utils/Form.Utils";
import dynamicDropDownReducer from "../../components/Form/DynamicDropDown/DynamicDropDown.slice";

import { Action, ThunkAction } from "@reduxjs/toolkit";
import {
  FLUSH, PAUSE,
  PERSIST, persistReducer, PURGE,
  REGISTER, REHYDRATE
} from "redux-persist"; 
import emailSlice from "./email.slice";
const persistConfig = {
  key: process.env.REACT_APP_STORE_KEY,
  blacklist: ['form','dropDown'],
  storage,
};

const reducers = combineReducers({
  user: userReducer,
  form: formReducer,
  dynamicDropDown: dynamicDropDownReducer,
  rememberMe: rememberMeReducer,
  email: emailSlice
});
const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
