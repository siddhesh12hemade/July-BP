export interface IFile {
  component: string;
  key: string;
  name: string;
  documentType: string;
  fileType: string;
  label: string;
  placeholder: string;
  url: string;
  scope: string;
  type: string;
  validate: object;
}

export interface IMaxSize {
  type: string;
  maxSize: number;
}

export interface IFileData {
  fileId?: string;
  fileSize?: number;
  type?: string;
}
export interface IReturnValue {
  documentType: string;
  files: Array<IFileData>;
}
