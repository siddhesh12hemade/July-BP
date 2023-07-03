import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonImg,
  IonItem,
  IonList,
  IonPage,
  IonRouterLink,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSpinner,
} from "@ionic/react";
import * as _ from "lodash";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import ActyvButton from "../components/ActyvButton";
import DocumentStatusComponent from "../components/DocumentStatusComponent";
import FileDisplayComponent from "../components/FileDisplayComponent";
import Header from "../components/Header";
import Loader from "../components/Loader";
import { Constants, FixedValues } from "../utils/constants/constants";
import {
  IBusinessGstinDocumentHistory,
  IDocument,
  IFile,
  IUploadAndSaveDocument,
} from "../utils/interfaces/DocumentVault.interface";
import { IGstinVerificationList } from "../utils/interfaces/GSTCertificate.interface";
import {
  getDocumentHistory,
  uploadAndSaveBusinessDocument,
  uploadDoc,
} from "../utils/services/DocumentVault.Service";
import { useAppSelector } from "../utils/store/hooks";
import { selectCurrentBusinessPartnerId } from "../utils/store/user.slice";
import { DateTimeUtils } from "../utils/utils/DateTime.Utils";
import { Helpers } from "../utils/utils/Helpers";

var classNames = require("classnames");

const GstVerification: React.FC = () => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [dropDownList, setDropdownList] = useState<IGstinVerificationList[]>(
    []
  );
  const [action, setAction] = useState("");
  const [selectedGst, setSelectedGst] = useState("");
  const location = useLocation();
  const gstinLinkToApplication = _.get(
    location,
    "state.state.gstin",
    FixedValues.FROM_VAULT
  );
  const currentBusinessPartnerId = useAppSelector<string>(
    selectCurrentBusinessPartnerId
  );
  const [allDocuments, setAllDocuments] = useState<
    IBusinessGstinDocumentHistory[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDocument, setActiveDocument] = useState<IDocument>();
  const { t } = useTranslation();
  let history = useHistory();
  const defaultFileObj = {
    file: null,
    loading: false,
  };
  const [uploadObj, setUploadObj] = useState<{
    file?: IFile;
    loading: boolean;
  }>(defaultFileObj);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    reset();
    if (selectedGst === "") {
      setAction("");
    } else {
      let activeDoc: IBusinessGstinDocumentHistory = null;

      for (const obj of allDocuments) {
        if (obj.documentNo === selectedGst) {
          activeDoc = obj;
          break;
        }
      }

      if (activeDoc && activeDoc.documentInfo) {
        setActiveDocument(activeDoc?.documentInfo);
        let file: IFile = activeDoc?.documentInfo.files[0];
        file.title = "Gst Certificate";
        setUploadObj({ ...uploadObj, file });
      }

      if (_.isEmpty(activeDoc.documentInfo)) setAction("create");
      else setAction("details");
    }
  }, [selectedGst]);

  const reset = () => {
    setAction("");
    setActiveDocument(null);
    setUploadObj({
      file: null,
      loading: false,
    });
  };

  const submitDocument = async () => {
    if (!uploadObj?.file) {
      toast.error(t("SELECT_DOC"));
      return;
    }
    setSubmitLoading(true);
    const uploadAndSaveDocumentRequest = generateRequest(
      uploadObj?.file?.fileId,
      selectedGst,
      currentBusinessPartnerId
    );

    const apiRes = await uploadAndSaveBusinessDocument(
      uploadAndSaveDocumentRequest
    );
    const uploadAndSaveDocumentResponse = apiRes.data;
    if (uploadAndSaveDocumentResponse.statusCode === Constants.API_SUCCESS) {
      await fetchData();
      setAction("details");
    } else {
      toast.error(t("FILE_UPLOAD_FAILED"));
    }
    setSubmitLoading(false);
  };

  const fetchData = async () => {
    setIsLoading(true);
    let docApiRes = await getDocumentHistory(
      Constants.DOC_TYPE_GST,
      currentBusinessPartnerId
    );
    let res = docApiRes.data;
    const { statusCode, document } = res;
    if (statusCode === Constants.API_SUCCESS) {
      let documents: IBusinessGstinDocumentHistory[] = document;
      let { dropDownList } = Helpers.formatGstinPreFillResponse(documents);
      setDropdownList(dropDownList);
      setAllDocuments(documents);
      if (!selectedGst) {
        if (_.size(dropDownList)) setSelectedGst(dropDownList[0].value);
      }
    }

    setIsLoading(false);
  };

  const selectGst = (val: string) => {
    setSelectedGst(val);
  };

  const submitDisabled = () => {
    return !uploadObj.file || uploadObj.loading || submitLoading;
  };

  const isFileSizeValid = (size) =>
    Helpers.isUploadSizeValid(
      size,
      Constants.GST_CERTIFICATE_MAX_FILE_SIZE_MB,
      t("MAXIMUM_FILE_UPLOAD_SIZE")
    );
  const checkIsMimeValid = (mime) => {
    return getMimeTypes().includes(mime);
  };

  const fileChangedHandler = (event) => {
    let file = event.target.files[0];
    let file_size = file.size;
    let mime = file.type;

    let isSizeValid = isFileSizeValid(file_size);
    let isMimeValid = checkIsMimeValid(mime);

    if (!isSizeValid.status) {
      toast.error(isSizeValid.message);
      event.value = "";
    } else if (!isMimeValid) {
      toast.error(mime + " not supported");
      event.value = "";
    } else {
      beginUpload(file, mime);
    }
  };

  const getUploadedStatusCount = () => {
    if (!allDocuments) return null;
    let total = _.size(allDocuments);
    let uploaded = 0;

    for (let doc of allDocuments) {
      if (doc.documentInfo) uploaded++;
    }
    return {
      total: total,
      uploaded: uploaded,
    };
  };

  const getDisplayFileDetails = () => {
    let statusObj = Helpers.getDocumentStatusForDetails(
      activeDocument?.eVerificationRequired,
      activeDocument?.status
    );
    return {
      gst: selectedGst,
      statusColor: "",
      updatedOn: DateTimeUtils.displayDateV2(activeDocument?.updatedOn),
      ...statusObj,
    };
  };

  const enableEdit = () => {
    setAction("edit");
  };

  const cancelEdit = () => {
    history.goBack();
  };

  const beginUpload = async (file: any, mime: string) => {
    setUploadObj({ ...uploadObj, loading: true });
    let apiRes = await uploadDoc(
      "GST_CERTIFICATE",
      currentBusinessPartnerId,
      file
    );
    if (apiRes.status === Constants.API_SUCCESS) {
      let res = apiRes.data;
      if (res && res.Key) {
        toast.success(t("CUSTOM_FILE_UPLOAD_SUCCESSFUL_ALERT"));
        uploadObj.file = {
          fileId: res.Key,
          fileType: mime,
          type: "SELF",
          title: "Gst certificate",
        };
      } else {
        toast.error(t("FILE_UPLOAD_FAILED"));
      }
      setUploadObj({ ...uploadObj, loading: false });
    } else {
      setUploadObj({ ...uploadObj, loading: false });
      toast.error(t("FILE_UPLOAD_FAILED"));
    }
  };

  const getMimeTypes = () => {
    var list = Constants.ALLOWED_GST_MIME.map((obj) => {
      return obj.mimeType;
    });
    return list.join(",");
  };

  const getAllowedGstFilesDisplay = () => {
    var fileList = Constants.ALLOWED_GST_MIME.map((obj) => {
      return obj.displayValue;
    });
    return fileList.join(", ");
  };

  const getMaxSizeDisplay = () => {
    return Constants.GST_CERTIFICATE_MAX_FILE_SIZE_MB;
  };

  const generateRequest = (
    fileId: string,
    gstin: string,
    businessPartnerId: string
  ): IUploadAndSaveDocument => {
    return {
      files: [{ fileId: fileId, type: "SELF", fileType: "PDF" }],
      documentType: Constants.DOC_TYPE_GST,
      documentNo: gstin,
      startDate: "",
      endDate: "",
      businessPartnerId: businessPartnerId,
      data: {},
      personId: "",
    };
  };

  return (
    <IonPage>
      <Header />

      <IonContent fullscreen>
        {isLoading ? (
          <IonItem className="ion-text-center">
            <Loader />
          </IonItem>
        ) : _.isEmpty(gstinLinkToApplication) ? (
          <>
            <IonItem
              lines="none"
              className="pl--0 item-transparent mt-10 mb-13"
            >
              <IonButton
                className="mr-6 h-auto"
                slot="start"
                fill="clear"
                onClick={() => history.goBack()}
              >
                <IonImg src="./img/partner-img/back-button.svg"></IonImg>
              </IonButton>
              <div className="">
                <h4 className="fs-20 fw-600">{t("GST")}</h4>
                <p className="fs-14 fw-400">{t("GST_DESCRIPTION")}</p>
              </div>
            </IonItem>
            <div>
              {/* main card start */}
              <IonCard className="primary-card no-border br-8">
                <IonCardContent className="card-content">
                  <IonGrid className="p-0">
                    <IonRow className="">
                      <IonCol size="auto" className="">
                        <h4 className="fs-18 fw-600">
                          {t("NO_GST_APPLICATION")}
                        </h4>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonCardContent>
              </IonCard>
              {/* main card end */}
            </div>{" "}
          </>
        ) : (
          <>
            <IonItem lines="none">
              <IonGrid className="pt-11">
                <IonRow className="">
                  <p className="fs-12 fw-600">
                    {t("DOCUMENT_VAULT")} ::{" "}
                    <span className="pending-text underline ">{t("GST")}</span>
                  </p>
                </IonRow>
              </IonGrid>
            </IonItem>

            <IonItem
              lines="none"
              className="pl--0 item-transparent mt-10 mb-13"
            >
              <IonButton
                className="mr-6 h-auto"
                slot="start"
                fill="clear"
                onClick={() => history.goBack()}
              >
                <IonImg src="./img/partner-img/back-button.svg"></IonImg>
              </IonButton>
              <div className="">
                <h4 className="fs-20 fw-600">{t("GST")}</h4>
                <p className="fs-14 fw-400">{t("GST_DESCRIPTION")}</p>
              </div>
            </IonItem>

            <div>
              {/* main card start */}
              <IonCard className="primary-card no-border br-8">
                <IonCardContent className="card-content">
                  <IonGrid className="p-0">
                    <IonRow className="">
                      <IonCol size="auto" className="">
                        <h4 className="fs-18 fw-600">{t("GST_NUMBER")}</h4>
                      </IonCol>
                    </IonRow>

                    <IonRow className="">
                      <IonCol size="8" className="">
                        <IonItem lines="none" className="input-item">
                          <IonSelect
                            interface="popover"
                            mode="md"
                            placeholder={t("SELECT_GSTIN")}
                            className="w-100 select-field"
                            value={selectedGst || null}
                            onIonChange={(e) => {
                              selectGst(e.detail.value);
                            }}
                          >
                            {dropDownList.map((item, index) => (
                              <IonSelectOption
                                key={index}
                                value={`${item.value}`}
                              >
                                {item.label}
                              </IonSelectOption>
                            ))}
                          </IonSelect>
                        </IonItem>
                      </IonCol>
                    </IonRow>

                    {getUploadedStatusCount() && (
                      <IonRow className="my-7 ion-justify-content-center">
                        <IonCol className="" size="auto">
                          <div className="d-flex ion-align-items-center mr-6">
                            <h4 className="fs-12 fw-600">{t("STATUS")}:</h4>
                            <div className="status-box-inbox">
                              <span className="fw-700 fs-12 dark">
                                {getUploadedStatusCount().uploaded}
                              </span>
                              /
                              <span className="fs-12 fw-400">
                                {getUploadedStatusCount().total}
                              </span>
                            </div>
                            <div>
                              <p>{t("GST_CERTIFICATES_UPLOADED")}</p>
                            </div>
                          </div>
                        </IonCol>
                      </IonRow>
                    )}
                  </IonGrid>

                  {selectedGst && (
                    <div>
                      {(action === "create" || action === "edit") && (
                        <div className="upload-section">
                          <IonGrid>
                            <IonRow>
                              <IonCol>
                                <h4 className="mb-0 fs-16 fw-600">
                                  {t("UPLOAD_YOUR_GST_CERTIFICATES")}
                                </h4>
                              </IonCol>
                            </IonRow>
                            {!uploadObj.loading && (
                              <IonRow className="mb-10">
                                <IonCol>
                                  <div className="file-main-wrapper p-relative">
                                    <div className="mb-9 choose-btn-wrp ion-text-center">
                                      <IonButton className="fs-18 fw-600 square-btn">
                                        {t("CHOOSE_FILE")}
                                      </IonButton>
                                      <input
                                        className="fileupload"
                                        type="file"
                                        onChange={fileChangedHandler}
                                        accept={getMimeTypes()}
                                      />
                                    </div>

                                    <div className="file-size-wrap ion-text-center">
                                      <p className="fs-14 fw-400 mb-0">
                                        {t("FILE_SUPPORTED")}:{" "}
                                        {getAllowedGstFilesDisplay()}
                                      </p>
                                      <p className="fs-12 fw-400">
                                        {t("MAXIMUM")} {getMaxSizeDisplay()}{" "}
                                        {t("MB")}
                                      </p>
                                    </div>
                                  </div>
                                </IonCol>
                              </IonRow>
                            )}

                            {uploadObj.loading && (
                              <IonRow class="ion-text-center">
                                <IonCol>
                                  <IonSpinner
                                    color="success"
                                    justify-content-center
                                    align-items-center
                                    name="crescent"
                                  ></IonSpinner>
                                </IonCol>
                              </IonRow>
                            )}

                            <IonRow>
                              <IonCol size="3">
                                {uploadObj?.file && (
                                  <FileDisplayComponent
                                    onDelete={() => {
                                      setUploadObj({ ...defaultFileObj });
                                    }}
                                    showDelete={true}
                                    uploadedFile={uploadObj.file}
                                  ></FileDisplayComponent>
                                )}
                              </IonCol>
                            </IonRow>
                          </IonGrid>
                        </div>
                      )}

                      {action === "details" && (
                        <div className="details-section">
                          <IonRow className="ion-align-items-center">
                            <IonCol size="auto">
                              <h4 className="fs-20 fw-600">
                                {t("DOCUMENTS_UPLOADED")}
                              </h4>
                            </IonCol>
                            <IonCol>
                              <div className="card-divider"></div>
                            </IonCol>
                            <IonCol size="auto">
                              <IonButton
                                fill="clear"
                                className="primary-color fs-18 fw-600 pr--0 pl--0"
                                onClick={enableEdit}
                              >
                                {t("EDIT")}
                              </IonButton>
                            </IonCol>
                          </IonRow>

                          <IonRow>
                            <IonCol>
                              <h4 className="mb-0 fs-16 fw-600">{t("GST")}</h4>
                            </IonCol>
                          </IonRow>
                          <IonGrid className="certificate-wrapper">
                            <IonRow className="certificate-box ion-align-items-center">
                              <IonCol size="3">
                                <FileDisplayComponent
                                  displayTitle={false}
                                  uploadedFile={activeDocument?.files[0]}
                                  showDelete={false}
                                ></FileDisplayComponent>
                              </IonCol>
                              <IonCol size="7" class="">
                                <div className="gst-numer">
                                  <p className="fs-14 fw-400">{t("GST")}</p>
                                  <p className="fs-14 fw-600">{selectedGst}</p>
                                </div>
                              </IonCol>
                            </IonRow>
                            <DocumentStatusComponent
                              colorClass={getDisplayFileDetails().colorClass}
                              description={getDisplayFileDetails().desc}
                              icon={getDisplayFileDetails().icon}
                              statusText={getDisplayFileDetails().statusText}
                              updatedOn={getDisplayFileDetails().updatedOn}
                            />
                          </IonGrid>
                        </div>
                      )}
                    </div>
                  )}
                </IonCardContent>

                {(action === "create" || action === "edit") && (
                  <IonCardContent className="footer-gradient py-0">
                    <IonGrid>
                      <IonRow className="">
                        <IonCol size="6" className="ion-text-center">
                          <ActyvButton
                            onClick={submitDocument}
                            text={t("SAVE")}
                            isLoading={submitLoading}
                            disabled={submitDisabled()}
                          ></ActyvButton>
                        </IonCol>

                        <IonCol size="6" className="ion-text-center">
                          <IonButton
                            className="fs-14 fw-500 clear-btn-gray"
                            fill="clear"
                            onClick={cancelEdit}
                          >
                            {t("CANCEL_CAP")}
                          </IonButton>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonCardContent>
                )}
              </IonCard>
              {/* main card end */}
            </div>

            {(action === "create" || action === "edit") && (
              <IonList className="list-transparent pr-20" lines="none">
                <IonItem className="item-transparent">
                  <h4 className="fs-14 fw-700">
                    {t("GST_VERIFICATION_INSTRUCTION")}
                  </h4>
                </IonItem>
                <IonItem className="item-transparent pr-20">
                  <ul className="pl-20">
                    <li className="fs-14 fw-400 mb-9">
                      {t("GST_VERIFICATION_TEXT_1")}
                    </li>
                    <li className="fs-14 fw-400 mb-9">
                      {t("GST_VERIFICATION_TEXT_2")}{" "}
                      <IonRouterLink>
                        {" "}
                        <span className="underline primary-color">
                          {" "}
                          <a
                            href={process.env.REACT_APP_GST_GOV}
                            className="footer-links"
                          >
                            {t("CLICK_HERE")}
                          </a>{" "}
                          <svg
                            width="6"
                            height="6"
                            viewBox="0 0 6 6"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M0.36183 5.7608C0.451309 5.85028 0.572669 5.90054 0.699211 5.90054C0.825753 5.90054 0.947113 5.85028 1.03659 5.7608L4.94549 1.8519L4.94482 4.74865C4.94482 4.81139 4.95717 4.87351 4.98118 4.93147C5.00519 4.98943 5.04038 5.0421 5.08474 5.08646C5.1291 5.13082 5.18177 5.16601 5.23973 5.19002C5.29769 5.21403 5.35981 5.22638 5.42255 5.22638C5.48528 5.22638 5.54741 5.21403 5.60537 5.19002C5.66333 5.16601 5.71599 5.13082 5.76035 5.08646C5.80472 5.0421 5.83991 4.98943 5.86391 4.93147C5.88792 4.87351 5.90028 4.81139 5.90028 4.74865L5.90028 0.700079C5.90036 0.63732 5.88806 0.575161 5.86408 0.517164C5.8401 0.459167 5.80491 0.406472 5.76053 0.362094C5.71615 0.317717 5.66346 0.28253 5.60546 0.25855C5.54746 0.23457 5.48531 0.222267 5.42255 0.222347L1.37397 0.222347C1.24727 0.222347 1.12576 0.272679 1.03617 0.362271C0.946574 0.451863 0.896242 0.573377 0.896242 0.700079C0.896242 0.826781 0.946575 0.948294 1.03617 1.03789C1.12576 1.12748 1.24727 1.17781 1.37397 1.17781L4.27073 1.17714L0.36183 5.08603C0.272351 5.17551 0.222082 5.29687 0.222082 5.42342C0.222082 5.54996 0.272351 5.67132 0.36183 5.7608Z"
                              fill="#E25C10"
                            />
                          </svg>
                        </span>
                      </IonRouterLink>
                    </li>
                    <li className="fs-14 fw-400 mb-9">
                      {t("GST_VERIFICATION_TEXT_3")}
                    </li>
                  </ul>
                </IonItem>
              </IonList>
            )}

            {/* Tab content start */}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default GstVerification;
