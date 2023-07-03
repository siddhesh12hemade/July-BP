import { IonCol, IonContent, IonImg, IonPopover, IonRow } from '@ionic/react';
import { useRef, useState } from 'react';
import i18n from '../utils/translations';
var classNames = require("classnames");
const DocumentStatusComponent: React.FC<{
	colorClass: string;
	icon: string;
	statusText: string;
	updatedOn: string,
	description: string,	
}> = ({
	colorClass,
	icon,
	statusText,
	updatedOn,
	description,
}) => {
		const [popOverOpen, setpopOverOpen] = useState(false);
		const popover = useRef<HTMLIonPopoverElement>(null);
		const openPopover = (e: any) => {
			console.log("OPEN POPOVER")
			popover.current!.event = e;
			setpopOverOpen(true);
		};
		

		return (
			<IonRow
				className={classNames(
					"uploaded-infobox ion-text-center " +
					colorClass
				)}
			>
				<IonCol className="py-0 ion-align-self-center">
					<p className="fs-10 fw-600 white-heading d-flex ion-justify-content-center ion-align-items-center mb-0">
						<img src={icon} alt="" />
						<span className="mx-10">
							{statusText}
						</span>
						{
							[i18n.t("UPLOAD_ERROR"),i18n.t("EVERIFY_ERROR")].includes(statusText) && (
								<span>
									<IonImg id="click-trigger"
										className=""
										src="./img/i-sign-white.svg"
									></IonImg>
									<IonPopover trigger="click-trigger" triggerAction="click">
										<IonContent
											class="ion-padding">
											{description}
										</IonContent>
									</IonPopover>
								</span>
							)
						}
					</p>
				</IonCol>
				<IonCol className="py-0 ion-align-self-center">
					<p className="fs-10 fw-400 white-heading mb-0">
						<span>{updatedOn}</span>
					</p>
				</IonCol>
			</IonRow>
		);
	};

export default DocumentStatusComponent;
