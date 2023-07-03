import { IInitiateAadhaarVerification, IInitiateAadhaarVerificationResponse, IInitiateVerifyAadhaarCaptcha, IInitiateVerifyAadhaarCaptchaResponse, IInitiateVerifyAadhaarOTP, IInitiateVerifyAadhaarOTPResponse } from "../interfaces/AadhaarVerification.interface";
import { ApiResult } from "../interfaces/App.interface";
import { UploadAadharRes } from "../interfaces/GSTCertificate.interface";
import { CommonService } from "./Common.Service";

export async function initiateAadhaarVerification(document: IInitiateAadhaarVerification): Promise<ApiResult<IInitiateAadhaarVerificationResponse>> {
  const url = new URL("api/document/initiate/aadhaarVerification", process.env.REACT_APP_ACTYV_GO_SVC_URL).toString();  

  let res=await CommonService.apiCall<IInitiateAadhaarVerificationResponse>({
    method: 'post',
    api_url: url,
    data: document
  })
  return res
}

export async function initiateVerifyAadhaarCaptcha(document: IInitiateVerifyAadhaarCaptcha): Promise<ApiResult<IInitiateVerifyAadhaarCaptchaResponse>> {
  const url = new URL("api/document/initiate/aadhaar/captchaVerification", process.env.REACT_APP_ACTYV_GO_SVC_URL).toString();  

  let res=await CommonService.apiCall<IInitiateVerifyAadhaarCaptchaResponse>({
    method: 'post',
    api_url: url,
    data: document
  })
  return res
}

export async function initiateVerifyAadhaarOTP(document: IInitiateVerifyAadhaarOTP): Promise<ApiResult<IInitiateVerifyAadhaarOTPResponse>> {
  const url = new URL("api/document/initiate/verify/aadhaarOTP", process.env.REACT_APP_ACTYV_GO_SVC_URL).toString();
  let res=await CommonService.apiCall<IInitiateVerifyAadhaarOTPResponse>({
    method: 'post',
    api_url: url,
    data: document
  })
  return res
}

export async function uploadAndProcessAadhar(filename: string, partnerId: string, file: any): Promise<ApiResult<UploadAadharRes>> {
  const formData = new FormData();
  formData.append('filename', filename)
  formData.append('businessPartnerId', partnerId)
  formData.append('file', file)

  const url = new URL(`api/document/process/aadhaarDocument`, process.env.REACT_APP_ACTYV_GO_SVC_URL).toString();

  let res = await CommonService.apiCall<UploadAadharRes>({
    method: 'post',
    api_url: url,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  })
  return res
}