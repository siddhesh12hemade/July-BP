import { Constants } from "../constants/constants";
import { ApiResult } from "../interfaces/App.interface";

import { IBusinessPartnerGstinResponse } from "../interfaces/Pan.interface";
import { CommonService } from "./Common.Service";

export async function fetchBusinessPartnerGstin(businessPartnerId: string): Promise<ApiResult<IBusinessPartnerGstinResponse>> {
  const actyvGoSvcUrl = process.env.REACT_APP_ACTYV_GO_SVC_URL;
  let url = `${actyvGoSvcUrl}/${Constants.API_STRING}/business-partner/${businessPartnerId}`  

  let res = await CommonService.apiCall<IBusinessPartnerGstinResponse>({
    method: 'get',
    api_url: url,    
  })
  return res
}
