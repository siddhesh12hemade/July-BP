import { IUploadAndSaveDocument } from "./DocumentVault.interface";

export interface GSTPullState {
  gstIn: string;
  gstPullStatus: "idle" | "loading" | "failed" | "success";
  gstUsername: string;
  gstPullErrorMessage: string;
  gstVerificationStatus: "idle" | "loading" | "failed" | "success" | "otp_sent";
  gstVerificationErrors: GSTVerificationErrors;
  gstOtp: string;
  gstVerificationErrorMessage: string;
  renderOtpBox: Boolean;
  showDocumentHistory: Boolean;
  documentHistory: IUploadAndSaveDocument[];
  businessPartnerId: string;
}

export interface IRequestGSTOtp {
  gstin: string;
  gstUsername: string;
  businessPartnerId: string;
}

export interface IGSTVerificationResponse {
  success: boolean;
  message: string;
  statusCode: string;
  errors: GSTVerificationErrors;
}

export interface GSTVerificationErrors {
  GSTIN: boolean;
  GST_USERNAME: boolean;
  GST_OTP: boolean;
}

export interface IRequestGSTVerifyOtp {
  gstin: string;
  gstUsername: string;
  otp: string;
  businessPartnerId: string;
}
