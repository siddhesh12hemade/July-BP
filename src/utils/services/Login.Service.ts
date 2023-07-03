import axios from "axios";

import {
  generateMobileLoginOTP,
  signInWithEmail,
  verifyMobileLoginOTP,
} from "../libs/cognito";

import {
  ILoginRequest,
  ILoginResponse,
  IOTPLoginRequest,
  ISendCodeReq,
  ISendCodeRes,
  ISendLoginCodeReq,
} from "../interfaces/Login.interface";
import { BaseErrorObject, Constants } from "../constants/constants";
import { CommonService } from "./Common.Service";
import { ApiConfig } from "../interfaces/App.interface";
import i18n from "../translations";

export async function login(userData: ILoginRequest): Promise<ILoginResponse> {
  try {
    const { data: username } = await axios.post(`${process.env.REACT_APP_ACTYV_ADMIN_SVC_URL}/api/user/get-username`, { email: userData.email });
    const cognitoUserSession = await signInWithEmail(
      username,
      userData.password
    );
    return {
      errors: BaseErrorObject,
      statusCode: Constants.API_SUCCESS,
      message: "",
      idToken: cognitoUserSession.getIdToken().getJwtToken(),
      accessToken: cognitoUserSession.getAccessToken().getJwtToken(),
    };
  } catch (err: any) {
    return {
      errors: {
        ...BaseErrorObject,
        LOGIN: {
          status: true,
          messages: [err.message],
        },
      },
      statusCode: "ERROR",
      message: err.message,
      idToken: "",
      accessToken: "",
    };
  }
}

export async function otpBasedLogin(
  userData: IOTPLoginRequest
): Promise<ILoginResponse> {
  try {
    const cognitoUserSession = await verifyMobileLoginOTP(
      userData.phone,
      userData.otp
    );
    return {
      errors: BaseErrorObject,
      statusCode: "SUCCESS",
      message: "",
      idToken: cognitoUserSession.getIdToken().getJwtToken(),
      accessToken: cognitoUserSession.getAccessToken().getJwtToken(),
    };
  } catch (err: any) {
    return {
      errors: {
        ...BaseErrorObject,
        LOGIN: {
          status: true,
          messages: ["Invalid OTP"],
        },
      },
      statusCode: "ERROR",
      message: "Invalid OTP",
      idToken: "",
      accessToken: "",
    };
  }
}

export async function sendCode(
  sendCodeData: ISendCodeReq
): Promise<ISendCodeRes> {
  const url = new URL(
    `/${Constants.API_STRING}/user/forgotPassword`,
    process.env.REACT_APP_ACTYV_ADMIN_SVC_URL
  ).toString();
  let res = await CommonService.apiCall<ISendCodeRes>({
    method: "post",
    api_url: url,
    data: sendCodeData,
  });
  if (res.status === Constants.API_SUCCESS)
    return {
      errors: BaseErrorObject,
      statusCode: "SUCCESS",
      message: res.data.message,
    };
  else {
    return {
      errors: {
        ...BaseErrorObject,
        FORGOTPASSWORD: {
          status: true,
          messages: [res.error?.response.data.message],
        },
      },
      statusCode: "ERROR",
      message: res.error?.response.data.message,
    };
  }
}

export async function sendLoginCode(userData: ISendLoginCodeReq) {
  try {
    const data = await generateMobileLoginOTP(userData.phone);
    return { success: true, message: i18n.t("LOGIN_OTP_SENT"), data };
  } catch (err) {
    return { success: false, message: err?.message };
  }
}

export async function createNewPassword(data: any) {

  const url = `${process.env.REACT_APP_ACTYV_ADMIN_SVC_URL}/${Constants.CREATE_PASSWORD}`;
  let dataObj: ApiConfig = {
    method: "post",
    api_url: url,
    data: {
      verificationCode: data?.verificationCode,
      email: data?.email,
      newPassword: data?.newPassword,
    },
  };
  return CommonService.apiCall(dataObj);

}
