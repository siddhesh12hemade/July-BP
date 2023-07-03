import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText
} from "@ionic/react";
import * as _ from "lodash";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import Header from "../components/Header";
import { Constants } from "../utils/constants/constants";
import { IDropDown } from "../utils/interfaces/App.interface";
import {
  IDocument,
  IFile,
  IIndividualPersonDocumentResponse,
  IUploadAndSaveDocument
} from "../utils/interfaces/DocumentVault.interface";
import {
  getPersonalDocumentHistory,
  uploadAndProcessPan,
  uploadAndSavePersonalDocument
} from "../utils/services/DocumentVault.Service";
import { useAppSelector } from "../utils/store/hooks";
import { selectCurrentBusinessPartnerId } from "../utils/store/user.slice";
import { DateTimeUtils } from "../utils/utils/DateTime.Utils";

import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import ActyvButton from "../components/ActyvButton";
import FileDisplayComponent from "../components/FileDisplayComponent";
import Loader from "../components/Loader";
import { Helpers } from "../utils/utils/Helpers";
import { ValidateUtils } from "../utils/utils/Validate.Utils";
import { systemException } from "../utils/sentry/common.service";
import DocumentStatusComponent from "../components/DocumentStatusComponent";
import i18n from "../utils/translations";

interface IDetailsObj {
  pan: string;
  statusColor: string;
  updatedOn: string;
  name: string;
  panNo: string;
  dob: string;
  statusText: string;
  icon: string;
  colorClass: string;
  desc: string;
  document: IFile;
}

interface IUploadObj {
  newFile: IFile;
  loading: boolean;
}

const PanVerification: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState,
    setValue,
    control,
    reset: resetForm,
  } = useForm({
    mode: "onChange",
    defaultValues: { fileId: "", pan: "", name: "", dob: "" },
  });

  const newFileObj = {
    newFile: null,
    loading: false,
  }
  const defaultDetailsObj: IDetailsObj = {
    pan: "",
    statusColor: "",
    updatedOn: "",
    name: "",
    panNo: "",
    dob: "",
    statusText: "",
    icon: "",
    colorClass: "",
    desc: "",
    document: null,
  }
  const [action, setAction] = useState("");
  const [uploadObj, setUploadObj] = useState<IUploadObj>(newFileObj);
  const [detailsObj, setDetailsObj] = useState<IDetailsObj>(defaultDetailsObj);
  const [dropDownList, setDropdownList] = useState<IDropDown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const currentBusinessPartnerId = useAppSelector<string>(
    selectCurrentBusinessPartnerId
  );
  const [allDocuments, setAllDocuments] = useState<
    IIndividualPersonDocumentResponse[]
  >([]);
  const [selectedPan, setSelectedPan] = useState("");
  const [activeDocument, setActiveDocument] = useState<IDocument>(null);
  const [uploadedCount, setUploadedCount] = useState<number>(null);
  const [totalDocsCount, setTotalDocsCount] = useState<number>(null);
  const { t } = useTranslation();
  var classNames = require("classnames");
  let history = useHistory();

  const selectPan = (val: string) => {
    setSelectedPan(val);
  };

  useEffect(() => {
    setActiveDocument(null)
    setDetailsObj({ ...defaultDetailsObj })
    resetForm({});
    setUploadObj({...uploadObj,newFile:null})
  }, [selectedPan])
  useEffect(() => {
    reset();
    if (selectedPan === "") {
      setAction("");
    } else {
      let activeDoc: IIndividualPersonDocumentResponse = null;
      for (const obj of allDocuments) {
        if (obj.personId === selectedPan) {
          activeDoc = obj;
          break;
        }
      }
      if (_.isEmpty(activeDoc.documentInfo)) setAction("create");
      else setAction("details");
      setActiveDocument(activeDoc?.documentInfo);
    }

    setTotalDocsCount(_.size(allDocuments));
    setUploadedCount(getUploadedStatusCount());

  }, [selectedPan, allDocuments]);

  useEffect(() => {

    if (activeDocument) initData();
  }, [activeDocument, allDocuments]);

  const reset = () => {
    setAction("");
    setActiveDocument(null);
    setUploadObj({ ...uploadObj, newFile: null, loading: false });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    let apiRes = await getPersonalDocumentHistory(
      Constants.DOC_TYPE_PERSONAL_PAN,
      currentBusinessPartnerId
    );
    let res = apiRes.data;
    let list: IDropDown[] = [];
    if (res.statusCode === Constants.API_SUCCESS) {
      for (const docObj of res.document) {
        const obj: IDropDown = {
          label: docObj.name,
          value: docObj.personId,
          disabled: false,
        };
        list.push(obj);
      }
      setDropdownList(list);
      setAllDocuments(res.document);

      if (!selectedPan) {
        if (_.size(list)) setSelectedPan(list[0].value);
      }
    }
    setIsLoading(false);
  };

  const getUploadedStatusCount = () => {
    if (!allDocuments) return null;
    let uploaded = 0;

    for (let doc of allDocuments) {
      if (!_.isEmpty(doc.documentInfo)) uploaded++;
    }
    return uploaded;
  };
  const initData = () => {
    if (!_.isEmpty(activeDocument)) {
      let statusObj = Helpers.getDocumentStatusForDetails(
        true,
        activeDocument.status
      );

      let data = activeDocument.data;
      let obj = {
        pan: selectedPan,
        statusColor: "",
        updatedOn: DateTimeUtils.displayDateV2(activeDocument.updatedOn),
        name: activeDocument.data?.name,
        panNo: activeDocument.data?.panNumber,
        dob: activeDocument.data?.dob,
        statusText: statusObj.statusText,
        icon: statusObj.icon,
        colorClass: statusObj.colorClass,
        desc: statusObj.desc,
        document: activeDocument.files[0],
      };

      setUploadObj({
        ...uploadObj,
        newFile: activeDocument.files[0],
      });

      setDetailsObj(obj);
      resetForm({
        pan: data?.panNumber,
        name: data?.name,
        dob: DateTimeUtils.isoDateStr(data?.dob),
      });
    } else resetForm();
  };

  const enableEdit = () => {
    setAction("edit");
  };

  const cancelEdit = () => {
    history.goBack()
  };

  const onSubmit = async (data) => {

    let file: IFile;

    if (uploadObj.newFile && uploadObj.newFile.fileId) file = uploadObj.newFile;


    if (!file) {
      toast.error(
        t("SELECT_DOC")
      );
      return
    }

    setSubmitLoading(true);
    let req: IUploadAndSaveDocument = {
      files: [file],
      documentType: Constants.DOC_TYPE_PERSONAL_PAN,
      documentNo: data.pan,
      startDate: "",
      endDate: "",
      data: {
        dob: data.dob,
        name: data.name,
        panNumber: data.pan,
      },
      personId: selectedPan,
      businessPartnerId: currentBusinessPartnerId,
    };

    try {
      let apiRes = await uploadAndSavePersonalDocument(req);
      let res = apiRes.data;

      if (res.statusCode === Constants.API_SUCCESS) {
        await fetchData();
        setAction("details");
      }
      setSubmitLoading(false);
    } catch (e) {
      let obj = {
        fileName: 'PanVerification.tsx',
        functionName: 'onSubmit()',
        error: e,
      };
      systemException(obj);
      setSubmitLoading(false);
    }
  };
  const onErr = (err) => { };

  const isFileSizeValid = (size) => {
    let sizeInMb = size * Constants.MB_CONVERTER;
    return sizeInMb > Constants.PAN_CERTIFICATE_MAX_FILE_SIZE_MB;
  };
  const checkIsMimeValid = (mime) => {
    return getMimeTypes().includes(mime);
  };
  const fileChangedHandler = (event) => {
    let file = event.target.files[0];
    let file_size = file.size;
    let mime = file.type;

    let isSizeValid = isFileSizeValid(file_size);
    let isMimeValid = checkIsMimeValid(mime);

    if (!isSizeValid) {
      toast.error(
        `size cannot be greater than ${Constants.PAN_CERTIFICATE_MAX_FILE_SIZE_MB} MB`
      );
      event.value = "";
    } else if (!isMimeValid) {
      toast.error(mime + " not supported");
      event.value = "";
    } else {
      beginUpload(file, mime);
    }
  };

  const isButtonDisabled = () => {
    return uploadObj.loading || submitLoading;
  };

  const beginUpload = async (file: any, mime) => {
    uploadObj.loading = true;
    setUploadObj({ ...uploadObj });

    let apiRes = await uploadAndProcessPan(
      "PERSONAL_PAN",
      currentBusinessPartnerId,
      file
    );
    if (apiRes.status === Constants.API_SUCCESS) {
      let res = apiRes.data;
      if (res && res.Key) {
        toast.success(t("CUSTOM_FILE_UPLOAD_SUCCESSFUL_ALERT"));
        uploadObj.loading = true;
        uploadObj.newFile = {
          fileId: res.Key,
          fileType: mime,
          type: "SELF",
        };
        let docDetails = res.documentDetails;

        if (docDetails) {
          let panNo = ""
          let panName = ""
          let dob = ""
          if (docDetails.panNumber) panNo = docDetails.panNumber
          if (docDetails.panName) panName = docDetails.panName
          if (docDetails.dob) {
            dob = DateTimeUtils.convertToIsoDate(docDetails.dob, "DD/MM/YYYY")
          }

          resetForm({
            pan: panNo,
            name: panName,
            dob: dob
          })
        }

        setUploadObj({ ...uploadObj });
      } else {
        toast.error(t("FILE_UPLOAD_FAILED"));
      }
      uploadObj.loading = false;
      setUploadObj({ ...uploadObj });
    } else {
      uploadObj.loading = false;
      setUploadObj({ ...uploadObj });
      toast.error(t("FILE_UPLOAD_FAILED"));
    }
  };

  const getMimeTypes = () => {
    var list = Constants.ALLOWED_PAN_MIMES.map((obj) => {
      return obj.mimeType;
    });
    return list.join(",");
  };

  const getAllowedFiles = () => {
    var fileList = Constants.ALLOWED_PAN_MIMES.map((obj) => {
      return obj.displayValue;
    });
    return fileList.join(", ");
  };

  const getMaxSizeDisplay = () => {
    return Constants.PAN_CERTIFICATE_MAX_FILE_SIZE_MB;
  };

  return (
    <IonPage>
      <Header />
      <IonContent fullscreen>
        {isLoading ? (
          <Loader />
        ) : (
          <form onSubmit={handleSubmit(onSubmit, onErr)}>
            <IonItem lines="none">
              <IonGrid className="pt-11">
                <IonRow className="">
                  <p className="fs-12 fw-600">
                    {t("DOCUMENT_VAULT")} ::{" "}
                    <span className="pending-text underline ">
                      {t("PERSONAL_PAN_CARD")}
                    </span>
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
                <h4 className="fs-20 fw-600">{t("PERSONAL_PAN_CARD")}</h4>
                <p className="fs-14 fw-400">{t("PERSONAL_PAN_UPLOAD_NOTE")}</p>
              </div>
            </IonItem>

            {/* main card start */}
            <IonCard className="primary-card no-border br-8">
              <IonCardContent className="card-content">
                <IonGrid className="p-0">
                  <IonRow className="">
                    <IonCol size="auto" className="">
                      <h4 className="fs-18 fw-600">{t("SELECT_PERSON")}</h4>
                    </IonCol>
                  </IonRow>

                  <IonRow className="">
                    <IonCol size="8" className="">
                      <IonItem lines="none" className="input-item">
                        <IonSelect
                          interface="popover"
                          mode="md"
                          className="w-100 select-field"
                          value={selectedPan || null}
                          onIonChange={(e) => {
                            selectPan(e.detail.value);
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

                  {totalDocsCount > 0 && (
                    <IonRow className="my-7 ion-justify-content-center">
                      <IonCol className="" size="auto">
                        <div className="d-flex ion-align-items-center mr-6">
                          <h4 className="fs-12 fw-600">{t("STATUS")}:</h4>
                          <div className="status-box-inbox">
                            <span className="fw-700 fs-12 dark">
                              {uploadedCount}
                            </span>
                            /
                            <span className="fs-12 fw-400">
                              {totalDocsCount}
                            </span>
                          </div>
                          <div>
                            <p>{t("PAN_UPLOADED")}</p>
                          </div>
                        </div>
                      </IonCol>
                    </IonRow>
                  )}
                </IonGrid>
                {action === "details" && (
                  <div className="details-section">
                    <IonGrid>
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
                          <h4 className="mb-0 fs-16 fw-600">{t("PAN")}</h4>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                    <IonGrid className="uploaded-wrapper">
                      <IonRow className="uploaded-box-gray py-0">
                        <IonCol size="12">
                          <IonRow className="uploaded-box ion-justify-content-center">
                            <IonCol size="10">
                              <FileDisplayComponent
                                uploadedFile={activeDocument?.files?.[0]}
                              ></FileDisplayComponent>
                            </IonCol>
                          </IonRow>
                          <IonRow>
                            <IonCol size="12" class="">
                              <div className="gst-numer">
                                <p className="fs-14 fw-400">
                                  {t("PAN_ACCOUNT_HOLDER_NAME")}
                                </p>
                                <p className="fs-14 fw-600">
                                  {activeDocument?.data?.["name"]}
                                </p>
                              </div>
                            </IonCol>
                          </IonRow>
                          <IonRow>
                            <IonCol size="6" class="">
                              <div className="gst-numer">
                                <p className="fs-14 fw-400">{t("PAN_")}</p>
                                <p className="fs-14 fw-600">
                                  {activeDocument?.data?.["panNumber"]}
                                </p>
                              </div>
                            </IonCol>
                            <IonCol size="6" class="">
                              <div className="gst-numer">
                                <p className="fs-14 fw-400">{t("PAN_DOB")}</p>
                                <p className="fs-14 fw-600">
                                  {DateTimeUtils.displayDateV3(
                                    activeDocument?.data?.["dob"]
                                  )}
                                </p>
                              </div>
                            </IonCol>
                          </IonRow>
                        </IonCol>
                      </IonRow>
                      <DocumentStatusComponent colorClass={detailsObj.colorClass}
                        description={detailsObj.desc}
                        icon={detailsObj.icon}
                        statusText={detailsObj.statusText}
                        updatedOn={detailsObj.updatedOn}
                      />

                    </IonGrid>
                  </div>
                )}

                {(action === "create" || action === "edit") && (
                  <div className="create-secton">
                    <IonGrid className="p-0">
                      <IonRow>
                        <IonCol>
                          <h4 className="mb-0 fs-16 fw-600">
                            {t("PERSONAL_PAN_UPLOAD")}
                          </h4>
                        </IonCol>
                      </IonRow>
                    </IonGrid>

                    <IonGrid>
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
                                  {t("CHOOSE_FILE")}: {getAllowedFiles()}
                                </p>
                                <p className="fs-12 fw-400">
                                  {t("MAXIMUM")} {getMaxSizeDisplay()}
                                  {t("MB")}
                                </p>
                              </div>
                            </div>
                          </IonCol>
                        </IonRow>
                      )}
                      <IonRow className="px-15 ion-justify-content-center"></IonRow>
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
                    </IonGrid>
                    {uploadObj.newFile && (
                      <IonGrid className="p-0">
                        <IonRow className="">
                          <IonCol size="12" className="">
                            <h4 className="fs-18 fw-600">
                              {t("DOCUMENTS_UPLOADED")}
                            </h4>
                            <p className="fs-12 fw-600">{t("PAN_CARD_CAP")}</p>
                          </IonCol>
                        </IonRow>
                        <IonRow className="ion-justify-content-center">
                          <IonCol size="10" className="">
                            <FileDisplayComponent
                              uploadedFile={uploadObj.newFile}
                              showDelete={true}
                              onDelete={
                                () => {
                                  setUploadObj({ ...newFileObj })
                                  resetForm()
                                }
                              }
                            ></FileDisplayComponent>
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    )}
                  </div>
                )}
              </IonCardContent>
              {
                ((action === 'create' ||action === 'edit') && uploadObj?.newFile === null) && (
                  <IonCardContent className="footer-gradient py-0">
                    <IonGrid>
                      <IonRow className="">
                        <IonCol size="6" className="ion-text-center">
                          <ActyvButton
                            text={t("SAVE")}
                            disabled={true}
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
                )
              }

            </IonCard>
            {/* main card end */}

            {(action === 'create' || action==='edit') && (uploadObj.newFile !== null) && (
              <IonCard className="primary-card no-border br-8">
                <IonCardContent className="card-content">
                  <IonGrid className="pb-0">
                    <IonRow>
                      <IonCol>
                        <IonList className="py-0">
                          <IonItem lines="none" className="input-item-labeled">
                            <IonLabel
                              className="fs-16 fw-600 dark mb-9"
                              position="stacked"
                            >
                              {t("PAN_NUMBER")}
                            </IonLabel>
                            <IonItem lines="none" className="input-item">
                              <IonInput
                                class="d-flex label-input"
                                {...register("pan", {
                                  required: {
                                    value: true,
                                    message: t("FIELD_REQUIRED"),
                                  },
                                  pattern: {
                                    value: ValidateUtils.PAN_REGEX,
                                    message: t("VALID_PAN_INPUT"),
                                  },
                                })}
                              ></IonInput>
                            </IonItem>
                            {formState.errors?.pan && (
                              <IonText color="danger">
                                {formState.errors?.pan?.message}
                              </IonText>
                            )}
                          </IonItem>
                        </IonList>
                      </IonCol>
                    </IonRow>

                    <IonRow>
                      <IonCol>
                        <IonList className="py-0">
                          <IonItem lines="none" className="input-item-labeled">
                            <IonLabel
                              className="fs-16 fw-600 dark mb-9"
                              position="stacked"
                            >
                              {t("PAN_ACCOUNT_HOLDER_NAME")}
                            </IonLabel>
                            <IonItem lines="none" className="input-item">
                              <IonInput
                                {...register("name", {
                                  required: {
                                    value: true,
                                    message: t("FIELD_REQUIRED"),
                                  },
                                })}
                                class="d-flex label-input"
                              ></IonInput>
                            </IonItem>
                          </IonItem>
                        </IonList>
                      </IonCol>
                    </IonRow>

                    <IonRow>
                      <IonCol>
                        <IonList className="py-0">
                          <IonItem lines="none" className="input-item-labeled">
                            <IonLabel
                              className="fs-16 fw-600 dark mb-9"
                              position="stacked"
                            >
                              {"Date of Birth"}
                            </IonLabel>
                            <IonItem lines="none" className="input-item">
                              <IonInput
                                type="date"
                                class="d-flex label-input"
                                placeholder=""
                                max={DateTimeUtils.now().format("YYYY-MM-DD")}
                                {...register("dob", {
                                  required: {
                                    value: true,
                                    message: t("FIELD_REQUIRED"),
                                  },
                                })}
                              ></IonInput>
                            </IonItem>
                          </IonItem>
                        </IonList>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonCardContent>
                <IonCardContent className="footer-gradient py-0">
                  <IonGrid>
                    <IonRow className="">
                      <IonCol size="6" className="ion-text-center">
                        <ActyvButton
                          text={t("SAVE")}
                          isLoading={submitLoading}
                          disabled={isButtonDisabled()}
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
              </IonCard>
            )}

            {
              (action === 'create' || action === 'edit') && (
                <>
                  <IonList className="list-transparent pr-20" lines="none">
                    <IonItem className="item-transparent">
                      <h4 className="fs-14 fw-700">
                        {t("PERSONAL_PAN_INSTRUCTION")}
                      </h4>
                    </IonItem>
                    <IonItem className="item-transparent pr-20">
                      <ul className="pl-20 mb-0">
                        <li className="fs-14 fw-400 mb-9">
                          {t("PERSONAL_PAN_TEXT")}
                        </li>
                        <li className="fs-14 fw-400 mb-9">{t("PAN_TEXT_1")}</li>
                        <li className="fs-14 fw-400 mb-0">{t("PAN_TEXT_2")}</li>
                      </ul>
                    </IonItem>
                  </IonList>

                  <IonGrid className="">
                    <IonRow>
                      <IonCol size="4" className="">
                        <div className="img-formate-wrap d-flex ion-justify-content-center">
                          <IonImg
                            src="./img/partner-img/blur-pan.svg"
                            alt="wrong-way"
                          ></IonImg>
                        </div>
                        <IonItem className="item-transparent pl--0" lines="none">
                          <IonImg
                            src="./img/partner-img/cross-red.svg"
                            alt="cross"
                            className="mr-6"
                          ></IonImg>
                          <p className="fs-10 fw-600">{t("DON'T")}</p>
                        </IonItem>
                      </IonCol>
                      <IonCol size="4" className="">
                        <div className="img-formate-wrap d-flex ion-justify-content-center">
                          <IonImg
                            src="./img/partner-img/invisible-pan.svg"
                            alt="wrong-way"
                          ></IonImg>
                        </div>
                        <IonItem className="item-transparent pl--0" lines="none">
                          <IonImg
                            src="./img/partner-img/cross-red.svg"
                            alt="cross"
                            className="mr-6"
                          ></IonImg>
                          <p className="fs-10 fw-600">{t("DON'T")}</p>
                        </IonItem>
                      </IonCol>
                      <IonCol size="4" className="">
                        <div className="img-formate-wrap d-flex ion-justify-content-center">
                          <IonImg
                            src="./img/partner-img/correct-pan.svg"
                            alt="wrong-way"
                          ></IonImg>
                        </div>
                        <IonItem className="item-transparent pl--0" lines="none">
                          <IonImg
                            src="./img/partner-img/right-success.svg"
                            alt="correct"
                            className="mr-6"
                          ></IonImg>
                          <p className="fs-10 fw-600">{t("YES")}</p>
                        </IonItem>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </>
              )
            }

            {/* Tab content start */}
          </form>
        )}
      </IonContent>
    </IonPage>
  );
};

export default PanVerification;
