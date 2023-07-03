import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { IUser } from "../interfaces/App.interface";

import { store } from "../../utils/store/store";
import { getSession } from "../libs/cognito";
import { systemException } from "../sentry/common.service";



const onRequest = async (config: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
  try {
    if (config.headers) {
      const userSession = await getSession();
      const token = userSession.getIdToken().getJwtToken();
      
      const loggedInUserState: IUser = store.getState().user;
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['enterpriseid'] = config.headers['enterpriseid'] ? config.headers['enterpriseid'] : `${loggedInUserState.enterprise._id}`;
      config.headers['businesspartnerid'] = config.headers['businesspartnerid'] ? config.headers['businesspartnerid'] : `${loggedInUserState.currentBusinessPartnerId}`;            
    }
    return config;
  } catch (error) {
    let obj = {
      fileName: 'interceptor.ts',
      functionName: 'onRequest()',
      error: error,
    };
    systemException(obj);
    console.error(`[request error] [${JSON.stringify(error)}]`);
  } finally {
    return config;
  }
}

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
  console.error(`[request error] [${JSON.stringify(error)}]`);
  return Promise.reject(error);
}

const onResponse = (response: AxiosResponse): AxiosResponse => {
  return response;
}

const onResponseError = (error: AxiosError): Promise<AxiosError> => {
  console.error(`[response error] [${JSON.stringify(error)}]`);
  return Promise.reject(error);
}

const setupInterceptorsTo = (axiosInstance: AxiosInstance): AxiosInstance => {
  axiosInstance.interceptors.request.use(onRequest, onRequestError);
  axiosInstance.interceptors.response.use(onResponse, onResponseError);
  return axiosInstance;
}

setupInterceptorsTo(axios);
