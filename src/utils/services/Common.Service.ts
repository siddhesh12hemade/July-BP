import axios from 'axios';
import { Constants } from '../constants/constants';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileOpener } from '@awesome-cordova-plugins/file-opener';
import { ApiConfig, ApiResult } from '../interfaces/App.interface';
import i18n from '../translations';
import { systemException } from '../sentry/common.service';
import _ from 'lodash';


export class CommonService {
	static statusToDisplayFormat(status: string) {
		if (status === undefined) return '';
		status = status.replaceAll('_', ' ');
		status = status.toLowerCase();
		let statusWords = status.split(' ');
		for (let i = 0; i < _.size(statusWords); i++) {
			statusWords[i] =
				statusWords[i].charAt(0).toUpperCase() + statusWords[i].slice(1);
		}
		status = statusWords.join(' ');
		return status;
	}

	static convertBlobToBase64 = (blob: Blob) =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onerror = reject;
			reader.onload = () => {
				resolve(reader.result);
			};
			reader.readAsDataURL(blob);
		});

	static async fetchApplicationDocumentRead(obj: any) {
		try {
			const documentsReadAPI = Constants.APPLICATION_DETAIL_DOCUMENT_READ;
			let res = await axios.get(
				`${process.env.REACT_APP_ACTYV_GO_SVC_URL}${documentsReadAPI}${obj.fileId}`,
				{
					responseType: 'blob',
				}
			);

			return {
				status: Constants.API_SUCCESS,
				data: res.data,
				url: `${process.env.REACT_APP_ACTYV_GO_SVC_URL}${documentsReadAPI}${obj.fileId}`,
			};
		} catch (e) {
			let obj = {
				fileName: 'Common.Service.ts',
				functionName: 'fetchApplicationDocumentRead()',
				error: e,
			};
			systemException(obj);
			if (axios.isAxiosError(e)) {
				return {
					status: Constants.API_FAIL,
					message: e.message,
				};
			} else {

				return { status: Constants.API_FAIL, message: i18n.t("SOMETHING_WENT_WRONG_MSG") };
			}
		}
	}

	static readFilesPDF = async (blob: Blob, type: any, path: any) => {
		const name = path;
		const base64 = (await this.convertBlobToBase64(blob)) as string;

		const savedData = await Filesystem.writeFile({
			path: `${name}.pdf`,
			data: base64,
			directory: Directory.Documents,
		});

		FileOpener.open(savedData.uri, type)
			.then(() => { })
			.catch((e) => {
				let obj = {
					fileName: 'Common.Service.ts',
					functionName: 'readFilesPDF()',
					error: e,
				};
				systemException(obj);
			});
	};


	static async apiCall<T>(obj: ApiConfig): Promise<ApiResult<T>> {
		try {
			let url = obj.api_url;
			if (obj.method === 'post') {
				let res = await axios.post<any>(url, obj?.data, {
					headers: obj?.headers,
					params: obj?.param_data,
				});
				return {
					status: Constants.API_SUCCESS,
					data: res.data,
				};
			} else if (obj.method === 'get') {
				let res = await axios.get<any>(url, {
					headers: obj?.headers
				});
				return {
					status: Constants.API_SUCCESS,
					data: res.data,
				};
			} else {
				return {
					status: Constants.API_FAIL,
					message: 'Invalid method type',
				};
			}
		} catch (e) {
			let obj = {
				fileName: 'Common.Service.ts',
				functionName: 'apiCall()',
				error: e,
			};
			systemException(obj);
			if (axios.isAxiosError(e)) {
				return {
					status: Constants.API_FAIL,
					message: e.message,
					error: e,
					code: e.code
				};
			} else {
				return {
					status: Constants.API_FAIL,
					message: i18n.t("SOMETHING_WENT_WRONG_MSG"),
					error: e,
				};
			}
		}
	}

}
