import { IonImg } from '@ionic/react';
import { Constants } from '../utils/constants/constants';
import { IFile } from '../utils/interfaces/DocumentVault.interface';
import { CommonService } from '../utils/services/Common.Service';
import { Helpers } from '../utils/utils/Helpers';

const FileDisplayComponent = (props: {
	uploadedFile: IFile;
	showDelete?: boolean;
	displayTitle?: boolean;
	onDelete?: any;
}) => {
	const readDocument = async () => {
		let obj = {
			fileId: props.uploadedFile?.fileId,
		};

		let res = await CommonService.fetchApplicationDocumentRead(obj);
		if (res.status === Constants.API_SUCCESS) {
			CommonService.readFilesPDF(
				res.data,
				props.uploadedFile?.fileType,
				props.uploadedFile?.fileId
			);
		}
	};

	const url = () => {
		return `${process.env.REACT_APP_ACTYV_GO_SVC_URL}/${Constants.API_STRING}/file/read/${props.uploadedFile?.fileId}`;
	};

	const isImage = () => {
		return Helpers.isImage(props.uploadedFile?.fileType);
	};

	return (
		<div className='uploaded-preview-wrapper'>
			{props.showDelete && (
				<div className='cross-btn-wrp-lg'>
					<IonImg
						onClick={
							() => {
								props.onDelete()								
							}
						}
						src='./img/partner-img/cross-btn.svg'
						className='cross-btn-innr'
					></IonImg>
				</div>
			)}
			{isImage() ? (
				<div
					className='mb-5 overflow-h border-round mx-auto'
					onClick={() => {
						readDocument();
					}}
				>
					<IonImg className='mw-100 uploaded-preview' src={url()}></IonImg>
				</div>
			) : (
				<div
					className='mb-5 uploaded-img-wrap mx-auto'
					onClick={() => {
						readDocument();
					}}
				>
					<IonImg
						alt='pdf-icon'
						src='./img/partner-img/pdf-icon.png'
						className='p-5'
					></IonImg>
				</div>
			)}

			{
				(props.displayTitle == null || props.displayTitle === true) && (
					<div className='file-name'>
						<p className='fs-12 fw-400'>{props.uploadedFile?.title}</p>
					</div>
				)
			}

		</div>
	);
};

export default FileDisplayComponent;
