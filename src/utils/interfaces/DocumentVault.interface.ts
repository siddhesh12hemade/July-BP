import {
  AadhaarVerificationMethods,
  BankStatementVerificationMethods,
  CINVerificationMethods,
  CustomFormVerificationMethods,
  GstrFilesVerificationMethods,
  GstrVerificationMethods,
  GstVerificationMethods,
  ItrVerificationMethods,
  MiscellaneousDocumentVerificationMethods,
  PanVerificationMethods,
  UdyamVerificationMethods
} from "../enums/DocumentVault.enums";

export interface IDocumentVaultState extends IPlatformConfig {
  documentVaultLoading: "idle" | "loading" | "failed" | "success";
  crossValidations: ICrossValidation[];
}

export interface ICrossValidation {
  type: string;
  status: "PENDING" | "FAILED" | "SUCCESS";
  description: string;
  businessPartnerId: string;
  ts: string;
  metaInfo:MetaInfo;
}
export interface MetaInfo {
  gstin:string;
  personName:string;
}
export interface ISpan {
  year: string;
  months: string[];
  financialYear: string;
}

export interface ISpanResponse {
  years: number[];
  months: ISpan[];
  quarters: ISpan[];
  financialYears: string[];
  assessmentYears: string[];
}

export interface IFile {
  type: string;
  fileId: string;
  fileType: string;
  title?:string
}

export interface IUploadAndSaveDocument {
  files: IFile[];
  documentType: string;
  documentNo: string;
  startDate: string;
  endDate: string;
  data: object;
  personId: string;
  businessPartnerId: string;
  isVerified?: boolean;
  status?: string[]
}

export interface IUdhyamOtpInitiate {
  phoneNumber: string;
  udyamNumber: string;
}

export interface IUdhyamOtpVerify {
  udyamData: object;
  uploadAndSaveDocumentRequest: object;
}

export interface IPlatformConfigResponse {
  statusCode: string;
  config: {
    documents: IPlatformDocument;
  };
}

export interface IErrorValue {
  status: boolean;
  messages: string[];
}

export interface IErrors {
  FILE: IErrorValue;
  UDYAM_NUMBER: IErrorValue;
}

export interface IUploadAndSaveDocumentResponse {
  errors: IErrors;
  statusCode: string;
  message: string;
  documentId: string;
}

export interface IUdhyamOtpInititeResponse {
  statusCode: string;
  message: string;
  success: boolean;
}

export interface IUdhyamOtpVerifyResponse {
  statusCode: string;
  message: string;
  success: boolean;
  data: any;
}

export interface IPlatformConfig {
  readonly documents: IPlatformDocument;
}

export interface IDocumentStatus {
  name:string;
  value: string;
  description: string;
  title: string;
}

export interface IDocument {
  files?: IFile[];
  displayName: string;
  icon: string;
  statusTitle: string;
  status: IDocumentStatus[];
  eVerificationRequired: boolean;
  lastNoOfMonthsRequired: number;
  lastNoOfMonthsGroupBy: "month" | "year";
  endDate: string;
  startDate: string;
  financial: boolean;
  documentNo?: string;
  updatedOn?: string;
  data?: any
}

// ===================== AADHAAR =====================

export interface IAadhaarMethod {
  name: AadhaarVerificationMethods;
}

export interface IAadhaar extends IDocument {
  methods: IAadhaarMethod[];
}

export interface AadharDataApiRes  {
  name?: string
  dob?: string
  gender?: string
  careof?: string
  district?: string
  pin_code?: string
  state?: string
  stateName?: string
  photo?: string
  aadharNumber?: number
  building?: string
  street?: string
  locality?: string
  eid?: string
  vtcName?: string
  poName?: string
  address?: string
}

export interface AadharData {
  aadhaarNumber?: string
  name?: string
  careOf?: string
  gender?: string
  dob?: string
  district?: string
  subDistrict?: string
  address?: string
  state?: string
  pinCode?: string
  country?: string            
}

// ===================== PAN =====================

export interface IPanMethod {
  name: PanVerificationMethods;
}

export interface IPan extends IDocument {
  methods: IPanMethod[];
}

// ===================== GST Certificate =====================

export interface IGstMethod {
  name: GstVerificationMethods;
}

export interface IGST extends IDocument {
  methods: IGstMethod[];
}

// ===================== BANK STATEMENT =====================

export interface IBankStatementMethod {
  name: BankStatementVerificationMethods;
}

export interface IBankStatement extends IDocument {
  methods: IBankStatementMethod[];
}

// ===================== MISCELLANEOUS DOCUMENT =====================

export interface IMiscellaneousDocumentMethod {
  name: MiscellaneousDocumentVerificationMethods;
}

export interface IMiscellaneousDocument extends IDocument {
  methods: IMiscellaneousDocumentMethod[];
}

// ===================== ITR =====================

export interface IItrMethod {
  name: ItrVerificationMethods;
}

export interface IItr extends IDocument {
  methods: IItrMethod[];
}

// ===================== GSTR =====================

export interface IGstrMethod {
  name: GstrVerificationMethods;
}

export interface IGstr extends IDocument {
  methods: IGstrMethod[];
}

// ===================== UDYAM =====================

export interface IUdyamMethod {
  name: UdyamVerificationMethods;
}

export interface IUdyam extends IDocument {
  methods: IUdyamMethod[];
}

// ===================== GSTR FILES =====================

export interface IGstrFileMethod {
  name: GstrFilesVerificationMethods;
}

export interface IGstrFile extends IDocument {
  methods: IGstrFileMethod[];
}

// ===================== CIN =====================

export interface ICINMethod {
  name: CINVerificationMethods;
}

export interface ICIN extends IDocument {
  methods: ICINMethod[];
}

// ===================== CUSTOM_FROM =====================
export interface ICustomFormMethod {
  name: CustomFormVerificationMethods;
}

export interface ICustomForm extends IDocument {
  methods: ICustomFormMethod[];
}

// ===================== PLATFORM DOCUMENTS =====================

export interface IPlatformDocument {
  AADHAAR: IAadhaar;
  PERSONAL_PAN: IPan;
  BUSINESS_PAN: IPan;
  GST: IGST;
  CIN: ICIN;
  BANK_STATEMENT: IBankStatement;
  ITR: IItr;
  GSTR3B_RETSUM: IGstr;
  GSTR2A_B2B: IGstr;
  GSTR2A_RETSUM: IGstr;
  GSTR1_EXP: IGstr;
  GSTR1_B2B: IGstr;
  GSTR1_CDNR: IGstr;
  GSTR1_HSNSUM: IGstr;
  GSTR1_CDNUR: IGstr;
  GSTR1_B2CL: IGstr;
  GSTR1_CDN: IGstr;
  GSTR1_NIL: IGstr;
  GSTR1_B2CS: IGstr;
  UDYAM: IUdyam;
  GSTR_FILES: IGstrFile;
  MISCELLANEOUS_DOCUMENT: IMiscellaneousDocument;
  CUSTOM_FROM: ICustomForm;
}

export interface IBusinessGstinDocumentHistory {
  documentNo: string;
  documentInfo?: IDocument;
}

export interface IIndividualPersonDocumentResponse {
  name: string;
  phone: string;
  relation: string;
  personId: string;
  documentInfo: IDocument;
}

export interface IPersonalDocumentFillResponse {
  statusCode: string;
  errors: IErrors;
  message: string;
  document: IIndividualPersonDocumentResponse[]
}


export interface IBusinessDocumentPreFillResponse {
  statusCode: string;
  errors: IErrors;
  message: string;
  document: Array<any>
}

export interface UploadedFile extends IFile {
  startDate?: string,
  endDate?: string,
  isNew?:boolean
}
export interface UploadObj {
  files: UploadedFile[],
  loading: boolean,
}

export interface IDocumentToRouteMapping {
  AADHAAR: string;
  PERSONAL_PAN: string;
  BUSINESS_PAN: string;
  GST: string;
  BANK_STATEMENT: string;
  ITR: string;
  UDYAM: string;
  GSTR_FILES: string;
  CIN: string;
  CUSTOM_FORM: string;
  MISCELLANEOUS_DOCUMENT: string;
  BANK_CUSTOM_FORM: string;
  GSTR: string;
  BUREAU: string;
}


export interface IStep {
  title: string;
  description: string;
  status: "error" | "finish" | "process" | "wait";
}

export interface IDocCard {
  data: string[][];
  verificationData: any[];
  applicationId: string;
  status: string;
  gstin:string
}
