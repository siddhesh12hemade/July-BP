import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

export interface RememberMeInterface{
        remember?: boolean,
        email?: string,
        pass?:string    
}

const initialState: RememberMeInterface = {
    remember: null,
    email: null,
    pass:null
}

export const rememberMeSlice = createSlice({
    name: "remember",
    initialState:initialState,
    reducers: {
        setRememberMeData: (state, { payload }) => payload        
    },
});

export const { setRememberMeData } = rememberMeSlice.actions;
export default rememberMeSlice.reducer;

export const selectRememberMeData = (state: RootState) => state.rememberMe
