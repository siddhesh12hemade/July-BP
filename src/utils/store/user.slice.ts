import { createSlice } from "@reduxjs/toolkit";
import { DEFAULT_BP, DEFAULT_ENTERPRISE } from "../constants/constants";
import { IBusinessPartner, IEnterprise, IUser } from "../interfaces/App.interface";
import { Helpers } from "../utils/Helpers";
import { RootState } from "./store";

const initialState: IUser = {
  id: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  roles: [],
  userType: [],
  userName: "",
  businessPartnerIds: [],
  currentBusinessPartnerId: "",
  logo: "",
  businessPartner: DEFAULT_BP,
  enterprise: DEFAULT_ENTERPRISE,  
  accessToken: "",
  sliderImages: [],
  tnc: {
    CONSENT: "",
    PRIVACY_POLICY: "",
    TERMS_AND_CONDITIONS: "",
    TERMS_OF_USE: "",
  },
};


export const userReducer = createSlice({
    name: "user",
    initialState: initialState,
    reducers: {
      setUser: (state, { payload }) => payload,
      logOut: (state, { payload }) => {
        Object.assign(state, initialState);        
        const { redirect, cb } = payload;
        if (redirect) { Helpers.navigateToNewPath(`${process.env.REACT_APP_BASE_PATH}/login`); }
        else if (cb) { cb(); }
      },
      setUserValue: (state, { payload }) => {
        const { key, value } = payload;
        state[key as keyof IUser] = value;
      }
   
    },
    
});

export const { setUser,logOut,setUserValue } = userReducer.actions;

export default userReducer.reducer;

export const selectUserState = (state: RootState): IUser => state.user;
export const selectUserType = (state: RootState): string[] => state.user.userType;
export const selectCurrentBusinessPartnerId = (state: RootState): string => state.user.currentBusinessPartnerId;
export const selectCurrentBusinessPartner = (state: RootState): IBusinessPartner => state.user.businessPartner;
export const selectBusinessPartnerIds = (state: RootState): string[] => state.user.businessPartnerIds;
export const selectEnterprise = (state: RootState): IEnterprise => state.user.enterprise;
export const selectEnterpriseId = (state: RootState): string => state.user.enterprise._id;
export const selectAccessToken = (state: RootState): string => state.user.accessToken;

