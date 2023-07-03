import { Constants } from "../constants/constants";
import { ApiResult } from "../interfaces/App.interface";

import { ApplicationConfig } from "../interfaces/BPInvite.interface";
import {
  BusinessPartnerInviteRequest,
  BusinessPartnerInviteResponse,
  EmailVerificationRequest, IGSTVerificationResponse, IRequestGSTOtp,
  IRequestGSTVerifyOtp,
  ISignupRequest,
  ISignupResponse, PhoneVerificationRequest,
  VerificationInitResponse,
  VerifyEmailRequest, VerifyPhoneRequest
} from "../interfaces/BPSelfSignUp.interface";
import { CommonService } from "./Common.Service";

export async function signup(userData: ISignupRequest): Promise<ApiResult<ISignupResponse>> {
  const actyvGoSvcUrl = process.env.REACT_APP_ACTYV_GO_SVC_URL;
  let url = `${actyvGoSvcUrl}/${Constants.API_STRING}/business-partner`  

  let res = await CommonService.apiCall<ISignupResponse>({
    method: 'post',
    api_url: url,
    data: userData    
  })
  return res
}

export async function requestGstVerificationOtp(gstData: IRequestGSTOtp): Promise<ApiResult<IGSTVerificationResponse>> {
  const actyvGoSvcUrl = process.env.REACT_APP_ACTYV_GO_SVC_URL;
  let url = `${actyvGoSvcUrl}/${Constants.API_STRING}/business-partner/gsp-request-otp`  

  let res = await CommonService.apiCall<IGSTVerificationResponse>({
    method: 'post',
    api_url: url,
    data: gstData    
  })
  return res
}

export async function verifytGstOtp(gstData: IRequestGSTVerifyOtp): Promise<ApiResult<IGSTVerificationResponse>> {
  const actyvGoSvcUrl = process.env.REACT_APP_ACTYV_GO_SVC_URL;
  let url = `${actyvGoSvcUrl}/${Constants.API_STRING}/business-partner/gsp-verify-otp`

  let res = await CommonService.apiCall<IGSTVerificationResponse>({
    method: 'post',
    api_url: url,
    data: gstData    
  })
  return res
}

export async function retrieveDataFromInvite(inviteData: BusinessPartnerInviteRequest): Promise<ApiResult<BusinessPartnerInviteResponse>> {
  const actyvGoSvcUrl = process.env.REACT_APP_ACTYV_GO_SVC_URL;
  let url = `${actyvGoSvcUrl}/${Constants.API_STRING}/business-partner-invite/verify-invite`

  let res = await CommonService.apiCall<BusinessPartnerInviteResponse>({
    method: 'post',
    api_url: url,
    data: inviteData    
  })
  return res
}

export async function getApplicationConfigFromId(applicationConfigId: string): Promise<ApiResult<ApplicationConfig>> {
  const actyvGoSvcUrl = process.env.REACT_APP_ACTYV_GO_SVC_URL;
  let url = `${actyvGoSvcUrl}/${Constants.API_STRING}/application-config/${applicationConfigId}`  

  let res = await CommonService.apiCall<ApplicationConfig>({
    method: 'get',
    api_url: url    
  })
  return res
}

export async function requestEmailVerification(
  verificationPayload: EmailVerificationRequest
): Promise<ApiResult<VerificationInitResponse>> {
  const adminServiceUrl = process.env.REACT_APP_ACTYV_ADMIN_SVC_URL;
  let url =  `${adminServiceUrl}/${Constants.API_STRING}/user/sendVerificationEmail`  

  let res = await CommonService.apiCall<VerificationInitResponse>({
    method: 'post',
    api_url: url,
    data: verificationPayload    
  })
  return res
}

export async function requestPhoneVerification(
  verificationPayload: PhoneVerificationRequest
): Promise<ApiResult<VerificationInitResponse>> {
  const adminServiceUrl = process.env.REACT_APP_ACTYV_ADMIN_SVC_URL;
let url = `${adminServiceUrl}/${Constants.API_STRING}/user/sendVerificationSMS`

  let res = await CommonService.apiCall<VerificationInitResponse>({
    method: 'post',
    api_url: url,
    data: verificationPayload    
  })
  return res
}

export async function verifyEmail(verificationPayload: VerifyEmailRequest):Promise<ApiResult<VerificationInitResponse>> {
  const adminServiceUrl = process.env.REACT_APP_ACTYV_ADMIN_SVC_URL;
  let url = `${adminServiceUrl}/${Constants.API_STRING}/user/verifyEmail`

  let res = await CommonService.apiCall<VerificationInitResponse>({
    method: 'post',
    api_url: url,
    data: verificationPayload    
  })
  return res
}

export async function verifyPhone(verificationPayload: VerifyPhoneRequest):Promise<ApiResult<VerificationInitResponse>> {
  const adminServiceUrl = process.env.REACT_APP_ACTYV_ADMIN_SVC_URL;
  let url = `${adminServiceUrl}/${Constants.API_STRING}/user/verifyPhone`

  let res = await CommonService.apiCall<VerificationInitResponse>({
    method: 'post',
    api_url: url,
    data: verificationPayload    
  })
  return res
}
