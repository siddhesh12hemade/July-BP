import { Constants } from "../constants/constants";
import { ApiConfig, ApiResult } from "../interfaces/App.interface";
import { CommonService } from "./Common.Service";

export async function fetchApplication(obj: any, partnerId:string):Promise<ApiResult<any>> {
  
    
    const applicationListAPI = Constants.APPLICATION_LIST_API;
    const url = `${process.env.REACT_APP_ACTYV_GO_SVC_URL}${applicationListAPI}${partnerId}`
    let dataObj:ApiConfig = {
      method: 'post',
      api_url: url,
      headers: {
        'businesspartnerid': partnerId
      },
      data: {
        "searchText": obj?.searchText,
        "filter": obj?.filter
      },
      param_data: {
        offset: obj?.offset,
        limit: obj?.limit,
      }
    }
    return await CommonService.apiCall(dataObj);
  
}