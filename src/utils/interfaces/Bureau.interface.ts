export interface IBureauState {
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  age: string;
  mobileNumber1: string;
  email: string;
  pan: string;
  fatherName: string;
  addresss1: string;
  village1: string;
  city1: string;
  state1: string;
  pin1: string;
  country1: string;
  errors: IErrors;
  displayQuestion: Boolean;
  questionText: string;
  answerList: string[];
  answerType: "RADIO" | "TEXT";
  answerText: string;
  orderId: string;
  reportId: string;
  initateReportGenerationStatus: "idle" | "loading" | "failed" | "success";
  submitAnswerStatus: "idle" | "loading" | "failed" | "success";
  toastMessage: string;
  score: string;
  dateOfRequest: string;
  dateOfIssue: string;
  alreadyExists: boolean;
  persons: IPersonData[];
  selectedPerson: IPersonData;
}

export interface IPersonData {
  panNumber: string;
  name: string;
  dob: string;
  careOf: string;
  district: string;
  state: string;
  country: string;
  subDistrict: string;
  gender: string;
  pinCode: string;
  address: string;
  aadhaarNumber: string;
  phone: string;
  email: string;
}

export interface IGenerateReportRequest {
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  age: number;
  mobileNumber1: string;
  email: string;
  pan: string;
  fatherName: string;
  addresss1: string;
  village1: string;
  city1: string;
  state1: string;
  pin1: string;
  country1: string;
  businessPartnerId: string;
}

export interface ExistingBureauServiceResponse {
  exists: boolean;
  score: string;
  dateOfRequest: string;
  dateOfIssue: string;
  reportId: string;
}

export interface IBureauQuestionAnswerRequest {
  orderId: string;
  reportId: string;
  userAns: string;
}

export interface IFetchBureauReportRequest {
  orderId: string;
  reportId: string;
  businessPartnerId: string;
}

export interface IGenerateReportResponse {
  errors: IErrors;
  statusCode: string;
  message: string;
  data: {
    isError: boolean;
    isQuestionnaire: boolean;
    question: string;
    optionsList: string[];
    buttonBehaviour: string;
    buttonbehaviour: string;
    orderId: string;
    reportId: string;
    passedStageValue: number;
    userInfo: IGenerateReportRequest;
    status: string;
  };
}

export interface IErrorValue {
  status: boolean;
  messages: string[];
}

export interface IErrors {
  FIRST_NAME: IErrorValue;
  LAST_NAME: IErrorValue;
  GENDER: IErrorValue;
  DOB: IErrorValue;
  AGE: IErrorValue;
  MOBILE_NUMBER_1: IErrorValue;
  EMAIL: IErrorValue;
  PAN: IErrorValue;
  FATHER_NAME: IErrorValue;
  ADDRESS_1: IErrorValue;
  VILLAGE_1: IErrorValue;
  CITY_1: IErrorValue;
  STATE_1: IErrorValue;
  PIN_1: IErrorValue;
  COUNTRY_1: IErrorValue;
  ANSWER_TEXT: IErrorValue;
}
