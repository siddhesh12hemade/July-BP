
import { Constants } from "../constants/constants";
import {
  ApiResult,
  IBusinessPartner,
  IUserContextResponse
} from "../interfaces/App.interface";
import { systemException } from "../sentry/common.service";
import { Helpers } from "../utils/Helpers";
import { CommonService } from "./Common.Service";

export interface Role {
  name: string;
  permissions: Permission[];
  roleId: string;
}

export interface Permission {
  name: string;
  action: string;
  subject: string;
  conditions: string;
  service: string;
}

export async function getUserContext(): Promise<
  ApiResult<IUserContextResponse>
> {
  try {
    const url = Helpers.getHostWithProtocol();
    let apiUrl = `${process.env.REACT_APP_ACTYV_ADMIN_SVC_URL}/${
      Constants.API_STRING
    }/user/getCurrentUser?url=${encodeURIComponent(url)}`;

    let res = await CommonService.apiCall<IUserContextResponse>({
      method: "get",
      api_url: apiUrl,
    });
    return res;
  } catch (error) {
    let data = {
      __id: "",
      bankId: "",
      businessPartnerIds: [],
      email: "",
      enterpriseId: "",
      fname: "",
      leftNavItems: [],
      lname: "",
      logo: "",
      phone: "",
      roles: [],
      type: [],
      userName: "",
    };

    let res: ApiResult<IUserContextResponse> = {
      status: Constants.API_FAIL,
      data: data,
    };
    let obj = {
      fileName: 'App.Service.ts',
      functionName: 'getUserContext()',
      error: error.message,
    };
    systemException(obj);
    return res;
  }
}


export async function getBusinessPartnerDetails(
  currentBusinessPartnerId: string
): Promise<ApiResult<IBusinessPartner>> {
  try {
    const actyvGoSvcUrl = process.env.REACT_APP_ACTYV_GO_SVC_URL;
    let url = `${actyvGoSvcUrl}/${Constants.API_STRING}/business-partner/${currentBusinessPartnerId}`
    
    let res = await CommonService.apiCall<IBusinessPartner>({
      method: "get",
      api_url: url,
      headers:{
        businesspartnerid: currentBusinessPartnerId
      }
    });
    return res;
  } catch (error) {
    
    let res:ApiResult<IBusinessPartner> = {
      status: Constants.API_FAIL,
      data: { _id: "NA", businessName: "NA", gstin: "NA" }
    }
    let obj = {
      fileName: 'App.Service.ts',
      functionName: 'getBusinessPartnerDetails()',
      error: error.message,
    };
    systemException(obj);
    return res;
  }
}
