export interface ILoginState {
  email: string;
  password: string;
  phone: string;
  otp: string;
  messageToDisplay: string;
  status: "idle" | "loading" | "failed" | "success";
  errors: IErrors;
  rememberMe: boolean;
  forgotPasswordStatus: "idle" | "loading" | "failed" | "success";
  redirectUrl: string;
  otpStatus: "pending" | "otp_sent";
  session: string;
}

export interface IErrorValue {
  status: boolean;
  messages: string[];
}

export interface IErrors {
  EMAIL: IErrorValue;
  PASSWORD: IErrorValue;
  LOGIN: IErrorValue;
  FORGOTPASSWORD: IErrorValue;
  PHONE: IErrorValue;
  OTP: IErrorValue;
}


export interface ILoginResponse {
  statusCode: string;
  message: string;
  errors: IErrors;
  idToken: string;
  accessToken: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IOTPLoginRequest {
  phone: string;
  otp: string;
}
export interface ISendCodeReq {
  email: string;
}

export interface ISendLoginCodeReq {
  phone: string;
}
export interface ISendCodeRes {
  statusCode: string;
  message: string;
  errors: IErrors;
}