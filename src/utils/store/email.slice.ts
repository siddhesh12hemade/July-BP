import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

export const emailReducer = createSlice({
    name: "email",
    initialState: {
        emailId: null,
    },
    reducers: {
        setEmailIdRedux: (state, action) => {
            state.emailId = action.payload;                        
        }        
    },
});

export const { setEmailIdRedux } = emailReducer.actions;
export default emailReducer.reducer;

export const selectEmailId = (state: RootState): string => state.email.emailId;
