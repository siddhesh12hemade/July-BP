export interface IApplicationEntry {
    applicationId: string
    type: string
    status: string
    enterpriseName: string
    region: string
    businessPartnerId: string
    gstin: string
    createdAt: string
    updatedAt: string
  }    
  
export interface IApplicationAndDocumentCount{
    applications: IApplicationEntry[];
    documentCount: Number;
  }
  