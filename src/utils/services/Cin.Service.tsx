import { ApiResult } from "../interfaces/App.interface";
import { IInitiateCINVerification, IInitiateCINVerificationResponse, IVerifyCINCaptcha, IVerifyCINCaptchaResponse } from "../interfaces/Cin.interface";
import { CommonService } from "./Common.Service";

export async function initiateCinVerification(document: IInitiateCINVerification): Promise<ApiResult<IInitiateCINVerificationResponse>> {
  const url = new URL("api/document/initiate/cinVerification", process.env.REACT_APP_ACTYV_GO_SVC_URL).toString();  
  let res=await CommonService.apiCall<IInitiateCINVerificationResponse>({
    method: 'post',
    api_url: url,
    data: document
  })
  return res
}

export async function verifyCINCaptcha(document: IVerifyCINCaptcha): Promise<ApiResult<IVerifyCINCaptchaResponse>> {
  const url = new URL("api/document/initiate/cin/captchaVerification", process.env.REACT_APP_ACTYV_GO_SVC_URL).toString();    
  let res=await CommonService.apiCall<IVerifyCINCaptchaResponse>({
    method: 'post',
    api_url: url,
    data: document
  })
  return res;
}
