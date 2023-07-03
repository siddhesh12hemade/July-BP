
import { ApiResult } from "../interfaces/App.interface";
import { CommonService } from "./Common.Service";

export async function getFormSchema(enterpriseFormConfigKey: string): Promise<ApiResult<any>> {
  const actyvGoSvcUrl = process.env.REACT_APP_ACTYV_GO_SVC_URL;
  let url = `${actyvGoSvcUrl}/api/enterprise-form-config/key/${enterpriseFormConfigKey}`  

  let res = await CommonService.apiCall<any>({
    method: 'get',
    api_url: url    
  })
  return res
}

