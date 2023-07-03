import { IBusinessPartner } from "./App.interface";
import { IBusinessPartnerInviteDetails } from "./EnterpriseInviteHistory.interface";

export interface IBPInviteState {
  businessName: string;
  applicantMobile: string;
  applicantEmail: string;
  gstin: string;
  messageToDisplay: string;
  status: "idle" | "loading" | "failed" | "success";
  errors: IErrors;
  enterpriseId: string;
  applicationConfigs: ApplicationConfig[];
  selectedApplicationConfig: ApplicationConfig;
  formSchema: any;
  businessPartners: IBusinessPartner[];
  selectedBusinessPartner: IBusinessPartner;
  businessPartnerStatus: "New" | "Existing";
}

export interface ApplicationConfig {
  _id: string;
  configType: string;
  enterpriseId: string;
  workflowId: string;
  documentDecisionTableId: string;
  enterpriseApplicationDocumentConfigKey: string;
  enterpriseFormConfigKey: string;
  businessPartnerApplicationInviteFormConfigKey: string;
  gstRules: IGstRules;
}

export interface IErrorValue {
  status: boolean;
  messages: string[];
}

export interface IErrors {
  BUSINESS_NAME: IErrorValue;
  APPLICANT_MOBILE: IErrorValue;
  APPLICANT_EMAIL: IErrorValue;
  GSTIN: IErrorValue;
}

export interface IBPInviteRequest {
  businessName: string;
  applicantMobile: string;
  applicantEmail: string;
  gstin: string;
  enterpriseId: string;
  fieldValues: Object;
  enterpriseFormConfigKey: string;
  applicationConfigId: string;
  existingBusinessPartnerId: string;
}

export interface IBPInviteResponse {
  message: string;
  statusCode: string;
  errors: IErrors;
}

export interface IGstRules {
  INVITE_DISPLAY: "YES" | "NO";
  BP_DISPLAY: "YES" | "NO";
  INVITE_VALIDATION: "NO" | "LVL_1" | "LVL_2";
  BP_VALIDATION: "NO" | "LVL_1" | "LVL_2";
}

export interface BPDropdownEntry {
  key: string;
  value: string;
}

export interface InvitePrefillData {
  applicantMobile: string;
  applicantEmail: string;
  gstin: string;
  businessName: string;
}

export interface ISaveInviteDetailsAsDraftResponse {
  statusCode: string;
  message: string;
  businessPartnerInviteDetails: IBusinessPartnerInviteDetails
}