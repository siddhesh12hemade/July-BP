import {
  IonButton, IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonImg,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import { Collapse } from "antd";
import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import DocumentCard from "../components/DocumentCard";
import Header from "../components/Header";
import Loader from "../components/Loader";
import { Constants } from "../utils/constants/constants";
import { CommonService } from "../utils/services/Common.Service";
import { FormService } from "../utils/services/Form.Service";
import "./Page.css";

export interface IApplicationDocumentConfig {
  key: string;
  type: string;
  property: Record<string, unknown>;
}

const checkDocumentTypeIsCustomComponent = (displayName: string) => {
  return (
    displayName.includes("CUSTOM_FORM") ||
    displayName.includes("MISCELLANEOUS_DOCUMENT")
  );
};
const configTransformFun = (item: IApplicationDocumentConfig) => {
  return {
    ...item.property,
    displayName: _.get(item, "property.displayName", item.type),
    documentType: checkDocumentTypeIsCustomComponent(item.key)
      ? item.key
      : null,
  };
};
const findResolvedEntries = (groupedItems: Record<string, unknown>) => {
  const filteredItems = _.filter(
    _.entries(groupedItems),
    (data: [string, Array<Record<string, unknown>>]) => {
      return _.every(
        data[1],
        ({
          eVerificationRequired,
          skipDocumentVerification,
          status,
        }: {
          eVerificationRequired: boolean,
          skipDocumentVerification: boolean,
          status: string,
        }) => {
          const uploadStatuses = _.filter(
            status,
            (entry) => _.get(entry, "name") === "UPLOAD"
          );

          const isUploadComplete = _.every(
            uploadStatuses,
            (entry) => _.get(entry, "value") === "COMPLETED"
          );

          if (skipDocumentVerification) return true;

          if (eVerificationRequired) {
            const verificationStatuses = _.filter(
              status,
              (entry) => _.get(entry, "name") !== "UPLOAD"
            );

            return (
              isUploadComplete &&
              _.some(
                verificationStatuses,
                (e) => _.get(e, "value") === "COMPLETED"
              )
            );
          }
          return isUploadComplete;
        }
      );
    }
  );

  return _.fromPairs(_.map(filteredItems, (item) => _.toArray(item)));
};

  const ApplicationDetailView: React.FC = () => {
  const { i18n, t } = useTranslation();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [pendingGroupedDocumentsToVerify, setPendingGroupedDocumentsToVerify] =
    useState([]);
  const [pendingChunkedDocumentsToVerify, setPendingChunkedDocumentsToVerify] =
    useState([]);
  const [
    availableChunkedDocumentsToVerify,
    setAvailableChunkedDocumentsToVerify,
  ] = useState([]);
  const [
    availableGroupedDocumentsToVerify,
    setAvailableGroupedDocumentsToVerify,
  ] = useState([]);

  const accordionGroup = useRef<null | HTMLIonAccordionGroupElement>(null);
  const [docLists, setDocLists] = useState([]);
  const [applicationDetails, setApplicationDetails] = useState<any>([]);
  const [errorDocumentsPresent, isErrorDocumentsPresent] =
    useState<boolean>(false);

  const params = useParams();
  const applicationId: string = _.get(params, "applicationId", "");

  const [enableSubmitButton, setEnableSubmitButton] = useState(false);
  const [submitApplicationLoading, setSubmitApplicationLoading] = useState<
    "idle" | "loading" | "failed" | "success"
  >("idle");
  const { Panel } = Collapse;
  useEffect(() => {
    const unlisten = history.listen(() => {
      if (history?.location?.pathname.includes("/app/application-details"))
        fetchData();
    });
    return () => {
      unlisten();
    };
  }, [history]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    let appId = applicationId;
    await FormService.getAppDetails({
      appId: appId,
    }).then((res) => {
      var docItems = res.data ?? [];
      let tmpData: any = processData(docItems);
      setLoading(false);
      setDocLists(tmpData);
      setApplicationDetails(tmpData.applicationDetails);
      setPendingGroupedDocumentsToVerify(
        tmpData.pendingGroupedDocumentsToVerify
      );
      setPendingChunkedDocumentsToVerify(
        tmpData.pendingChunkedDocumentsToVerify
      );
      setAvailableChunkedDocumentsToVerify(
        tmpData.availableChunkedDocumentsToVerify
      );
      setAvailableGroupedDocumentsToVerify(
        tmpData.availableGroupedDocumentsToVerify
      );
    });
  }

  <Link
  to={{
    pathname: "../src/components/DocumentList",
    state: applicationDetails 
  }}
></Link>

  const processData = (respObj) => {
    const {
      documentConfig: { documents },
      application,
    } = respObj;
    const userType = ["business-partner"];
    const transformedDocumentConfig = _.map(documents, configTransformFun);
    const groupedItems = _.groupBy(transformedDocumentConfig, "displayName");

    const availableGroupedDocumentsToVerify = findResolvedEntries(groupedItems);

    const areAllRequiredDocumentsResolved =
      _.get(transformedDocumentConfig, "length") ===
      _.get(_.flatten(_.values(availableGroupedDocumentsToVerify)), "length");
    const submitButtonEnabled =
      areAllRequiredDocumentsResolved &&
      application.status === "DOCUMENT_CAPTURE";
    setEnableSubmitButton(submitButtonEnabled);

    const pendingGroupedDocumentsToVerify = _.fromPairs(
      _.filter(
        _.entries(groupedItems),
        (groupData) => !_.has(availableGroupedDocumentsToVerify, groupData[0])
      )
    );

    Object.values(pendingGroupedDocumentsToVerify).map((documents) => {
      documents.forEach((document) => {
        if (JSON.stringify(document).includes("ERROR")) {
          isErrorDocumentsPresent(true);
        }
      });
    });

    const pendingChunkedDocumentsToVerify = _.chunk(
      _.keys(pendingGroupedDocumentsToVerify),
      2
    );

    const availableChunkedDocumentsToVerify = _.chunk(
      _.keys(availableGroupedDocumentsToVerify),
      2
    );

    return {
      documentConfig: documents,
      applicationDetails: application,
      userType: userType,
      transformedDocumentConfig: transformedDocumentConfig,
      groupedItems: groupedItems,
      availableGroupedDocumentsToVerify: availableGroupedDocumentsToVerify,
      pendingGroupedDocumentsToVerify: pendingGroupedDocumentsToVerify,
      pendingChunkedDocumentsToVerify: pendingChunkedDocumentsToVerify,
      availableChunkedDocumentsToVerify: availableChunkedDocumentsToVerify,
    };
  };

  const sendApplicationForApproval = async () => {
    setLoading(true);
    const apiResponse = await FormService.submitDocForApproval({
      appId: applicationId,
    });
    const response = apiResponse.data;
    setLoading(false);
    if (response?.success) {
      history.push({ pathname: "/app/application-list" });
    }
    toast(response?.message);
  };

  const goBack = () => {
    history.go(-1);
  };

  const getAvailableDocumentsPanel = () => {
    return(
      <Panel
      className=" w-100"
      header={
        <div className=" w-100">
          <IonLabel className="fw-600 fs-14">
            {t("ATTACHED_DOCUMENTS")}
          </IonLabel>
          <p className="fs-12 fw-600">
            {_.size(Object.keys(availableGroupedDocumentsToVerify)) <= 1 && (
                <span>
                  {
                    _.size(Object.keys(availableGroupedDocumentsToVerify))
                  }{" "}
                  {t("DOCUMENT")}
                </span>
              )}
          </p>
          <p className="fs-12 fw-600">
            {_.size(Object.keys(availableGroupedDocumentsToVerify)) >
              1 && (
                <span>
                  {
                    _.size(Object.keys(availableGroupedDocumentsToVerify))
                  }{" "}
                  {t("DOCUMENTS_TAB")}
                </span>
              )}
          </p>
        </div>

      } key="2">
      <div
        className="d-inline-block w-100 p-relative"
        slot="content"
      > 
        <DocumentCard
          key="attached"
          data={availableChunkedDocumentsToVerify}
          verificationData={availableGroupedDocumentsToVerify}
          applicationId={applicationId}
          status={applicationDetails.status}
          gstin={applicationDetails.gstin}
        />
      </div>
    </Panel>
    )
  }
  
  const getPendingDocumentsPanel = () => {
    return(
      <Panel header={
        <div>
          <IonLabel className="fw-600 fs-14">
            {t("PENDING_DOCUMENT_HEADING")}
          </IonLabel>
          <p className="fs-12 fw-600">
            {_.size(Object.keys(pendingGroupedDocumentsToVerify)) <=
              1 && (
                <span>
                  {
                    _.size(Object.keys(pendingGroupedDocumentsToVerify))
                  }{" "}
                  {t("DOCUMENT")}
                </span>
              )}
          </p>
          <p className="fs-12 fw-600">
            {_.size(Object.keys(pendingGroupedDocumentsToVerify)) >
              1 && (
                <span>
                  {
                    _.size(Object.keys(pendingGroupedDocumentsToVerify))
                  }{" "}
                  {t("DOCUMENTS_TAB")}
                </span>
              )}
          </p>
        </div>

      } key="1">
        <div
          className="d-inline-block w-100 p-relative content-acc"
          slot="content"
        >
          <DocumentCard
            key="pending"
            data={pendingChunkedDocumentsToVerify}
            verificationData={pendingGroupedDocumentsToVerify}
            applicationId={applicationId}
            status={applicationDetails.status}
            gstin={_.get(applicationDetails, "gstin", "")}
          />
        </div>
      </Panel>
    )
  }
  return (
    <IonPage>
      <Header />
      <IonContent fullscreen class="application-detail-page">
        <Loader isloading={loading} />
        {!loading && (
          <>
            <IonItem lines="none">
              <IonGrid className="pt-11 business-partner-header">
                <IonRow
                  className=""
                  onClick={() => {
                    goBack();
                  }}
                >
                  <IonCol
                    className="px-0 py-0 d-flex ion-align-items-center"
                    size="auto"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        width="24"
                        height="24"
                        transform="matrix(-1 0 0 1 24 0)"
                        fill="white"
                        fillOpacity="0.01"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M9.00499 10.9951C8.81751 11.1826 8.7122 11.4369 8.7122 11.7021C8.7122 11.9672 8.81751 12.2215 9.00499 12.4091L13.598 17.0021C13.7843 17.1846 14.0351 17.2863 14.2959 17.285C14.5567 17.2837 14.8065 17.1795 14.991 16.995C15.1754 16.8106 15.2796 16.5608 15.2809 16.3C15.2822 16.0392 15.1805 15.7884 14.998 15.6021L11.098 11.7021L14.998 7.80207C15.1805 7.61578 15.2822 7.36497 15.2809 7.10414C15.2796 6.84331 15.1754 6.59354 14.991 6.4091C14.8065 6.22467 14.5567 6.12047 14.2959 6.11915C14.0351 6.11784 13.7843 6.21951 13.598 6.40207L9.00499 10.9951Z"
                        fill="#091E42"
                        fillOpacity="0.66"
                      />
                    </svg>
                  </IonCol>
                  <IonCol size="auto" className="pl-0 py-0">
                    <div className="profile-wrap profile-wrap-lg">
                      <IonImg className="with-profile  d-none"></IonImg>
                      <h4 className="without-profile fs-22 fw-700">
                        {applicationDetails?.applicationIdentifier
                          ?.charAt(0)
                          .toUpperCase()}
                      </h4>
                    </div>
                  </IonCol>

                  <IonCol size="" className="pr-0 py-0">
                    <h3 className="fs-18 fw-700">
                      {applicationDetails?.enterpriseName}
                    </h3>
                    <p className="my-4 fs-14 fw-400 dark">
                      {t("APPLICATION_TYPE1")}:{" "}
                      <span className="fs-14 fw-600 dark">
                        {applicationDetails?.type}
                      </span>
                    </p>
                    <p
                      className={`statusbox status-${Constants.APP_STATUS.includes(
                        applicationDetails?.status
                      )
                        ? applicationDetails?.status.toLowerCase()
                        : "progress"
                        } fs-12 fw-600`}
                    >
                      {CommonService.statusToDisplayFormat(
                        applicationDetails?.status
                      )}
                    </p>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonItem>

            <div className="px-8 pt-11">
              {/* As we are using collapsible property, 
              So in this case don't able to expand on click of empty space so used this */}
            <>{
                    _.size(pendingChunkedDocumentsToVerify) === 0 ?
                    <Collapse className="white-bg"
                    collapsible={_.size(pendingChunkedDocumentsToVerify) === 0 ? 'disabled' : 'header'}
                    expandIconPosition="end"
                  > 
                    {getPendingDocumentsPanel()}
                  </Collapse>
                    :
                    <Collapse className="white-bg"
                    expandIconPosition="end"
                  >
                     {getPendingDocumentsPanel()} 
                  </Collapse>
                  }</>

                  <>{
                    _.size(availableGroupedDocumentsToVerify) === 0 ?
          
                    <Collapse
                    expandIconPosition="end"
                    className="white-bg mt-10"
                    collapsible={_.size(availableGroupedDocumentsToVerify) === 0 ? 'disabled' : 'header'}
                  >
                    {getAvailableDocumentsPanel()} 
                  </Collapse>
                    :
                    <Collapse
                    expandIconPosition="end"
                    className="white-bg mt-10"
                  >
                    {getAvailableDocumentsPanel()}
                  </Collapse>
                  }</>
            </div>
          </>
        )}
      </IonContent>
      <IonFooter className="ion-no-border ion-text-center shadow-foot">
        <IonToolbar>
          <IonRow className="ion-justify-content-center footer-submit ion-align-items-center">
            <IonCol size="auto" class="ion-text-end">
              <p className="fs-16 fw-400 ">{t("APPROVAL_SUBMIT")}</p>
            </IonCol>
            <IonCol size="auto">
              <IonTitle class="pl-0">
                <IonButton
                  className="submit-footer"
                  shape="round"
                  expand="block"
                  disabled={!enableSubmitButton}
                  onClick={sendApplicationForApproval}
                >
                  {t("SUBMIT")}
                </IonButton>
              </IonTitle>
            </IonCol>
          </IonRow>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default ApplicationDetailView;
