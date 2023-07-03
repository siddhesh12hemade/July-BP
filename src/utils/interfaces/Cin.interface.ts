export interface IUpdateCinDocument {
	fileId: string;
	documentType: string;
	data: object;
}

export interface IErrorState {
	cinNumber: boolean;
	captchaCode: boolean;
}

export interface IInitialFormState {
	cinNumber: string;
	captchaCode: string;
	error: IErrorState;
}

type LoaderStatus = "idle" | "loading" | "failed" | "success";

export interface ICinVerificationState {
	initiateCinVerificationStatus: LoaderStatus;
	initiateCaptchaVerificationStatus: LoaderStatus;
	initiateUpdateAndSaveDocumentStatus: LoaderStatus;
	formState: IInitialFormState;
	captchaImage: Buffer | string;
	cinVerificationResponse: object;
	isCaptchaModalVisible: boolean;
	isCINVerified: boolean;
	cinVerificationInfo: object;
	verificationStatus: string;
}

export interface IInitiateCINVerification {
	cinNumber: string;
}

export interface IVerifyCINCaptcha {
	cinNumber: string;
	captchaCode: string;
	businessPartnerId:string;
}

export interface IInitiateCINVerificationResponse {
	response: {
		'status-code': string;
		data: Buffer;
	}
}

export interface IVerifyCINCaptchaResponse {
	response: {
		'status-code': string;
		message: string;
		companyLLPInfo: object;
		directorInfo: object;
		chargesInfo: object;
	}
}

export interface INotificationProps {
	type: "success" | "info" | "warning" | "error";
	context: string;
}