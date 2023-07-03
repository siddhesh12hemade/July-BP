import {  
    Constants
  } from "../constants/constants";
  import { IBusinessGstinDocumentHistory, IDocumentStatus } from "../interfaces/DocumentVault.interface";
  import { getCurrentUser } from "../libs/cognito";
  import { Buffer } from "buffer";
  import * as _ from 'lodash';
import { IGstinDocumentHistory, IGstinVerificationList } from "../interfaces/GSTCertificate.interface";
import i18n from "../translations";
  
  export class Helpers {
    static isLoggedIn = (): boolean => {
      const currentUser = getCurrentUser();
      return currentUser ? true : false;
    };
    
    static getHostWithProtocol = (): string => {
      return process.env.REACT_APP_CONFIG_URL;
    };
    
    static navigateToNewPath = (path: string) => {
      window.location.href = `${path}`;
    };
    
    static navigateToUnauthorizedPage = () => {
      window.location.href = `${Helpers.getHostWithProtocol()}/admin/unauthorized`;
    };
    
    static checkDocumentTypeIsCustomComponent = (displayName: string) => {
      return (
        displayName.includes("CUSTOM_FORM") ||
        displayName.includes("MISCELLANEOUS_DOCUMENT")
      );
    };
    
    static isUploadSizeValid = (
      size: number,
      maxSize: number,
      maxSizeMessage: string
    ) => {
      let message = "";
      const valid = size < maxSize * 1000000;
      if (!valid) {
        message += maxSizeMessage + maxSize + "MB!";
      }
      return {
        status: valid,
        message: message,
      };
    };
    
    static getDocumentStatusForDetails = (
      eVerificationRequired?: boolean,
      status?: IDocumentStatus[]
    ) => {
      const uploadStatusObj = status?.find((obj) => {
        return obj.name === Constants.DOC_STATUS_UPLOAD_KEY;
      });
    
      const eVerificationObj = status.find((obj) => {
        return obj.name === Constants.DOC_STATUS_E_VERIFY_KEY;
      });
      if (eVerificationRequired || eVerificationObj) {
        const eVerificationObj = status.find((obj) => {
          return obj.name === Constants.DOC_STATUS_E_VERIFY_KEY;
        });
        if (eVerificationObj) {
          if (eVerificationObj.value === Constants.DOC_STATUS_COMPLETED_VALUE) {
            return {
              statusText: i18n.t("EVERIFY_DONE"),
              icon: Constants.STATUS_ICONS.success,
              colorClass: "verification-success",
              desc: eVerificationObj.description,
              obj:eVerificationObj
            };
          } else if (eVerificationObj.value === Constants.DOC_STATUS_ERROR_VALUE) {
            return {
              statusText: i18n.t("EVERIFY_ERROR"),
              icon: Constants.STATUS_ICONS.error,
              colorClass: "verification-failed",
              desc: eVerificationObj.description,
              obj:eVerificationObj
            };
          }
          else if (eVerificationObj.value === Constants.DOC_STATUS_PENDING_VALUE) {
            if (uploadStatusObj?.value === Constants.DOC_STATUS_PENDING_VALUE) {
              return {
                statusText: i18n.t("UPLOAD_PENDING"),
                icon: Constants.STATUS_ICONS.pending,
                colorClass: "upload-pending",
                desc: uploadStatusObj.description,
                obj: uploadStatusObj
              };
            }else{
              return {
                statusText: i18n.t("EVERIFY_PENDING"),
                icon: Constants.STATUS_ICONS.pending,
                colorClass: "verification-pending",
                desc: eVerificationObj.description,
                obj:eVerificationObj
              };
            }

            
          }
        }
      }
      if (uploadStatusObj?.value === Constants.DOC_STATUS_ERROR_VALUE) {
        return {
          statusText: i18n.t("UPLOAD_ERROR"),
          icon: Constants.STATUS_ICONS.error,
          colorClass: "upload-failed",
          desc: uploadStatusObj.description,
          obj: uploadStatusObj
        };
      } else if (uploadStatusObj?.value === Constants.DOC_STATUS_COMPLETED_VALUE) {
        return {
          statusText: i18n.t("UPLOAD_DONE"),
          icon: Constants.STATUS_ICONS.success,
          colorClass: "upload-success",
          desc: uploadStatusObj.description,
          obj: uploadStatusObj
        };
      }
    };
    
    static isImage = (mime: string) => {
      return mime?.startsWith("image");
    };
    
    static bufferToBase64 = (data: Buffer |  string): string => {
      return `data:image/png;base64,${Buffer.from(data).toString("base64")}`
    }

    
    static formatGstinPreFillResponse = (payload: IBusinessGstinDocumentHistory[]): {
      dropDownList: IGstinVerificationList[],
      documentHistory: IGstinDocumentHistory[]
    } => {
  
      let dropDownList: IGstinVerificationList[] = [];
  
      let documentHistory = [];
  
      for (let item of payload) {
        dropDownList.push({
          value: item.documentNo,
          label: item.documentNo,
          disabled: !_.isEmpty(item.documentInfo)
        })
        !_.isEmpty(item.documentInfo) && documentHistory.push({
          gstin: _.get(item, 'documentInfo.documentNo'),
          fileId: _.get(item, 'documentInfo.files[0].fileId')
        })
      }
  
      return { documentHistory, dropDownList }
    }

  }
  
  