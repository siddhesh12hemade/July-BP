import { ApiResult } from "../interfaces/App.interface";
import { IGSTVerificationResponse, IRequestGSTOtp, IRequestGSTVerifyOtp } from "../interfaces/GSTPull.interface";
import { CommonService } from "./Common.Service";

export async function requestOtpFroGstReturnsPull(gstData: IRequestGSTOtp): Promise<ApiResult<IGSTVerificationResponse>> {
  const actyvGoSvcUrl = process.env.REACT_APP_ACTYV_GO_SVC_URL;
  let url = `${actyvGoSvcUrl}/api/business-partner/gsp-request-otp-and-initiate-pull`

  let res = await CommonService.apiCall<IGSTVerificationResponse>({
    method: 'post',
    api_url: url,
    data: gstData    
  })
  return res
}

export async function verifytGstOtpAndInitialPull(gstData: IRequestGSTVerifyOtp): Promise<ApiResult<IGSTVerificationResponse>> {
  const actyvGoSvcUrl = process.env.REACT_APP_ACTYV_GO_SVC_URL;
  let url = `${actyvGoSvcUrl}/api/business-partner/gsp-verify-otp-and-initiate-pull`

  let res = await CommonService.apiCall<IGSTVerificationResponse>({
    method: 'post',
    api_url: url,
    data: gstData    
  })
  return res
}
