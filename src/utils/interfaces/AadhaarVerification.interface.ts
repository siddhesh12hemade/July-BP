
export interface IFormErrorState {
  name: boolean;
  careOf: boolean;
  district: boolean;
  state: boolean;
  country: boolean;
  subDistrict: boolean;
  dob: boolean;
  gender: boolean;
  pinCode: boolean;
  address: boolean;
  aadhaarNumber: boolean;
  captchaCode: boolean;
  otp: boolean;
}

export interface IFormState {
  name: string;
  careOf: string;
  district: string;
  state: string;
  country: string;
  subDistrict: string;
  dob: string;
  gender: string;
  pinCode: string;
  address: string;
  aadhaarNumber: string;
  captchaCode: string;
  otp: string;
  error: IFormErrorState;
}

export interface INotificationProps {
  type: "success" | "info" | "warning" | "error";
  context: string;
}

type NotificationType = "idle" | "loading" | "failed" | "success";

export interface ILoaderStatus {
  initiatedAadhaarVerification: NotificationType;
  initiateCaptchaVerification: NotificationType;
  initiateOTPVerification: NotificationType;
  initiateUpdateManualAadhaarVerification: NotificationType;
}

export interface IAadhaarVerificationState {
  enableNotificationAlert: boolean;
  notificationMessage: string;
  captchaImage: string;
  verificationStatus: string;
  verificationType: string;
  isGetOTPInitiated: boolean;
  isCaptchaModalVisible: boolean;
  formState: IFormState;
  loaderStatus: ILoaderStatus;
  aadhaarCardType: Array<IAadhaarCardType>;
  uploadedDocuments: Array<IUploadedDocuments>;
  chosenAadhaarType: "AADHAR_FRONT" | "AADHAR_BACK" | "";
  triggerAutoDocumentSave: boolean;
  listOfAadhaarDocumentsToBeVerified: IAadhaarVerificationList[];
  verifiedDocuments: IVerifiedAadhaarDocuments[];
  documentToBeVerifiedForPerson: string;
  editablePersonDocument: string;
}

export interface IAadhaarVerificationType {
  MANUAL_VERIFICATION: string;
  E_VERIFICATION: string;
}

export interface IAadhaarVerificationStatus {
  UPLOAD_PENDING: string;
  PENDING_VERIFICATION: string;
  CONFIRMATION: string;
}

export interface IFileUpload {
  uid: string;
  documentType: string;
  fileName: string;
  name: string;
}

export interface IInitiateAadhaarVerification {
  aadhaarNumber: string;
}

export interface IInitiateAadhaarVerificationResponse {
  response: {
    statusCode: string;
    message: string;
    success: boolean;
    captcha: string;
  };
}

export interface IInitiateVerifyAadhaarCaptcha {
  aadhaarNumber: string;
  captchaCode: string;
}

export interface IInitiateVerifyAadhaarCaptchaResponse {
  response: {
    'status-code': string;
    message: string;
    success: boolean;
  };
}

export interface IInitiateVerifyAadhaarOTP {
  aadhaarNumber: string;
  otp: string;
  personId: string;
}

export interface IInitiateVerifyAadhaarOTPResponse {
  response: {
    'status-code': string;
    message: string;
    success: boolean;
    result: any;
  };
}

type AadhaarCardType = "AADHAR_FRONT" | "AADHAR_BACK";

export interface IAadhaarCardType {
  label: string;
  value: AadhaarCardType;
}

export interface IUploadedDocuments {
  uid: string;
  size?: number;
  name: string;
  fileName?: string;
  lastModified?: number;
  lastModifiedDate?: any;
  url?: string;
  status?: string;
  percent?: number;
  thumbUrl?: string;
  crossOrigin?: any;
  originFileObj?: any;
  response?: any;
  error?: any;
  linkProps?: any;
  type?: string;
  xhr?: any;
  preview?: any;
  documentType: string;
  fileType:string;
}

export interface IAadhaarVerificationList {
  value: string;
  label: string;
  disabled: boolean;
}

export interface IVerifiedAadhaarDocuments {
  aadhaarNumber: string;
  name: string;
  careOf: string;
  district: string;
  state: string,
  country: string,
  subDistrict: string,
  dob: string,
  gender: string,
  pinCode: string,
  address: string,
  files: [{
    type: string;
    fileId: string;
    fileType:string;
  }],
  personId?: string;
}