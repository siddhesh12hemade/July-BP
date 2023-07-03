export interface IApplicationDocumentConfig {
  key: string;
  type: string;
  property: Record<string, unknown>;
}

export interface IApplicationDetails {
  applicationIdentifier: string;
  applicationConfigId: string;
  applicationId: string;
  businessPartnerId: string;
  enterpriseApplicationDocumentConfigKey: string;
  enterpriseLocation: string;
  enterpriseLogo: string;
  enterpriseName: string;
  status: string;
  type: string;
  workflowTaskId: string;
  __v: number;
  _id: string;
}

export interface IApplicationDetailsState {
  applicationDetailsLoading: "idle" | "loading" | "failed" | "success";
  documentConfig: IApplicationDocumentConfig[];
  applicationDetails: IApplicationDetails;
}

export interface ApprovalSubmitResponse {
  success: boolean;
  message: string;
}
