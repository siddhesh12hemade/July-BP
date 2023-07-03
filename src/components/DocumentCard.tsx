import { IonCard, IonCardContent, IonCol, IonImg, IonRow } from "@ionic/react";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Constants } from "../utils/constants/constants";
import {
  IDocCard,
  IPlatformDocument,
  IStep,
} from "../utils/interfaces/DocumentVault.interface";
import { toast } from "react-toastify";
import { RenderDocumentCard } from "./DocumentList";
var classNames = require("classnames");

const getDocumentsSummary = (documents: Object[]) => {
  const allStatuses: any[] = [];
  _.forEach(documents, (d) => allStatuses.push(..._.get(d, "status", [])));
  return _.countBy(allStatuses, (status) => `${status.name}:${status.value}`);
};

function DocumentStatus(docType: string, steps: any) {
  switch (docType) {
    case "BANK_STATEMENT":
    case "GSTR_FILES":
      return (
        <IonCardContent
          key={`${docType}}_status`}
          className="py-20 card-content card-content-footer"
        >
          <IonRow
            className={classNames("nine-in-one", {
              "ion-justify-content-center": _.size(steps) === 1,
            })}
          >
            {steps.map((step, index) => {
              return (
                <IonCol key={`${index}}_key`}>
                  <div className="d-flex ion-justify-content-center ion-align-items-center">
                    <IonImg
                      title={step.title}
                      className=""
                      src={`./img/${step.status}.svg`}
                    ></IonImg>
                    {(index === 0 || index === _.size(steps) - 1) && (
                      <h4 className="tooltip-text fs-12 fw-600">
                        {" "}
                        {step.title}
                      </h4>
                    )}
                  </div>
                </IonCol>
              );
            })}
          </IonRow>
        </IonCardContent>
      );
    case "GSTR":
    case "ITR":
      return (
        <IonCardContent
          key={`${docType}}_status`}
          className="py-0 card-content card-content-footer"
        >
          <IonRow className="ion-justify-content-around">
            {steps.map((step, index) => {
              return (
                <IonCol size="auto" key={`${index}}_key`}>
                  <div className="">
                    <div className="d-flex ion-justify-content-center">
                      <IonImg
                        className=""
                        src={`./img/${step.status}.svg`}
                      ></IonImg>
                    </div>
                    <h4 className="fs-12 fw-600 ion-text-center">
                      {" "}
                      {step.title}
                    </h4>
                  </div>
                </IonCol>
              );
            })}
          </IonRow>
        </IonCardContent>
      );
    default:
      return (
        <IonCardContent
          key={`${docType}}_status`}
          className="py-0 card-content card-content-footer"
        >
          <IonRow className="ion-justify-content-center">
            <IonCol size="auto">
              <div className="d-flex ion-align-items-center">
                <IonImg
                  className="mr-10"
                  src={`./img/${steps[_.size(steps) - 1].status}.svg`}
                ></IonImg>
                <h4 className="fs-12 fw-600">
                  {steps[_.size(steps) - 1].title}
                </h4>
              </div>
            </IonCol>
          </IonRow>
        </IonCardContent>
      );
  }
}

const DocumentCard: React.FC<IDocCard> = ({
  data,
  verificationData,
  applicationId = "",
  status,
  gstin,
}) => {
  return (
    <>
      {_.map(data, (documentNames, index) => {
        return (
          <>
            {_.map(documentNames, (a, b) => {
              return RenderDocumentCard(
                verificationData[a],
                applicationId,
                status,
                gstin
              );
            })}
          </>
        );
      })}
    </>
  );
};
export default DocumentCard;
