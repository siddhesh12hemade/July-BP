import { IFile } from "./DocumentVault.interface";

export interface GSTCertificateState {
  fileId: string;
  fileUploadStatus: "idle" | "loading" | "failed" | "success";
  gstVerificationErrors: IErrors;
  showDocumentHistory: boolean;
  documentHistory: IGstinDocumentHistory[];
  businessPartnerId: string;
  gstin: string;
  listOfGstinToBeVerified: IGstinVerificationList[];
  editableGstin: string;
}

export interface UploadDocRes{
  ETag: string
  ServerSideEncryption: string
  Location: string
  key: string
  Key: string
  Bucket: string
}

export interface UploadPanRes extends UploadDocRes{
  documentDetails: {
    dob:string;
    panName:string;
    panNumber:string;
  }
}

export interface UploadAadharRes extends UploadDocRes{
  documentDetails: {
    aadhaarNumberFront: string
    aadhaarName: string
    dob: string
    gender: string
    aadhaarNumberBack: string
    fatherName: string
    address: string
  }
}

export interface IErrorValue {
  status: boolean;
  messages: string[];
}

export interface IErrors {
  FILE: IErrorValue;
}

export interface IUploadAndSaveDocumentResponse {
  statusCode: string;
  message: string;
  documentId: string;
  errors: IErrors;
}

export interface IGstinVerificationList {
  value: string;
  label: string;
  disabled: boolean;
}

export interface IGstinDocumentHistory {
  gstIn: string;
  documents: Array<IGstInDocumentPullStatus>;
}

export interface IGstInDocumentPullStatus {
  files: IFile[];
  documentType: string;
  documentNo: string;
  startDate: string;
  endDate: string;
  data: object;
  personId: string;
  businessPartnerId: string;
  status: IGstInStatus[];

}

export interface IGstInStatus {
  description: string;
  name: string;
  userId: string;
  value: string;
}
