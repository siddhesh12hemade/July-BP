import {
    IonCard,
    IonCardContent,
    IonCol,
    IonContent,
    IonGrid,
    IonImg,
    IonItem,
    IonPopover,
    IonRow,
  } from "@ionic/react";
  import _ from "lodash";
  import { useTranslation } from "react-i18next";
  import { Constants } from "../utils/constants/constants";
  import { ICrossValidation } from "../utils/interfaces/DocumentVault.interface";
  import { DateTimeUtils } from "../utils/utils/DateTime.Utils";
  var classNames = require("classnames");
  
  export default function CrossValidationList({
    data,
  }: {
    data: ICrossValidation[],
  }) {
    const { t } = useTranslation();
  
    function getCrossValidationTypeName(crossValidationType: string): string {
      let name = ``;
      if (crossValidationType === "GSTIN:FSSAI") {
        return t("FSSAI_AND_GST_CERTIFICATE");
      }
      crossValidationType.split(":").map((type, index) => {
        if (index === 0) {
          name = `${name} ${t(type)}`;
        } else {
          name = `${name} ${t("AND")} ${t(type)}`;
        }
        return name;
      });
      return name;
    }
  
    function getCrossValidationDescription(description: string): string {
      let descriptionToShow = ``;
      description.split(":").map((type, index) => {
        if (index <= 1) {
          descriptionToShow = `${descriptionToShow} ${t(type)}`;
        } else {
          descriptionToShow = `${descriptionToShow} ${t("AND")} ${t(type)}`;
        }
      });
      return descriptionToShow;
    }
  
    function RenderCrossValidationCard(crossValidation: ICrossValidation, index) {
      return (
        <>
          <IonCard className="primary-card br-8">
            <IonCardContent className="card-content">
              <IonGrid class="p-0">
                <IonRow className="ion-align-items-center">
                  <IonCol size="" className="py-0 pl-0">
                    <IonRow className="ion-align-items-center">
                      <IonCol size="auto">
                        <IonItem lines="none" className="pl--0 ipr--0">
                          <IonImg
                            src={
                              Constants.CROSS_VALIDATION_STATUS_ICONS[
                                crossValidation.status
                              ]
                            }
                            className="with-profile"
                            alt="Cross-validation status"
                          ></IonImg>
                        </IonItem>
                      </IonCol>
  
                      <IonCol>
                        <h4 className="fs-16 fw-600">
                          {getCrossValidationTypeName(crossValidation.type)}
                        </h4>
                      </IonCol>
                    </IonRow>
                  </IonCol>
  
                  <IonCol size="auto" className="py-0 pr-0">
                    <IonItem lines="none" className="pl--0 p-0">
                      <IonImg src="./img/right-arrow.svg"></IonImg>
                    </IonItem>
                  </IonCol>
                </IonRow>
  
                <div className="card-divider mb-13"></div>
  
                <IonRow className="ion-align-items-center ion-justify-content-between">
                  <IonCol size="auto" className="py-0">
                    <p className="fs-10 fw-600 white-heading d-flex ion-justify-content-center ion-align-items-center mb-0">
                      <span className="mx-10">
                        <p
                          className={classNames(
                            "verified-text",
                            "fs-14",
                            "fw-600",
                            "ellipse",
                            Constants.CROSS_VALIDATION_STATUS_CLASS_MAPPING[
                              crossValidation.status
                            ]
                          )}
                        >
                          {crossValidation.status}
                        </p>
                      </span>
                      {
                        <span>
                          <IonImg
                            id={index}
                            className="mb-3"
                            src="./img/i-sign.svg"
                          ></IonImg>
                          <IonPopover
                            key={Math.random()}
                            trigger={index}
                            triggerAction="click"
                          >
                            <IonContent class="ion-padding">
                              {getCrossValidationDescription(
                                crossValidation?.description
                              )}
                            </IonContent>
                          </IonPopover>
                        </span>
                      }
                    </p>
                  </IonCol>
                  <IonCol size="auto" className="py-0">
                    <p className="fs-10 fw-400">
                      {" "}
                      {!_.isEmpty(crossValidation.ts)
                        ? DateTimeUtils.displayDateV2(crossValidation.ts)
                        : ""}
                    </p>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        </>
      );
    }
    return (
      <>
        {data.map((obj, index) => {
          return (
            <>
              {obj.businessPartnerId !== "" &&
                RenderCrossValidationCard(obj, index)}
            </>
          );
        })}
      </>
    );
  }
  