import { IBusinessPartner, IEnterprise } from "../interfaces/App.interface";
import { IDocumentToRouteMapping, IPlatformDocument } from "../interfaces/DocumentVault.interface";
import { IErrors } from "../interfaces/Login.interface";
import i18n from "../translations";

export const stepStatusIcons = {
  finish:
    "https://actyv-platform-assets.s3.ap-south-1.amazonaws.com/icons/small-tick-done.svg",
  process:
    "https://actyv-platform-assets.s3.ap-south-1.amazonaws.com/icons/wait-clock.svg",
  error:
    "https://actyv-platform-assets.s3.ap-south-1.amazonaws.com/icons/error.svg",
};




export const BaseErrorObject: IErrors = {
  EMAIL: { status: false, messages: [] },
  PASSWORD: { status: false, messages: [] },
  LOGIN: { status: false, messages: [] },
  FORGOTPASSWORD: { status: false, messages: [] },
  PHONE: { status: false, messages: [] },
  OTP: { status: false, messages: [] },
};

export const DEFAULT_BP: IBusinessPartner = {
  _id: "",
  businessName: "",
  gstin: "",
};

export const DEFAULT_ENTERPRISE: IEnterprise = {
  _id: "",
  eSignReturnURL: "",
  eSignTenant: "",
  key: "",
  name: "",
  theme: {},
};

export const FixedValues = {
  FROM_VAULT: "BPdocumentVault",
}

export class Constants {
  static API_SUCCESS = "SUCCESS";
  static OTP_SENT = "OTP_SENT";
  static VERIFIED="VERIFIED";
  static FEATURE_UNAVAILABLE_MSG = "This feature is unavailable.";
  static API_FAIL = "FAIL";
  static VALID_PHONE = 10;
  static ITEMS_PER_PAGE = 30;
  static DEBOUNCE_TIME = 600;
  static APPLICATION_LIST_API =
    "/api/business-partner-application/application-list/";
  static CREATE_PASSWORD = "api/user/createPassword";
  static APP_STRING = "app";
  static API_STRING = "api";
  static APP_STATUS = ["COMPLETED", "REJECTED"];

  static DOC_STATUS_UPLOAD_KEY = "UPLOAD";
  static DOC_STATUS_E_VERIFY_KEY = "E_VERIFY";
  static DATA_UNAVAILABLE_MSG = 'Data not available.';
  static DOC_STATUS_ERROR_VALUE = "ERROR";
  static DOC_STATUS_PENDING_VALUE = "PENDING";
  static DOC_STATUS_NOT_STARTED_VALUE = "NOT_STARTED";
  static APPLICATION_DETAIL_DOCUMENT_READ = "/api/file/read/";
  static DOC_STATUS_COMPLETED_VALUE = "COMPLETED";
  static STATUS_CODE_SUCCESS = "101";
  static STATUS_CODE_CIN_SUCCESS = "100";
  static DOCUMENT_STEPS_BREAK_AFTER_LENGTH = 9;
  static APP_FILTER = [
    {
      id: 1,
      filter: i18n.t("FILTER_ALL_APP"),
      value: "",
    },
    {
      id: 2,
      filter: i18n.t("FILTER_STATUS_PENDING"),
      value: "PENDING",
    },
    {
      id: 3,
      filter: i18n.t("FILTER_STATUS_INITIATED"),
      value: "INITIATED",
    },
    {
      id: 4,
      filter: i18n.t("FILTER_STATUS_IN_PROGRESS"),
      value: "IN_PROGRESS",
    },
    {
      id: 5,
      filter: i18n.t("FILTER_STATUS_COMPLETED"),
      value: "COMPLETED",
    },
    {
      id: 6,
      filter: i18n.t("FILTER_STATUS_DOCUMENT_CAPTURE"),
      value: "DOCUMENT_CAPTURE",
    },
    {
      id: 7,
      filter: i18n.t("FILTER_STATUS_REJECTED"),
      value: "REJECTED",
    },
  ];

  static CROSS_VALIDATION_STATUS_CLASS_MAPPING = {
    FAILED: "failed-text",
    SUCCESS: "verified-text",
    PENDING: "pending-text",
  };

  static CROSS_VALIDATION_STATUS_ICONS = {
    FAILED:
      "https://actyv-platform-assets.s3.ap-south-1.amazonaws.com/icons/failed.svg",
    SUCCESS:
      "https://actyv-platform-assets.s3.ap-south-1.amazonaws.com/icons/verified.svg",
    PENDING:
      "https://actyv-platform-assets.s3.ap-south-1.amazonaws.com/icons/pending.svg",
  };

  static DOC_STATUS_COLORS = {
    FAILED: "#D23E1C",
    SUCCESS: "#249674",
    PENDING: "#E17350",
  };

  static STATUS_ICONS = {
    error: "/img/ic_verification_failed.svg",
    success: "/img/ic_success.svg",
    pending: "/img/ic_pending.svg",
  };

  static ALLOWED_GST_MIME = [
    {
      mimeType: "application/pdf",
      displayValue: i18n.t("FILE_PDF"),
    },
  ];

  static ALLOWED_ITR_MIME = [
    {
      mimeType: "application/pdf",
      displayValue: i18n.t("FILE_PDF"),
    },
  ];

  static ALLOWED_AADHAR_MIME = [
    {
      mimeType: "application/pdf",
      displayValue: i18n.t("FILE_PDF"),
    },
    {
      mimeType: "image/jpeg",
      displayValue: i18n.t("FILE_JPG"),
    },
  ];

  static ALLOWED_GSTR_FILE_MIME = [
    {
      mimeType: "application/pdf",
      displayValue: i18n.t("FILE_PDF"),
    },
  ];

  static ALLOWED_BANK_STATEMENT_MIME = [
    {
      mimeType: "application/pdf",
      displayValue: i18n.t("FILE_PDF"),
    },
  ];

  static ALLOWED_PAN_MIMES = [
    {
      mimeType: "image/jpg",
      displayValue: i18n.t("FILE_JPG"),
    },
    {
      mimeType: "image/jpeg",
      displayValue: i18n.t("FILE_JPEG"),
    },
    {
      mimeType: "image/png",
      displayValue: i18n.t("FILE_PNG"),
    },
  ];

  static ALLOWED_UDYAM_MIMES = [
    {
      mimeType: "application/pdf",
      displayValue: i18n.t("FILE_PDF"),
    },
  ];

  static AADHAR_SIDES = [
    {
      display: i18n.t("AADHAAR_FRONT"),
      value: "AADHAAR_FRONT",
      upload_key:"AADHAR_FRONT"
    },
    {
      display: i18n.t("AADHAAR_BACK"),
      value: "AADHAAR_BACK",
      upload_key:"AADHAR_BACK"
    },
  ];
  static GST_CERTIFICATE_MAX_FILE_SIZE_MB = 5;
  static PAN_CERTIFICATE_MAX_FILE_SIZE_MB = 5;
  static UDYAM_CERTIFICATE_MAX_FILE_SIZE_MB = 5;
  static ITR_MAX_FILE_SIZE_MB = 5;
  static GSTR_MAX_FILE_SIZE_MB = 5;
  static BANK_STMT_MAX_FILE_SIZE_MB = 5;
  static AADHAR_MAX_FILE_SIZE_MB = 5;
  static MB_CONVERTER = 1000000;

  static DOC_TYPE_GST: keyof IPlatformDocument = "GST";
  static DOC_TYPE_PERSONAL_PAN: keyof IPlatformDocument = "PERSONAL_PAN";
  static DOC_TYPE_BUSINESS_PAN: keyof IPlatformDocument = "BUSINESS_PAN";
  static DOC_TYPE_ITR: keyof IPlatformDocument = "ITR";
  static DOC_TYPE_BANK_STATEMENT: keyof IPlatformDocument = "BANK_STATEMENT";
  static DOC_TYPE_GSTR_FILES: keyof IPlatformDocument = "GSTR_FILES";
  static DOC_TYPE_UDHYAM: keyof IPlatformDocument = "UDYAM";
  static DOC_TYPE_AADHAAR: keyof IPlatformDocument = "AADHAAR";
  static DOC_TYPE_CIN: keyof IPlatformDocument = "CIN";
  static TIMESTAMP_EXT = '-10T18:30:00.000Z';
  static DEFAULT_DROP_DOWN_OPTIONS: [{ value: ""; label: "No options listed" }];
  static TOAST_DURATION = 2500;
  static FOLDER_ICON =
    "https://actyv-platform-assets.s3.ap-south-1.amazonaws.com/icons/folder.png";
  static CROSS_ICON: "https://actyv-platform-assets.s3.ap-south-1.amazonaws.com/icons/cross.png";

  static documentToRouteMapping: IDocumentToRouteMapping = {
    AADHAAR: "aadhaar-verification",
    PERSONAL_PAN: "pan-verification",
    BUSINESS_PAN: "business-pan-verification",
    GST: "gst-certificate",
    BANK_STATEMENT: "bank-statement",
    ITR: "itr-upload",
    UDYAM: "udyam-Verification",
    GSTR_FILES: "gst-return-pdf-upload",
    CIN: "cin-verification",
    CUSTOM_FORM: "app/custom-form",
    BANK_CUSTOM_FORM: "bank-form",
    MISCELLANEOUS_DOCUMENT: "miscellaneous-documents",
    BUREAU: "bureau",
    GSTR: "gstr",
};
static GST_FILING_STATUS_ICONS = {
  ERROR: "https://actyv-platform-assets.s3.ap-south-1.amazonaws.com/icons/error.svg",
  COMPLETED: "https://actyv-platform-assets.s3.ap-south-1.amazonaws.com/icons/small-tick-done.svg",
  NOT_STARTED: "https://actyv-platform-assets.s3.ap-south-1.amazonaws.com/icons/wait-clock.svg",
  PENDING: "https://actyv-platform-assets.s3.ap-south-1.amazonaws.com/icons/wait-clock.svg",
};

static PASSWORD_POPOVER_TEXT = `Password Policy <br>
1. Minimum Length: 8 <br>
2. Minimum Lowercase: 1<br>
3. Minimum Uppercase: 1<br>
4. Minimum Numbers: 1<br>
5. Minimum Special Characters:1`;

static EMAIL_POPOVER_TEXT = 'Email verification via OTP is optional';
static MOBILE_POPOVER_TEXT = 'Mobile verification via OTP is mandatory'
}
