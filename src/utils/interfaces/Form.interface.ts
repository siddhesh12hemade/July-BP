import { Field } from "@data-driven-forms/react-form-renderer";
type LoaderStatus = "idle" | "loading" | "failed" | "success";

export interface IFormConfigResponse {
	statusCode: string;
	enterpriseId: string;
	formKey: string;
	config: Field[]
}

export interface IFormSaveResponse {
	statusCode: string;
	message: string
}

export interface IInitialFormState {
  formKey: string;
  formConfig: Field[];
  formState: object;
  fetchFormConfigStatus: LoaderStatus;
  saveFormDataStatus: LoaderStatus;
  verificationLoaderStatus: LoaderStatus;
  editableGrid?: Object;
}
export interface INotificationProps {
  type: "success" | "info" | "warning" | "error";
  context: string;
}
