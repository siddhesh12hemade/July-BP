export interface IInitialEnterpriseInviteHistoryState {
  bpInvites: IBusinessPartnerInviteDetails[];
  status: "idle" | "loading" | "failed" | "success";
  resendStatus: "idle" | "loading" | "failed" | "success";
  messageToDisplay: string;
  totalInvites: Number;
}

export interface IBusinessPartnerInviteResponse {
  businessPartnerInvitesByEnterprise: IBusinessPartnerInviteDetails[];
  documentCount: Number;
}

export interface IPaginationQuery {
  offset: Number;
  limit: Number;
}

export interface IBusinessPartnerInviteDetails {
  _id: string;
  gstin: string;
  businessName: string;
  applicantMobile: string;
  applicantEmail: string;
  status: string;
  token: string;
  enterpriseFormConfigKey: string;
  fieldValues: Object;
  existingBusinessPartnerId: string;
  createdOn: string,
  updatedOn?: string,
  configType?: string[],
  enterpriseId: string;
}


export interface IResendInvitePayload {
  status: string,
  token: string
}

export interface IResendInviteResponse {
  statusCode: string;
  message: string;
}
