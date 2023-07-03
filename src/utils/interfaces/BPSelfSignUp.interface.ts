
import { IPrevalidatedUser } from "./App.interface";
import { ApplicationConfig } from "./BPInvite.interface";

export interface IBPSelfSignupState {
  businessName: string;
  applicantMobile: string;
  applicantEmail: string;
  password: string;
  gstin: string;
  messageToDisplay: string;
  status: "idle" | "loading" | "failed" | "success";
  errors: IErrors;
  gstVerificationStatus: "idle" | "loading" | "failed" | "success" | "otp_sent";
  gstVerificationErrors: GSTVerificationErrors;
  verificationErrors: VerificationErrors;
  gstUsername: string;
  gstOtp: string;
  gstVerificationModalOpen: boolean;
  inviteError: boolean;
  inviteId: string;
  gstVerificationErrorMessage: string;
  inviteErrorMessage: string;
  firstName: string;
  lastName: string;
  formSchema: any;
  fieldValues: any;
  applicationConfigId: string;
  enterpriseFormConfigKey: string;
  selectedApplicationConfig: ApplicationConfig;
  emailVerificationOtp: string;
  phoneVerificationOtp: string;
  emailVerificationStatus: string;
  phoneVerificationStatus: string;
  emailVerificationModalOpen: boolean;
  phoneVerificationModalOpen: boolean;
  additionalFormState: object;
  existingBusinessPartnerId: string;
  existingGstinStatus: string;
  registerAsAnchor: "YES" | "NO";
  isConsentAccepted: boolean;
  preValidatedUserData: IPrevalidatedUser;
  userPreValidationStatus: "INVALID" | "VALID";
  inviteDetails: object;
}

export interface IRequestGSTOtp {
  gstin: string;
  gstUsername: string;
}

export interface ITAndC {
  TERMS_OF_USE: string;
  PRIVACY_POLICY: string;
  CONSENT: string;
  TERMS_AND_CONDITIONS: string;
}

export interface IRequestGSTVerifyOtp {
  gstin: string;
  gstUsername: string;
  otp: string;
}

export interface BusinessPartnerInviteRequest {
  businessPartnerInviteId: string;
}

export interface BusinessPartnerInviteResponse {
  statusCode: string;
  businessPartnerInvite: ISignupRequest;
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

export interface VerificationErrors {
  EMAIL_OTP: boolean;
  PHONE_OTP: boolean;
}

export interface IErrorValue {
  status: boolean;
  messages: string[];
}

export interface IErrors {
  BUSINESS_NAME: IErrorValue;
  APPLICANT_MOBILE: IErrorValue;
  APPLICANT_EMAIL: IErrorValue;
  PASSWORD: IErrorValue;
  GSTIN: IErrorValue;
  APPLICANT_FNAME: IErrorValue;
  APPLICANT_LNAME: IErrorValue;
  CONSENT: IErrorValue;
  USER_PREVALIDATION: IErrorValue;
}

export interface IOrganizationTypeItem {
  value: string;
}

export type IOrganizationTypes = Array<IOrganizationTypeItem>;

interface IIdentifyYourselfItem {
  value: string;
}

export type IIdentifyYourselfItems = Array<IIdentifyYourselfItem>;

export interface ISignupResponse {
  statusCode: string;
  message: string;
  errors: IErrors;
}

export interface ISignupRequest {
  businessName: string;
  applicantMobile: string;
  applicantEmail: string;
  password: string;
  gstin: string;
  inviteId: string;
  firstName: string;
  lastName: string;
  fieldValues: object;
  applicationConfigId: string;
  existingBusinessPartnerId?: string;
  registerAsAnchor: string;
  isConsentAccepted: boolean;
  enterpriseFormConfigKey?: string;
}

export interface EmailVerificationRequest {
  email: string;
  fname: string;
  lname: string;
}

export interface PhoneVerificationRequest {
  phone: string;
  fname: string;
  lname: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface VerifyPhoneRequest {
  phone: string;
  otp: string;
}

export interface VerificationInitResponse {
  success?: boolean;
  message: string;
}

export interface VerifyGstinRequest {
  businessPartnerId: string;
  gstin: string;
}

export interface GstinValidationResponse {
  statusCode: string;
}

export interface IPrevalidationResponse {
  status: "INVALID" | "VALID";
  userData: IPrevalidatedUser;
}

export interface PrevalidateUserRequest {
  email: string;
  phone: string;
}
