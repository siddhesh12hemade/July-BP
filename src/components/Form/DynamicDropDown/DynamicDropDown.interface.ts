type LoaderStatus = "idle" | "loading" | "failed" | "success";

export interface IInitialFormState {
	ongoingCalls: string[];
	optionsState: object;
	formState: any;
	loaderStatus: object
}