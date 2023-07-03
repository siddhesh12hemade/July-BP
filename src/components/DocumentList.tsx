import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonImg,
  IonPopover,
  IonRow,
} from "@ionic/react";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Constants, stepStatusIcons } from "../utils/constants/constants";
import {
  IPlatformDocument,
  IStep,
} from "../utils/interfaces/DocumentVault.interface";
import { toast } from "react-toastify";
import { useRef, useState } from "react";
import { FixedValues } from "../utils/constants/constants";
const { FROM_VAULT } = FixedValues;

var classNames = require("classnames");

export function RenderDocumentCard(
  documents: Record<string, unknown>[],
  applicationId: string,
  status: string,
  gstin?: string
) {
  const { t } = useTranslation();
  const navigate = useHistory();
  const getDocumentsSummary = (documents: Object[]) => {
    const allStatuses: any[] = [];
    _.forEach(documents, (d) => allStatuses.push(..._.get(d, "status", [])));
    return _.countBy(allStatuses, (status) => `${status.name}:${status.value}`);
  };

  const groupedDocuments = _.groupBy(documents, "statusTitle");
  let formPayload: any = {
    status: [],
    displayName: "",
    eVerificationRequired: true,
    icon: "",
  };
  _.forEach(documents, (document) => {
    const documentStatuses = _.isArray(document.status) ? document.status : [];
    formPayload = {
      ...formPayload,
      ...document,
      status: [...formPayload.status, ...documentStatuses],
    };
  });

  if (_.size(Object.keys(groupedDocuments)) > 1) {
    let status: any[] = [];
    Object.keys(groupedDocuments).map((documentStatusTitle) => {
      const groupedStatus = getDocumentsSummary(
        groupedDocuments[documentStatusTitle]
      );
      const isUploadError =
        Object.keys(groupedStatus).includes("UPLOAD:ERROR") &&
        _.get(groupedStatus, "UPLOAD:ERROR", 0) > 0;
      if (isUploadError) {
        status.push({
          name: "UPLOAD",
          value: "ERROR",
          description: "",
          title: documentStatusTitle,
        });
      } else {
        const isUploadPending =
          Object.keys(groupedStatus).includes("UPLOAD:PENDING") &&
          _.get(groupedStatus, "UPLOAD:PENDING", 0) > 0;
        const isUploadNotStarted =
          Object.keys(groupedStatus).includes("UPLOAD:NOT_STARTED") &&
          _.get(groupedStatus, "UPLOAD:NOT_STARTED", 0) > 0;
        if (isUploadPending || isUploadNotStarted) {
          status.push({
            name: "UPLOAD",
            value: "PENDING",
            description: "",
            title: documentStatusTitle,
          });
        } else {
          status.push({
            name: "UPLOAD",
            value: "COMPLETED",
            description: "",
            title: documentStatusTitle,
          });
        }
      }
    });
    formPayload.status = status;
  }

  const { status: allStatuses } = formPayload || { status: [] };
  const steps: IStep[] = [];

  const uploadSteps: IStep[] = [];
  const eVerifySteps: IStep[] = [];
  const uploadStatuses = _.filter(allStatuses, { name: "UPLOAD" });

  uploadStatuses.map((uploadStatus) => {
    const { title, value, description } = uploadStatus;
    if (!uploadStatus.value) return;

    const mapping = {
      NOT_STARTED: {
        title: "UPLOAD_PENDING",
        status: "process",
      },
      PENDING: {
        title: "UPLOAD_PENDING",
        status: "process",
      },
      COMPLETED: {
        title: "UPLOAD_DONE",
        status: "finish",
      },
      ERROR: {
        title: "UPLOAD_ERROR",
        status: "error",
      },
    };

    uploadSteps.push({
      title: title || t(_.get(mapping, `${value}.title`)),
      description,
      status: _.get(mapping, `${value}.status`),
    });
  });

  const eVerificationRequired = formPayload?.eVerificationRequired;
  const lastNoOfMonthsRequired = formPayload?.lastNoOfMonthsRequired;
  const eVerifyStatuses = _.filter(allStatuses, { name: "E_VERIFY" });

  let isEverificationDone = false;
  eVerificationRequired &&
    eVerifyStatuses.map((eVerifyStatus) => {
      if (
        eVerifyStatus.value &&
        ["NOT_STARTED", "PENDING"].includes(eVerifyStatus.value)
      ) {
        eVerifySteps.push({
          title: eVerifyStatus.title
            ? eVerifyStatus.title
            : t("EVERIFY_PENDING"),
          description: eVerifyStatus.description,
          status: "process",
        });
      }

      if (eVerifyStatus.value && ["COMPLETED"].includes(eVerifyStatus.value)) {
        eVerifySteps.push({
          title: eVerifyStatus.title ? eVerifyStatus.title : t("EVERIFY_DONE"),
          description: eVerifyStatus.description,
          status: "finish",
        });
        isEverificationDone = true;
      }

      if (eVerifyStatus.value && ["ERROR"].includes(eVerifyStatus.value)) {
        eVerifySteps.push({
          title: eVerifyStatus.title ? eVerifyStatus.title : t("EVERIFY_ERROR"),
          description: eVerifyStatus.description,
          status: "error",
        });
        isEverificationDone = true;
      }
    });

  if (
    !isEverificationDone &&
    _.size(uploadSteps) &&
    uploadSteps[0].status === "process"
  ) {
    steps.push(...uploadSteps);
  } else {
    if (lastNoOfMonthsRequired === 0) {
      if (_.size(eVerifySteps)) steps.push(...eVerifySteps);
      else steps.push(...uploadSteps);
    } else steps.push(...uploadSteps, ...eVerifySteps);
  }

  let isMultiStepsRow = ["BANK_STATEMENT", "GSTR_FILES"].includes(
    formPayload.displayName
  );
  if (steps.length === 1) {
    isMultiStepsRow = false;
  }
  if (steps.length > Constants.DOCUMENT_STEPS_BREAK_AFTER_LENGTH) {
  }

  const navigateToDocumentSpecificRoute = (
    documentType: string,
    route: string,
    tileInfo: object,
    gstin?: string
  ) => {
    const customFormKey = _.get(tileInfo, "formKey", false);
    const title = t(_.get(tileInfo, "displayName"));
    const description = _.get(tileInfo, "description");
    const formattedDescription = !_.isEmpty(description)
      ? description
      : t(`${_.get(tileInfo, "displayName")}_DESCRIPTION`);
    if (customFormKey) {
      navigate.push(route, {
        state: {
          formKey: customFormKey,
          title,
          description: formattedDescription,
          applicationId,
        },
      });
    } else {
      if (Object.keys(Constants.documentToRouteMapping).includes(documentType))
       navigate.push(route, { state: { gstin } });
      else toast.warning(Constants.FEATURE_UNAVAILABLE_MSG);

      
    }
  };

  const getRouteEndPoint = (displayName: keyof IPlatformDocument) => {
    let endPoint;
    switch (true) {
      case displayName.includes("BANK_CUSTOM_FORM"):
        endPoint = Constants.documentToRouteMapping["BANK_CUSTOM_FORM"];
        break;

      case displayName.includes("CUSTOM_FORM"):
        endPoint = Constants.documentToRouteMapping["CUSTOM_FORM"];
        break;

      case displayName.includes("MISCELLANEOUS_DOCUMENT"):
        endPoint = Constants.documentToRouteMapping["MISCELLANEOUS_DOCUMENT"];
        break;

      default:
        endPoint = _.get(Constants.documentToRouteMapping, displayName);
        break;
    }
    return endPoint;
  };

  let documentType = _.get(formPayload, "documentType")
    ? _.get(formPayload, "documentType")
    : _.get(formPayload, "displayName");

  const getStepsAlignment = () => {
    if (_.size(steps) === 1) return "center";
    else {
      if (isMultiStepsRow) return "center";
      else return "space-between";
    }
  };

  const getRowType = (index) => {
    var totalRows = Math.ceil(
      steps.length / Constants.DOCUMENT_STEPS_BREAK_AFTER_LENGTH
    );
    var currentRow = Math.ceil(
      (index + 1) / Constants.DOCUMENT_STEPS_BREAK_AFTER_LENGTH
    );
    if (currentRow === 1) return "first";
    else if (currentRow === totalRows) return "last";
    else return "middle";
  };

  const getTopHeightForStep = (index) => {
    let rowType = getRowType(index);
    if (rowType !== "first") return "4px";
    else return "18px";
  };

  const getBottomHeightForStep = (index) => {
    let rowType = getRowType(index);
    if (rowType !== "last") return "4px";
    else return "18px";
  };

  return (
    <>
      <IonCard
        className="primary-card br-8"
        id="click-trigger"
        onClick={() => {
          if (_.isEqual(status, "DOCUMENT_CAPTURE") || _.isEmpty(status)) {
            navigateToDocumentSpecificRoute(
              documentType,
              `/${getRouteEndPoint(documentType)}/edit`,
              formPayload,
              gstin
            );
          } else {
            toast.warning(t("DOCUMENT_ALREADY_SUBMITTED"));
          }
        }}
      >
        <IonCardContent className="card-content">
          <IonRow className="ion-align-items-center">
            <IonCol size="auto" className="py-0 pl-0">
              <div className="profile-wrap shadow-profile">
                <IonImg
                  src={formPayload?.icon}
                  alt={formPayload?.displayName}
                  className="with-profile"
                ></IonImg>
              </div>
            </IonCol>

            <IonCol size="" className="py-0 pr-0">
              <h3 className="fs-16 fw-600 ellipse">
                {t(formPayload?.displayName)}
              </h3>
              <p className="fs-12 fw-400">
                {formPayload.description
                  ? formPayload.description
                  : t(`${formPayload?.displayName}_DESCRIPTION`)}
              </p>
            </IonCol>
          </IonRow>
        </IonCardContent>

        {steps && steps.length > 0 && (
          <IonCardContent className="py-0 card-content card-content-footer">
            <IonGrid>
              <IonRow
                style={{
                  marginTop: "4px",
                  display: "flex",
                  justifyContent: getStepsAlignment(),
                }}
              >
                {steps.map((step, index) => {
                  return (
                    <div
                      className="ion-justify-content-center ion-align-items-center"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        width: isMultiStepsRow
                          ? `${
                              100 / Constants.DOCUMENT_STEPS_BREAK_AFTER_LENGTH
                            }%`
                          : "inherit",
                      }}
                    >
                      {isMultiStepsRow && (
                        <h4
                          className="fs-12 fw-600 ellipse"
                          style={{
                            height: getTopHeightForStep(index),
                          }}
                        >
                          {index === 0 ? steps[0].title : ""}
                        </h4>
                      )}
                      <img
                        className={classNames("ion-align-self-center")}
                        src={stepStatusIcons[step.status]}
                        alt={step.status}
                      />

                      {!isMultiStepsRow && (
                        <h4 className="fs-12 fw-600">{step.title}</h4>
                      )}
                      {isMultiStepsRow && (
                        <h4
                          className="fs-12 fw-600 ellipse"
                          style={{
                            height: getBottomHeightForStep(index),
                          }}
                        >
                          {index === steps.length - 1
                            ? steps[_.size(steps) - 1].title
                            : ""}
                        </h4>
                      )}
                    </div>
                  );
                })}
              </IonRow>
            </IonGrid>
          </IonCardContent>
        )}
      </IonCard>
    </>
  );
}

export default function DocumentList({
  verificationData,
  applicationId = "",
  status,
  gstin = FROM_VAULT,
}: {
  verificationData: Record<string, Record<string, unknown>[]>;
  applicationId: string;
  status: string;
  gstin?: string;
}) {
 

  return (
    <>
      {Object.keys(verificationData).map(
        (documentName: string, index: number) => (
          <>
            {RenderDocumentCard(
              verificationData[documentName as keyof IPlatformDocument],
              applicationId,
              status,
              gstin
            )}
          </>
        )
      )}
    </>
  );
}
