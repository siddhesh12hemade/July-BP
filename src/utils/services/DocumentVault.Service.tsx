import { Constants } from "../constants/constants";
import { ApiResult } from "../interfaces/App.interface";
import {
  IBusinessDocumentPreFillResponse, ICrossValidation, IPersonalDocumentFillResponse, IPlatformConfigResponse,
  IPlatformDocument,
  ISpanResponse, IUdhyamOtpInitiate,
  IUdhyamOtpInititeResponse, IUdhyamOtpVerify, IUdhyamOtpVerifyResponse, IUploadAndSaveDocument,
  IUploadAndSaveDocumentResponse
} from "../interfaces/DocumentVault.interface";
import { UploadDocRes, UploadPanRes } from "../interfaces/GSTCertificate.interface";
import { CommonService } from "./Common.Service";

export async function uploadDoc(filename: string, partnerId: string, file: any): Promise<ApiResult<UploadDocRes>> {
  const formData = new FormData();
  formData.append('filename', filename)
  formData.append('businessPartnerId', partnerId)
  formData.append('file', file)

  const url = new URL(`${Constants.API_STRING}/file/upload`, process.env.REACT_APP_ACTYV_GO_SVC_URL).toString();

  let res = await CommonService.apiCall<UploadDocRes>({
    method: 'post',
    api_url: url,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  })
  return res
}

export async function uploadAndProcessPan(filename: string, partnerId: string, file: any): Promise<ApiResult<UploadPanRes>> {
  const formData = new FormData();
  formData.append('filename', filename)
  formData.append('businessPartnerId', partnerId)
  formData.append('file', file)

  const url = new URL(`${Constants.API_STRING}/file/process/pan`, process.env.REACT_APP_ACTYV_GO_SVC_URL).toString();

  let res = await CommonService.apiCall<UploadPanRes>({
    method: 'post',
    api_url: url,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  })
  return res
}

export async function uploadAndSaveBusinessDocument(document: IUploadAndSaveDocument): Promise<ApiResult<IUploadAndSaveDocumentResponse>> {
  const url = new URL(`${Constants.API_STRING}/document/business/save`, process.env.REACT_APP_ACTYV_GO_SVC_URL).toString();  

  let res = await CommonService.apiCall<IUploadAndSaveDocumentResponse>({
    method: 'post',
    api_url: url,
    data: document
  })
  return res
}

export async function initiateOtpUdhyam(payload: IUdhyamOtpInitiate): Promise<ApiResult<IUdhyamOtpInititeResponse>> {
  const url = new URL(`${Constants.API_STRING}/document/initiate/udyamVerification`, process.env.REACT_APP_ACTYV_GO_SVC_URL).toString();  

  let res = await CommonService.apiCall<IUdhyamOtpInititeResponse>({
    method: 'post',
    api_url: url,
    data: payload
  })
  return res
}

export async function verifyOtpUdhyam(payload: IUdhyamOtpVerify): Promise<ApiResult<IUdhyamOtpVerifyResponse>> {
  const url = new URL(`${Constants.API_STRING}/document/verify/udyamVerification`, process.env.REACT_APP_ACTYV_GO_SVC_URL).toString();  

  let res = await CommonService.apiCall<IUdhyamOtpVerifyResponse>({
    method: 'post',
    api_url: url,
    data: payload
  })
  return res
}

export async function uploadAndSavePersonalDocument(document: IUploadAndSaveDocument): Promise<ApiResult<IUploadAndSaveDocumentResponse>> {
  const url = new URL(`${Constants.API_STRING}/document/personal/save`, process.env.REACT_APP_ACTYV_GO_SVC_URL).toString();

  let res = await CommonService.apiCall<IUploadAndSaveDocumentResponse>({
    method: 'post',
    api_url: url,
    data: document
  })
  return res
}

export async function getBusinessPartnerPlatformConfig(currentBusinessPartnerId: string): Promise<ApiResult<IPlatformConfigResponse>> {
  const url = new URL(`${Constants.API_STRING}/business-partner/get/config/${currentBusinessPartnerId}`, process.env.REACT_APP_ACTYV_GO_SVC_URL).toString();  

  let res = await CommonService.apiCall<IPlatformConfigResponse>({
    method: 'get',
    api_url: url    
  })
  return res
}

export async function getDocumentSpan(documentType: keyof IPlatformDocument): Promise<ApiResult<ISpanResponse>> {
  const url = new URL(`${Constants.API_STRING}/document/get/span/${documentType}`, process.env.REACT_APP_ACTYV_GO_SVC_URL).toString();

  let res = await CommonService.apiCall<ISpanResponse>({
    method: 'get',
    api_url: url    
  })
  return res
}

export async function getDocumentHistory(documentType: keyof IPlatformDocument, currentBusinessPartnerId: string):
  Promise<ApiResult<IBusinessDocumentPreFillResponse>> {
  const url = new URL(`${Constants.API_STRING}/business-partner/get/documents/${documentType}/${currentBusinessPartnerId}`, process.env.REACT_APP_ACTYV_GO_SVC_URL).toString();  

  let res = await CommonService.apiCall<IBusinessDocumentPreFillResponse>({
    method: 'get',
    api_url: url    
  })
  return res
}

export async function getPersonalDocumentHistory(documentType: keyof IPlatformDocument, currentBusinessPartnerId: string): Promise<ApiResult<IPersonalDocumentFillResponse>> {
  const url = new URL(`${Constants.API_STRING}/person/getDocument/${documentType}/${currentBusinessPartnerId}`, process.env.REACT_APP_ACTYV_GO_SVC_URL).toString();

  let res = await CommonService.apiCall<IPersonalDocumentFillResponse>({
    method: 'get',
    api_url: url    
  })
  return res
}

export async function getCrossValidations(currentBusinessPartnerId: string): Promise<ApiResult<ICrossValidation[]>> {
  const url = new URL(`${Constants.API_STRING}/business-partner/get/cross-validations/${currentBusinessPartnerId}`, process.env.REACT_APP_ACTYV_GO_SVC_URL).toString();

  let res = await CommonService.apiCall<ICrossValidation[]>({
    method: 'get',
    api_url: url    
  })
  return res
}

export async function getDocumentHistoryWithGstIn(currentBusinessPartnerId: string, gstIn: string, requiredDocuments: Array<string>):
  Promise<ApiResult<IBusinessDocumentPreFillResponse>> {    
  const url = new URL(`${Constants.API_STRING}/business-partner/get/documents/${currentBusinessPartnerId}/${gstIn}`, process.env.REACT_APP_ACTYV_GO_SVC_URL).toString();  

  let res = await CommonService.apiCall<IBusinessDocumentPreFillResponse>({
    method: 'post',
    api_url: url,
    data:{ requiredDocuments }
  })
  return res
}