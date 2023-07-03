import _ from "lodash";
import { ApiConfig, ApiResult } from "../interfaces/App.interface";
import { ApprovalSubmitResponse } from "../interfaces/ApplicationDetails.interface";
import {
  IFormConfigResponse,
  IFormSaveResponse,
} from "../interfaces/Form.interface";
import { CommonService } from "./Common.Service";
export async function fetchFormConfig(
  formConfigId: string,
  businessPartnerId: string,
  applicationId: string
): Promise<ApiResult<IFormConfigResponse>> {
  const applicationIdToSend = _.isEmpty(applicationId) ? "NA" : applicationId;
  const url = new URL(
    `api/enterprise-form-config/${formConfigId}/${businessPartnerId}/${applicationIdToSend}`,
    `${process.env.REACT_APP_ACTYV_GO_SVC_URL}`
  ).toString();

  const fetchData = await CommonService.apiCall<IFormConfigResponse>({
    method: "get",
    api_url: url,
  });
  return fetchData;
}

export async function saveFormData(
  document: object
): Promise<ApiResult<IFormSaveResponse>> {
  const url = new URL(
    "api/field-value/bulk",
    `${process.env.REACT_APP_ACTYV_GO_SVC_URL}`
  ).toString();
  let obj: ApiConfig = {
    method: "post",
    api_url: url,
    data: document,
    headers: {
      "businesspartnerid": _.get(document, "businessPartnerId", "")
    }
  };

  const fetchData = await CommonService.apiCall<IFormSaveResponse>(obj);
  return fetchData;
}

export async function makeGenericPostCall(
  url: string,
  requestPayload: object
): Promise<any> {

  let obj:ApiConfig = {
    method: "post",
    api_url: url,
  };
  const res = await CommonService.apiCall(obj);

  return res.data;
}
export class FormService {

  static async getAppDetails(param: any):Promise<ApiResult<any>> {
    const url = "/api/business-partner-application/" + param.appId;
    let obj:ApiConfig = {
      method: "get",
      api_url: `${process.env.REACT_APP_ACTYV_GO_SVC_URL}` + url,
    };

    let res = await CommonService.apiCall(obj);
    return res;
  }

  static async submitDocForApproval(param: {appId: string}):Promise<ApiResult<ApprovalSubmitResponse>> {
    const url = "/api/business-partner-application/approval-request";
    let obj:ApiConfig = {
      method: "post",
      data: { applicationId: param.appId },
      api_url: `${process.env.REACT_APP_ACTYV_GO_SVC_URL}` + url,
    };

    let res = await CommonService.apiCall<ApprovalSubmitResponse>(obj);
    return res;
  }
}
