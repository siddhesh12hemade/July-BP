import { IFile } from "./DocumentVault.interface"

export interface PanDocRes {
  statusCode: string
  message: string
  document: Document[]
}

export interface PanDocument {
  name: string
  phone: string
  relation: string
  personId: string
  documentInfo: PanDocumentInfo
}

export interface PanDocumentInfo {
  files: IFile[]
  _id: string
  status: Status[]
  documentType: string
  data: PanData
  documentNo: string
  endDate: string
  startDate: string
  createdOn: string
  createdBy: string
  isDeleted: boolean
  __v: number
  updatedBy: string
  updatedOn: string
}

export interface Status {
  name: string
  value: string
  description: string
  title: string
  ts: string
  userId: string
}

export interface PanData {
  panNumber: string
  name: string
  dob: string
}

export interface IBusinessPartnerGstinResponse {
  gstin: string;
  businessName: string;
}