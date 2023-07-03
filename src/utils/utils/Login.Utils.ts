import validator from "validator";
import { BaseErrorObject } from "../constants/constants";
import { IErrors, ILoginRequest, ILoginState, IOTPLoginRequest, ISendLoginCodeReq } from "../interfaces/Login.interface";
import i18n from "../translations";
import _ from "lodash";
import { DEFAULT_BP, DEFAULT_ENTERPRISE } from "../constants/constants";
import { IUser } from "../interfaces/App.interface";
import { getSession, signOut } from "../libs/cognito";
import { store } from '../store/store';
import { logOut, setUser } from "../store/user.slice";
import { Helpers } from "./Helpers";

import { getBusinessPartnerDetails, getUserContext } from "../services/App.Service";
import { toast } from "react-toastify";



export const isEmailValid = (applicantEmail: string): boolean => {
  return validator.isEmail(`${applicantEmail}`.trim());
};

export const isPhoneValid = (phone: string): boolean => {
  return (
    validator.isNumeric(phone) &&
    validator.isLength(phone, { max: 10, min: 10 })
  );
};

export const isPasswordValid = (password: string): boolean => {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    returnScore: false
  });
};

export const getErrorsInLoginRequest = (loginData: ILoginRequest): IErrors => {

  let errors: IErrors = BaseErrorObject;

  const emailValid = isEmailValid(loginData.email);
  if (!emailValid) {
    errors = { ...errors, EMAIL: { status: true, messages: [i18n.t("EMAIL_ID_ERROR")] } };
  }

  const gstUsernameValid = isPasswordValid(loginData.password);
  if (!gstUsernameValid) {
    errors = { ...errors, PASSWORD: { status: true, messages: [i18n.t("PASSWORD_ERROR")] } };
  }

  return errors;
};

export const getErrorsInOTPGenerateRequest = (
  loginData: ISendLoginCodeReq
): IErrors => {
  let errors: IErrors = BaseErrorObject;

  const phoneValid = isPhoneValid(loginData.phone);
  if (!phoneValid) {
    errors = {
      ...errors,
      PHONE: { status: true, messages: [i18n.t("PHONE_INVALID")] },
    };
  }

  return errors;
};

export const getErrorsInOTPLoginRequest = (
  loginData: IOTPLoginRequest
): IErrors => {
  let errors: IErrors = BaseErrorObject;

  const phoneValid = isPhoneValid(loginData.phone);
  if (!phoneValid) {
    errors = {
      ...errors,
      PHONE: { status: true, messages: [i18n.t("PHONE_INVALID")] },
    };
  }

  const isOTPValid =
    validator.isNumeric(loginData.otp) &&
    validator.isLength(loginData.otp, { max: 6, min: 6 });
  if (!isOTPValid) {
    errors = {
      ...errors,
      OTP: { status: true, messages: [i18n.t("OTP_ERROR")] },
    };
  }

  return errors;
};

export const getLoginRequestObject = (loginData: ILoginState): ILoginRequest => {
  return {
    email: loginData.email,
    password: loginData.password,
  };
};



export async function getLoggedInUserContext({ currentBusinessPartnerId, returnToLogin = true }: { currentBusinessPartnerId: string, returnToLogin: boolean },) {


  const userSession = await getSession();
  const userContextApirRes = await getUserContext();  
  const userContext = userContextApirRes.data
  const accessToken = userSession.getIdToken().getJwtToken();
  
  if (!_.isEmpty(userContext.__id)) {
    const userType = userContext.type;
    let businessPartner = DEFAULT_BP;
    let enterprise = DEFAULT_ENTERPRISE;    
    let businessPartnerIds: string[] = [];    
    let newCurrentBusinessPartnerId: string = currentBusinessPartnerId;
    if (userType.includes("business-partner")) {
      businessPartnerIds = userContext.businessPartnerIds;
      if (_.size(businessPartnerIds) <= 0) {
        
        signOut(() => {
          store.dispatch(
            logOut({ redirect: false, cb: function (){
              var message = i18n.t("UNAUTHORIZED")
              toast.error(message)
            } })
            
          );
        });
        return {
          status:false
        };
      }
      if(_.size(businessPartnerIds) === 1){
        if (_.isEmpty(newCurrentBusinessPartnerId)) {
          newCurrentBusinessPartnerId = _.get(businessPartnerIds, "[0]", "");
        }
        if (newCurrentBusinessPartnerId !== "") {
          let businessPartnerApiRes =  await getBusinessPartnerDetails(
            newCurrentBusinessPartnerId
          );
          businessPartner = businessPartnerApiRes.data 
        }
      }
    }


    const currentState = store.getState();

    const user: IUser = {
      email: userContext.email,
      firstName: userContext.fname,
      lastName: userContext.lname,
      id: userContext.__id,
      roles: userContext.roles,
      phoneNumber: userContext.phone,
      userName: userContext.userName,
      userType: userContext.type,
      businessPartnerIds,
      currentBusinessPartnerId: newCurrentBusinessPartnerId,
      logo: userContext.logo,
      businessPartner: businessPartner,
      enterprise: enterprise,      
      accessToken: accessToken,
      sliderImages: _.get(currentState, "user.sliderImages", []),
      tnc: _.get(currentState, "user.tnc", {}),
    };

    store.dispatch(setUser(user));    
    
    return {
      status:true,
      multipleBusinessPartner: _.size(businessPartnerIds) > 1,
      businessPartnerIds: businessPartnerIds
    }
  } else {
    signOut(() => {
      store.dispatch(
        logOut({ redirect: returnToLogin, cb: Helpers.navigateToUnauthorizedPage })
      );
    });
    return {
      status:false
    };
  }
}
