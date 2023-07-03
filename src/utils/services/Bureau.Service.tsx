import axios from "axios";
import { ApiResult } from "../interfaces/App.interface";

import { ExistingBureauServiceResponse, IBureauQuestionAnswerRequest, IFetchBureauReportRequest, IGenerateReportRequest, IGenerateReportResponse, IPersonData } from "../interfaces/Bureau.interface";
import { CommonService } from "./Common.Service";

export async function generateBureauReport(request: IGenerateReportRequest): Promise<ApiResult<IGenerateReportResponse>> {
  const url = new URL(`/api/bureau/generate-bureau-report`, process.env.REACT_APP_ACTYV_GO_SVC_URL).toString();
  
  let res = await CommonService.apiCall<IGenerateReportResponse>({
    method: 'post',
    api_url: url ,
    data: request   
  })
  return res
}

export async function answerBureauQuestion(request: IBureauQuestionAnswerRequest): Promise<ApiResult<IGenerateReportResponse>> {
  const url = new URL(`/api/bureau/answer-bureau-question`, process.env.REACT_APP_ACTYV_GO_SVC_URL).toString();  

  let res = await CommonService.apiCall<IGenerateReportResponse>({
    method: 'post',
    api_url: url ,
    data: request   
  })
  return res
}

export async function fetchBureauReport(request: IFetchBureauReportRequest): Promise<IGenerateReportResponse> {
  const url = new URL(`/api/bureau/fetch-and-save-bureau-report`, process.env.REACT_APP_ACTYV_GO_SVC_URL).toString();
  const { data } = await axios.post<IGenerateReportResponse>(url, request);
  return data;
}

export async function getBureauReportForBusinessPartnerId(businessPartnerId: string): Promise<ApiResult<ExistingBureauServiceResponse>> {
  const url = new URL(`/api/bureau/${businessPartnerId}`, process.env.REACT_APP_ACTYV_GO_SVC_URL).toString();
  let res = await CommonService.apiCall<ExistingBureauServiceResponse>({
    method: 'get',
    api_url: url    
  })
  return res
}

export async function getPersonDataForBusinessPartnerId(businessPartnerId: string): Promise<ApiResult<IPersonData[]>> {
  const url = new URL(`/api/person/personal-data/${businessPartnerId}`, process.env.REACT_APP_ACTYV_GO_SVC_URL).toString();  

  let res = await CommonService.apiCall<IPersonData[]>({
    method: 'get',
    api_url: url    
  })
  return res
}
