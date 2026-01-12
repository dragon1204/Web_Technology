import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import { combineReducers } from "redux";
import gardenSlice from "./slice/garden.slice";
import userSlice from "./slice/user.slice";
import gardenRealtimeSlice from "./slice/gardenRealTime.slice";

const rootReducer = combineReducers({
    gardens: gardenSlice,
    user: userSlice,
    gardenRealtime: gardenRealtimeSlice,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
