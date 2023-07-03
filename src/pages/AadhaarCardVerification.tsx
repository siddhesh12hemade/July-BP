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
  IonText,
  IonTextarea,
  useIonModal
} from "@ionic/react";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import * as _ from "lodash";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import ActyvButton from "../components/ActyvButton";
import VerifyCaptchaModal from "../components/CaptchaComponent";
import DocumentStatusComponent from "../components/DocumentStatusComponent";
import FileDisplayComponent from "../components/FileDisplayComponent";
import Header from "../components/Header";
import Loader from "../components/Loader";
import { Constants } from "../utils/constants/constants";
import { IDropDown } from "../utils/interfaces/App.interface";
import {
  AadharData,
  AadharDataApiRes,
  IFile,
  IIndividualPersonDocumentResponse,
  IUploadAndSaveDocument,
  UploadObj
} from "../utils/interfaces/DocumentVault.interface";
import {
  initiateAadhaarVerification,
  initiateVerifyAadhaarCaptcha,
  initiateVerifyAadhaarOTP,
  uploadAndProcessAadhar
} from "../utils/services/Aadhaar.Service";
import {
  getPersonalDocumentHistory,
  uploadAndSavePersonalDocument
} from "../utils/services/DocumentVault.Service";
import { useAppSelector } from "../utils/store/hooks";
import { selectCurrentBusinessPartnerId } from "../utils/store/user.slice";
import { DateTimeUtils } from "../utils/utils/DateTime.Utils";
import { Helpers } from "../utils/utils/Helpers";
var classNames = require('classnames');

interface IDetailsObj {
  data: AadharData;
  statusColor: string;
  updatedOn: string;
  statusText: string;
  icon: string;
  colorClass: string;
  desc: string;
  documents: IFile[];
}

const AadhaarVerification: React.FC = () => {
  const [captchaUrl, setCaptchaUrl] = useState("");
  const [verifyCaptchaModal, dismissVerifyCaptchaModal] = useIonModal(
    VerifyCaptchaModal,
    {
      onDismiss: (data: string, role: string) =>
        dismissVerifyCaptchaModal(data, role),
      captchaUrl: captchaUrl,
    }
  );

  const {
    reset: resetManual,
    register: registerManual,
    handleSubmit: handleSubmitManual,
    formState: formStateManual,
    setValue: setValueManual,
    control: controlManual,
  } = useForm<AadharData>({
    mode: "onChange",
    defaultValues: {
      aadhaarNumber: "",
      name: "",
      careOf: "",
      gender: "",
      dob: "",
      district: "",
      subDistrict: "",
      address: "",
      state: "",
      pinCode: "",
      country: "",
    },
  });

  const {
    reset: resetAuto,
    resetField,
    register: registerAuto,
    handleSubmit: handleSubmitAuto,
    formState: formStateAuto,
    setValue: setValueAuto,
    control: controlAuto,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      aadhar: "",
      otp: "",
    },
  });

  const [detailsObj, setDetailsObj] = useState<IDetailsObj>({
    data: null,
    statusColor: "",
    updatedOn: "",
    statusText: "",
    icon: "",
    colorClass: "",
    desc: "",
    documents: [],
  });
  const { t } = useTranslation();
  const [dropDownList, setDropdownList] = useState<IDropDown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [manualSubmitLoading, setManualSubmitLoading] = useState(false);
  const currentBusinessPartnerId = useAppSelector<string>(
    selectCurrentBusinessPartnerId
  );
  const [allDocuments, setAllDocuments] = useState<
    IIndividualPersonDocumentResponse[]
  >([]);
  const [selectedAadhar, setSelectedAadhar] = useState("");
  const [selectedSide, seetSelectedSide] = useState("");
  const [selectedAadharDocument, setSelectedAadharDocument] =
    useState<IIndividualPersonDocumentResponse>(null);
  const [uploadedCount, setUploadedCount] = useState<number>(null);
  const [totalDocsCount, setTotalDocsCount] = useState<number>(null);
  const [aadharDataFromDoc, setAadharDataFromDoc] = useState<AadharData>({});
  const [action, setAction] = useState("");
  const [uploadObj, setUploadObj] = useState<UploadObj>();
  const [savingDataFromDoc, setSavingDataFromDoc] = useState(false);

  let history = useHistory();
  // otp-verification
  // ""
  const [autoVerifyState, setAutoVerifyState] = useState({
    state: "",
    loading: false,
  });

  useEffect(() => {
    if (action === "edit") {
      let data: AadharData = selectedAadharDocument.documentInfo.data;

      let dob = null;
      try {
        dob = DateTimeUtils.isoDateStr(data.dob);
        data.dob = dob;
      } catch (e) { }
      setAadharDataFromDoc(data);
    }
  }, [action]);

  useEffect(() => {
    fetchData();
  }, []);

  const reset = () => {
    setAction("");
    setSelectedAadharDocument(null);
    setUploadObj({ ...uploadObj, files: [], loading: false });
  };

  const getUploadedStatusCount = () => {
    if (!allDocuments) return null;
    let uploaded = 0;

    for (let doc of allDocuments) {
      if (doc.documentInfo) uploaded++;
    }
    return uploaded;
  };

  useEffect(() => {
    reset();
    if (selectedAadhar === "") {
      setAction("");
    } else {
      let activeDoc: IIndividualPersonDocumentResponse = null;
      for (const obj of allDocuments) {
        if (obj.personId === selectedAadhar) {
          activeDoc = obj;
          break;
        }
      }
      if (_.isEmpty(activeDoc.documentInfo)) setAction("create");
      else setAction("details");
      setSelectedAadharDocument(activeDoc);
    }

    setTotalDocsCount(_.size(allDocuments));
    setUploadedCount(getUploadedStatusCount());
  }, [selectedAadhar, allDocuments]);

  useEffect(() => {
    if (selectedAadharDocument) initData();
  }, [selectedAadharDocument, allDocuments]);

  const setManualFormData = (data: AadharData) => {
    let dob = null;
    try {
      dob = DateTimeUtils.isoDateStr(data.dob);
    } catch (e) { }

    if (data) {
      resetManual({
        aadhaarNumber: data?.aadhaarNumber,
        country: data?.country,
        district: data?.district,
        dob: dob,
        address: data?.address,
        gender: data?.gender,
        name: data?.name,
        pinCode: data?.pinCode,
        careOf: data?.careOf,
        state: data?.state,
        subDistrict: data?.subDistrict,
      });
    }
  };

  const initData = () => {
    if (!_.isEmpty(selectedAadharDocument.documentInfo)) {
      let statusObj = Helpers.getDocumentStatusForDetails(
        true,
        selectedAadharDocument.documentInfo.status
      );
      let obj = {
        statusColor: "",
        updatedOn: DateTimeUtils.displayDateV2(
          selectedAadharDocument.documentInfo.updatedOn
        ),
        statusText: statusObj.statusText,
        icon: statusObj.icon,
        colorClass: statusObj.colorClass,
        desc: statusObj.desc,
        documents: selectedAadharDocument.documentInfo.files,
        data: selectedAadharDocument.documentInfo.data,
      };

      selectedAadharDocument.documentInfo.files.forEach((obj) => {
        obj.title = obj.type;
      });
      setUploadObj({
        ...uploadObj,
        files: selectedAadharDocument.documentInfo.files,
      });
      let data: AadharData = selectedAadharDocument.documentInfo.data;

      setDetailsObj(obj);

      if (data) {
        setManualFormData(data);
        resetAuto({
          aadhar: data?.aadhaarNumber,
        });
      }
    }
  };
  const fetchData = async () => {
    setIsLoading(true);
    let apiRes = await getPersonalDocumentHistory(
      Constants.DOC_TYPE_AADHAAR,
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

      if (!selectedAadhar) {
        if (_.size(list)) setSelectedAadhar(list[0].value);
      }
    }
    setIsLoading(false);
  };

  const selectAadhar = (val: string) => {
    setSelectedAadhar(val);
  };

  const enableEdit = () => {
    setAction("edit");
  };

  const getMimeTypes = () => {
    var list = Constants.ALLOWED_AADHAR_MIME.map((obj) => {
      return obj.mimeType;
    });
    return list.join(",");
  };

  const getAllowedFiles = () => {
    var fileList = Constants.ALLOWED_AADHAR_MIME.map((obj) => {
      return obj.displayValue;
    });
    return fileList.join(", ");
  };

  const getMaxSizeDisplay = () => {
    return Constants.AADHAR_MAX_FILE_SIZE_MB;
  };

  const isFileSizeValid = (size) => {
    let sizeInMb = size * Constants.MB_CONVERTER;
    return sizeInMb > Constants.AADHAR_MAX_FILE_SIZE_MB;
  };

  const checkIsMimeValid = (mime) => {
    return getMimeTypes().includes(mime);
  };

  const fileChangedHandler = (event) => {
    if (!selectedSide) {
      toast(t("SELECT_SIDE_DOC"));
      return;
    }

    let file = event.target.files[0];
    let file_size = file.size;
    let mime = file.type;

    let isSizeValid = isFileSizeValid(file_size);
    let isMimeValid = checkIsMimeValid(mime);

    if (!isSizeValid) {
      toast.error(
        `size cannot be greater than ${Constants.AADHAR_MAX_FILE_SIZE_MB} MB`
      );
      event.value = "";
    } else if (!isMimeValid) {
      toast.error(mime + " not supported");
      event.value = "";
    } else {
      beginUpload(file, mime, selectedSide);
    }
  };

  const beginUpload = async (file: any, mime: string, type: string) => {
    setUploadObj({ ...uploadObj, loading: true });

    let side = Constants.AADHAR_SIDES.find((obj) => obj.value === selectedSide);

    let apiRes = await uploadAndProcessAadhar(
      side.upload_key,
      currentBusinessPartnerId,
      file
    );
    if (apiRes.status === Constants.API_SUCCESS) {
      let res = apiRes.data;
      if (res && res.Key) {
        toast.success(t("CUSTOM_FILE_UPLOAD_SUCCESSFUL_ALERT"));

        uploadObj.files = uploadObj.files.filter((obj) => {
          return obj.type !== type;
        });

        let newFile: IFile = {
          fileId: res.Key,
          fileType: mime,
          type: type,
          title: type,
        };
        uploadObj.files.push(newFile);
        setUploadObj(uploadObj);
        let docDetails = res.documentDetails;

        if (docDetails?.aadhaarName)
          aadharDataFromDoc.name = docDetails?.aadhaarName;
        if (docDetails?.aadhaarNumberFront)
          aadharDataFromDoc.aadhaarNumber = docDetails?.aadhaarNumberFront;
        if (docDetails?.dob)
          aadharDataFromDoc.dob = DateTimeUtils.parseAndGetIso(
            docDetails?.dob,
            "DD/MM/YYYY"
          );
        if (docDetails?.gender) aadharDataFromDoc.gender = docDetails?.gender;
        if (docDetails?.address)
          aadharDataFromDoc.address = docDetails?.address;
        if (docDetails?.fatherName)
          aadharDataFromDoc.careOf = docDetails?.fatherName;

        setAadharDataFromDoc({ ...aadharDataFromDoc });
      } else {
        toast.error(t("FILE_UPLOAD_FAILED"));
      }

      setUploadObj({ ...uploadObj, loading: false });
    } else {
      setUploadObj({ ...uploadObj, loading: false });
      toast.error(t("FILE_UPLOAD_FAILED"));
    }
  };

  const isFileUploadNextDisabled = () => {
    return (
      _.size(uploadObj.files) < _.size(Constants.AADHAR_SIDES) ||
      savingDataFromDoc
    );
  };

  const enableAutoVerification = async () => {
    return setAction("auto-verification");
  };

  const saveDataFromDoc = async () => {
    setSavingDataFromDoc(true);
    let apiRes = await saveAadharInfo(aadharDataFromDoc);

    if (apiRes.status === Constants.API_SUCCESS) {

      let aadharData: AadharData = aadharDataFromDoc
      setManualFormData(aadharData);
      resetAuto({
        aadhar: aadharData?.aadhaarNumber,
      });

      setAction("auto-verification");
      setSavingDataFromDoc(false);
    }
  };

  const enableManualVerification = () => {
    setAutoVerifyState({ state: "", loading: false })
    return setAction("manual-verification");
  };
  const isManualSubmitDisabled = () => {
    return manualSubmitLoading;
  };

  const onAutoSubmit = async (data: { aadhar: string; otp: string }) => {
    setAutoVerifyState({ ...autoVerifyState, loading: true });
    if (autoVerifyState.state === "") {
      let apiRes = await initiateAadhaarVerification({
        aadhaarNumber: data.aadhar,
      });
      if (apiRes.status === Constants.API_SUCCESS) {
        let res = apiRes.data;
        setAutoVerifyState({ ...autoVerifyState, loading: false });
        if (res.response.success) {
          setCaptchaUrl(res.response.captcha);
          verifyCaptchaModal({
            cssClass: "custom-modal aadhar-modal",
            onWillDismiss: async (ev: CustomEvent<OverlayEventDetail>) => {
              if (ev.detail.role === "refresh") {
                onAutoSubmit(data);
              } else if (ev.detail.role === "confirm") {
                let captchaText = ev.detail.data;

                setAutoVerifyState({ ...autoVerifyState, loading: true });
                let captchaVerifyApiRes = await initiateVerifyAadhaarCaptcha({
                  aadhaarNumber: data.aadhar,
                  captchaCode: captchaText,
                });
                if (captchaVerifyApiRes.status === Constants.API_SUCCESS) {
                  let captchaVerifyRes = captchaVerifyApiRes.data;
                  if (
                    captchaVerifyRes.response.success &&
                    captchaVerifyRes.response["status-code"] ===
                    Constants.STATUS_CODE_SUCCESS
                  ) {
                    toast.success(t("AADHAR_OTP_GENERATED"));
                    autoVerifyState.state = "otp-verification";
                  } else {
                    toast.error(captchaVerifyRes.response.message);
                  }
                } else {
                  toast.error(apiRes.message);
                }
                autoVerifyState.loading = false;
                setAutoVerifyState(autoVerifyState);
              }
            },
          });
        } else {
          setAutoVerifyState({ ...autoVerifyState, loading: false });
          toast.error(res.response.message);
        }
      } else {
        setAutoVerifyState({ ...autoVerifyState, loading: false });
        toast.error(t("ISSUE_WHILE_INITIATING_AADHAAR_CAPTCHA_VERIFICATION"));
      }
    } else if (autoVerifyState.state === "otp-verification") {
      let apiRes = await initiateVerifyAadhaarOTP({
        aadhaarNumber: data.aadhar,
        otp: data.otp,
        personId: selectedAadhar,
      });
      if (apiRes.status === Constants.API_SUCCESS) {
        let res = apiRes?.data;
        if (
          res.response.success &&
          res.response["status-code"] === Constants.STATUS_CODE_SUCCESS
        ) {
          let aadharDataApiRes: AadharDataApiRes = res.response.result.data
          for (const obj of allDocuments) {
            if (obj.personId === selectedAadhar) {
              let dob = ""
              if (aadharDataApiRes.dob) {
                try {
                  dob = DateTimeUtils.parseCustom(aadharDataApiRes.dob, "DD-MM-YYYY", "YYYY-MM-DD")
                }
                catch {
                  dob = ""
                }
              }
              let aadharData: AadharData = {
                ...aadharDataApiRes,
                aadhaarNumber: aadharDataApiRes.aadharNumber.toString(),
                pinCode: aadharDataApiRes.pin_code,
                dob: dob,
                careOf: aadharDataApiRes.careof
              }
              obj.documentInfo.data = aadharData
              setAllDocuments(allDocuments)
              setDetailsObj({ ...detailsObj, data: aadharData })
              toast.success(t("AADHAR_OTP_SUCCESS"));
              break;
            }
          }

          setAction("details");
        } else {
          autoVerifyState.state = "";
          resetField("otp");
          toast.error(res.response.message);
        }
      } else {
        toast.error(t("ISSUE_WHILE_VERIFYING_AADHAAR_OTP"));
      }
    }
    setAutoVerifyState({ ...autoVerifyState, loading: false });
  };

  const saveAadharInfo = async (data: AadharData) => {
    let request: IUploadAndSaveDocument = {
      files: uploadObj.files,
      documentType: Constants.DOC_TYPE_AADHAAR,
      data: {
        name: data?.name,
        careOf: data?.careOf,
        district: data?.district,
        state: data?.state,
        country: data?.country,
        subDistrict: data?.subDistrict,
        dob: data?.dob,
        gender: data?.gender,
        pinCode: data?.pinCode,
        address: data?.address,
        aadhaarNumber: data?.aadhaarNumber,
      },
      documentNo: data?.aadhaarNumber,
      businessPartnerId: currentBusinessPartnerId,
      personId: selectedAadhar,
      endDate: "",
      startDate: "",
    };

    let apiRes = await uploadAndSavePersonalDocument(request);
    return apiRes;
  };

  const onManualSubmit = async (data: AadharData) => {
    setManualSubmitLoading(true);

    let apiRes = await saveAadharInfo(data);
    if (apiRes.status === Constants.API_SUCCESS) {
      let res = apiRes.data;
      if (res.statusCode === Constants.API_SUCCESS) {
        await fetchData();
        setAction("details");
      }
      setManualSubmitLoading(false);
    } else {
      setManualSubmitLoading(false);
    }
  };

  const autoVerifyBtnDisabled = () => {
    return autoVerifyState.loading;
  };

  const cancelFileUpload = () => {
    history.goBack()
  };

  const getAutoVerifyBtnText = () => {
    if (autoVerifyState.state === "") return t("NEXT");
    else if (autoVerifyState.state === "otp-verification") return t("VERIFY");
  };

  return (
    <IonPage>
      <Header />

      <IonContent fullscreen>
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <IonItem lines="none">
              <IonGrid className="pt-11">
                <IonRow className="">
                  <p className="fs-12 fw-600">
                    {t("DOCUMENT_VAULT")} ::{" "}
                    <span className="pending-text underline ">
                      {t("AADHAAR")}
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
                <h4 className="fs-20 fw-600">{t("AADHAAR")}</h4>
                <p className="fs-14 fw-400">{t("AADHAAR_UPLOAD_NOTE")}</p>
              </div>
            </IonItem>

            {/* upload statement end */}
            {(action === "create" || action === "edit") && (
              <IonCard className="primary-card no-border br-8">
                <IonCardContent className="card-content">
                  <IonGrid className="p-0">
                    <IonRow className="">
                      <IonCol size="12" className="">
                        <IonList className="py-0">
                          <p className="fs-18 fw-600 dark">
                            {t("SELECT_AADHAAR_CARD")}
                          </p>
                          <IonItem lines="none" className="input-item">
                            <IonSelect
                              interface="popover"
                              mode="md"
                              className="w-100 select-field"
                              value={selectedAadhar || null}
                              onIonChange={(e) => {
                                selectAadhar(e.detail.value);
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
                        </IonList>
                      </IonCol>
                    </IonRow>

                    <IonRow className="">
                      <IonCol size="12" className="">
                        <IonList className="py-0">
                          <p className="fs-18 fw-600 dark">{t("AADHAAR")}</p>
                          <IonItem lines="none" className="input-item">
                            <IonSelect
                              interface="popover"
                              mode="md"
                              placeholder={t("SELECT_SIDE")}
                              className="w-100 select-field"
                              value={selectedSide || null}
                              onIonChange={(e) => {
                                seetSelectedSide(e.detail.value);
                              }}
                            >
                              {Constants.AADHAR_SIDES.map((obj) => (
                                <IonSelectOption value={obj.value}>
                                  {obj.display}
                                </IonSelectOption>
                              ))}
                            </IonSelect>
                          </IonItem>
                        </IonList>
                      </IonCol>
                    </IonRow>
                  </IonGrid>

                  <IonGrid>
                    {uploadObj.loading ? (
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
                    ) : (
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
                                {t("FILE_SUPPORTED")}: {getAllowedFiles()}
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

                    <IonRow className="px-15 ion-justify-content-center">
                      {uploadObj &&
                        uploadObj.files.map((obj, index) => (
                          <IonCol size="6" className="">
                            <FileDisplayComponent
                              uploadedFile={obj}
                              showDelete={true}
                              onDelete={
                                () => {                                  
                                  uploadObj.files.splice(index, 1)
                                  setUploadObj({...uploadObj})
                                }
                              }
                            ></FileDisplayComponent>
                          </IonCol>
                        ))}
                    </IonRow>
                  </IonGrid>
                </IonCardContent>

                <IonCardContent className="footer-gradient py-0">
                  <IonGrid>
                    <IonRow className="">
                      <IonCol size="6" className="ion-text-center">
                        <ActyvButton
                          onClick={saveDataFromDoc}
                          text={t("NEXT")}
                          isLoading={savingDataFromDoc}
                          disabled={isFileUploadNextDisabled()}
                        ></ActyvButton>
                      </IonCol>

                      <IonCol size="6" className="ion-text-center">
                        <IonButton
                          className="clear-btn-gray"
                          fill="clear"
                          onClick={cancelFileUpload}
                          disabled={savingDataFromDoc}
                        >
                          {t("CANCEL_CAP")}
                        </IonButton>
                      </IonCol>

                    </IonRow>
                  </IonGrid>
                </IonCardContent>
              </IonCard>
            )}

            {/* upload statement end */}

            {/* Captcha start */}
            {(action === "manual-verification" ||
              action === "auto-verification") && (
                <IonCard className="primary-card no-border br-8">
                  <IonCardContent className="card-content">
                    <IonGrid className="p-0">
                      <IonRow className="px-15 ion-justify-content-center">
                        {uploadObj &&
                          uploadObj.files.map((obj) => (
                            <IonCol size="6" className="">
                              <FileDisplayComponent
                                uploadedFile={obj}
                              ></FileDisplayComponent>
                            </IonCol>
                          ))}
                      </IonRow>
                    </IonGrid>
                  </IonCardContent>
                </IonCard>
              )}
            {/* Captcha end */}

            {/* OTP Verification start */}

            {action === "manual-verification" && (
              <IonCard className="primary-card no-border br-8">
                <IonCardContent className="card-content">
                  <IonGrid className="pb-0">
                    <IonRow className="">
                      <IonCol size="4" className="pb-0">
                        <IonImg
                          className="mw-10 uploaded-preview"
                          src="./img/aadhar.svg"
                        ></IonImg>
                      </IonCol>
                    </IonRow>
                    <IonRow>
                      <IonCol className="pt-0">
                        <h3 className="fs-18 fw-600">{t("VERIFY_MANUALLY")}</h3>
                        <p className="fs-12 fw-400">
                          {t("SUBMIT_FOR_VERIFICATION")}
                        </p>
                      </IonCol>
                    </IonRow>
                  </IonGrid>

                  <form onSubmit={handleSubmitManual(onManualSubmit)}>
                    <IonGrid className="px-0 pt-0">
                      <IonRow>
                        <IonCol>
                          <IonList className="py-0">
                            <IonItem
                              lines="none"
                              className="input-item-labeled"
                            >
                              <IonLabel
                                className="fs-16 fw-600 dark mb-9"
                                position="stacked"
                              >
                                {t("AADHAAR_NUMBER")}
                              </IonLabel>
                              <IonItem lines="none" className="input-item">
                                <IonInput
                                  class="d-flex label-input"
                                  placeholder=""
                                  type="number"
                                  {...registerManual("aadhaarNumber", {
                                    required: {
                                      value: true,
                                      message: t("FIELD_REQUIRED"),
                                    },
                                    maxLength: {
                                      value: 12,
                                      message: t("LENGTH_GREATER").replace(
                                        "{value}",
                                        "12"
                                      ),
                                    },
                                    minLength: {
                                      value: 12,
                                      message: t("LENGTH_LESS").replace(
                                        "{value}",
                                        "12"
                                      ),
                                    },
                                  })}
                                ></IonInput>
                              </IonItem>
                              {formStateManual.errors?.aadhaarNumber && (
                                <IonText color="danger">
                                  {
                                    formStateManual.errors?.aadhaarNumber
                                      ?.message
                                  }
                                </IonText>
                              )}
                            </IonItem>
                          </IonList>
                        </IonCol>
                      </IonRow>

                      <IonRow>
                        <IonCol>
                          <IonList className="py-0">
                            <IonItem
                              lines="none"
                              className="input-item-labeled"
                            >
                              <IonLabel
                                className="fs-16 fw-600 dark mb-9"
                                position="stacked"
                              >
                                {t("AADHAAR_NAME")}
                              </IonLabel>
                              <IonItem lines="none" className="input-item">
                                <IonInput
                                  class="d-flex label-input"
                                  placeholder=""
                                  {...registerManual("name", {
                                    required: {
                                      value: true,
                                      message: t("FIELD_REQUIRED"),
                                    },
                                  })}
                                ></IonInput>
                              </IonItem>
                              {formStateManual.errors?.name && (
                                <IonText color="danger">
                                  {formStateManual.errors?.name?.message}
                                </IonText>
                              )}
                            </IonItem>
                          </IonList>
                        </IonCol>
                      </IonRow>

                      <IonRow>
                        <IonCol>
                          <IonList className="py-0">
                            <IonItem
                              lines="none"
                              className="input-item-labeled"
                            >
                              <IonLabel
                                className="fs-16 fw-600 dark mb-9"
                                position="stacked"
                              >
                                {t("SON_OR_DAUGHTER_OF")}
                              </IonLabel>
                              <IonItem lines="none" className="input-item">
                                <IonInput
                                  class="d-flex label-input"
                                  placeholder=""
                                  {...registerManual("careOf", {
                                    required: {
                                      value: true,
                                      message: t("FIELD_REQUIRED"),
                                    },
                                  })}
                                ></IonInput>
                              </IonItem>
                              {formStateManual.errors?.careOf && (
                                <IonText color="danger">
                                  {formStateManual.errors?.careOf?.message}
                                </IonText>
                              )}
                            </IonItem>
                          </IonList>
                        </IonCol>
                      </IonRow>

                      <IonRow>
                        <IonCol>
                          <IonList className="py-0">
                            <IonItem
                              lines="none"
                              className="input-item-labeled"
                            >
                              <IonLabel
                                className="fs-16 fw-600 dark mb-9"
                                position="stacked"
                              >
                                {t("GENDER")}
                              </IonLabel>
                              <IonItem lines="none" className="input-item">
                                <IonInput
                                  class="d-flex label-input"
                                  placeholder={t("MALE")}
                                  {...registerManual("gender", {
                                    required: {
                                      value: true,
                                      message: t("FIELD_REQUIRED"),
                                    },
                                  })}
                                ></IonInput>
                              </IonItem>
                              {formStateManual.errors?.gender && (
                                <IonText color="danger">
                                  {formStateManual.errors?.gender?.message}
                                </IonText>
                              )}
                            </IonItem>
                          </IonList>
                        </IonCol>
                      </IonRow>

                      <IonRow>
                        <IonCol>
                          <IonList className="py-0">
                            <IonItem
                              lines="none"
                              className="input-item-labeled"
                            >
                              <IonLabel
                                className="fs-16 fw-600 dark mb-9"
                                position="stacked"
                              >
                                {t("DATE_OF_BIRTH")}
                              </IonLabel>
                              <IonItem lines="none" className="input-item">
                                <IonInput
                                  type="date"
                                  class="d-flex label-input"
                                  placeholder=""
                                  max={DateTimeUtils.now().format("YYYY-MM-DD")}
                                  {...registerManual("dob", {
                                    required: {
                                      value: true,
                                      message: t("FIELD_REQUIRED"),
                                    },
                                  })}
                                ></IonInput>
                              </IonItem>
                              {formStateManual.errors?.dob && (
                                <IonText color="danger">
                                  {formStateManual.errors?.dob?.message}
                                </IonText>
                              )}
                            </IonItem>
                          </IonList>
                        </IonCol>
                      </IonRow>

                      <IonRow>
                        <IonCol>
                          <IonList className="py-0">
                            <IonItem
                              lines="none"
                              className="input-item-labeled"
                            >
                              <IonLabel
                                className="fs-16 fw-600 dark mb-9"
                                position="stacked"
                              >
                                {t("DISTRICT")}
                              </IonLabel>
                              <IonItem lines="none" className="input-item">
                                <IonInput
                                  class="d-flex label-input"
                                  placeholder=""
                                  {...registerManual("district", {
                                    required: {
                                      value: true,
                                      message: t("FIELD_REQUIRED"),
                                    },
                                  })}
                                ></IonInput>
                              </IonItem>
                              {formStateManual.errors?.district && (
                                <IonText color="danger">
                                  {formStateManual.errors?.district?.message}
                                </IonText>
                              )}
                            </IonItem>
                          </IonList>
                        </IonCol>
                      </IonRow>

                      <IonRow>
                        <IonCol>
                          <IonList className="py-0">
                            <IonItem
                              lines="none"
                              className="input-item-labeled"
                            >
                              <IonLabel
                                className="fs-16 fw-600 dark mb-9"
                                position="stacked"
                              >
                                {t("SUB_DISTRICT")}
                              </IonLabel>
                              <IonItem lines="none" className="input-item">
                                <IonInput
                                  class="d-flex label-input"
                                  placeholder=""
                                  {...registerManual("subDistrict", {
                                    required: {
                                      value: true,
                                      message: t("FIELD_REQUIRED"),
                                    },
                                  })}
                                ></IonInput>
                              </IonItem>
                              {formStateManual.errors?.subDistrict && (
                                <IonText color="danger">
                                  {formStateManual.errors?.subDistrict?.message}
                                </IonText>
                              )}
                            </IonItem>
                          </IonList>
                        </IonCol>
                      </IonRow>

                      <IonRow>
                        <IonCol>
                          <IonList className="py-0">
                            <IonItem
                              lines="none"
                              className="input-item-labeled"
                            >
                              <IonLabel
                                className="fs-16 fw-600 dark mb-9"
                                position="stacked"
                              >
                                {t("FULL_ADDRESS")}
                              </IonLabel>
                              <IonItem lines="none" className="input-item">
                                <IonTextarea
                                  class="label-input"
                                  placeholder=""
                                  {...registerManual("address", {
                                    required: {
                                      value: true,
                                      message: t("FIELD_REQUIRED"),
                                    },
                                  })}
                                ></IonTextarea>
                              </IonItem>
                              {formStateManual.errors?.address && (
                                <IonText color="danger">
                                  {formStateManual.errors?.address?.message}
                                </IonText>
                              )}
                            </IonItem>
                          </IonList>
                        </IonCol>
                      </IonRow>

                      <IonRow>
                        <IonCol>
                          <IonList className="py-0">
                            <IonItem
                              lines="none"
                              className="input-item-labeled"
                            >
                              <IonLabel
                                className="fs-16 fw-600 dark mb-9"
                                position="stacked"
                              >
                                {t("STATE")}
                              </IonLabel>
                              <IonItem lines="none" className="input-item">
                                <IonInput
                                  class="d-flex label-input"
                                  placeholder=""
                                  {...registerManual("state", {
                                    required: {
                                      value: true,
                                      message: t("FIELD_REQUIRED"),
                                    },
                                  })}
                                ></IonInput>
                              </IonItem>
                              {formStateManual.errors?.state && (
                                <IonText color="danger">
                                  {formStateManual.errors?.state?.message}
                                </IonText>
                              )}
                            </IonItem>
                          </IonList>
                        </IonCol>
                      </IonRow>

                      <IonRow>
                        <IonCol>
                          <IonList className="py-0">
                            <IonItem
                              lines="none"
                              className="input-item-labeled"
                            >
                              <IonLabel
                                className="fs-16 fw-600 dark mb-9"
                                position="stacked"
                              >
                                {t("PINCODE")}
                              </IonLabel>
                              <IonItem lines="none" className="input-item">
                                <IonInput
                                  class="d-flex label-input"
                                  placeholder=""
                                  {...registerManual("pinCode", {
                                    required: {
                                      value: true,
                                      message: t("FIELD_REQUIRED"),
                                    },
                                  })}
                                ></IonInput>
                              </IonItem>
                              {formStateManual.errors?.pinCode && (
                                <IonText color="danger">
                                  {formStateManual.errors?.pinCode?.message}
                                </IonText>
                              )}
                            </IonItem>
                          </IonList>
                        </IonCol>
                      </IonRow>

                      <IonRow>
                        <IonCol>
                          <IonList className="py-0">
                            <IonItem
                              lines="none"
                              className="input-item-labeled"
                            >
                              <IonLabel
                                className="fs-16 fw-600 dark mb-9"
                                position="stacked"
                              >
                                {t("COUNTRY")}
                              </IonLabel>
                              <IonItem lines="none" className="input-item">
                                <IonInput
                                  class="d-flex label-input"
                                  placeholder=""
                                  {...registerManual("country", {
                                    required: {
                                      value: true,
                                      message: t("FIELD_REQUIRED"),
                                    },
                                  })}
                                ></IonInput>
                              </IonItem>
                              {formStateManual.errors?.country && (
                                <IonText color="danger">
                                  {formStateManual.errors?.country?.message}
                                </IonText>
                              )}
                            </IonItem>
                          </IonList>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                    <IonGrid>
                      <IonRow className="mt-10">
                        <IonCol>
                          <div className="p-relative">
                            <div className="mb-9 choose-btn-wrp ion-text-center">
                              <ActyvButton
                                text={t("SUBMIT")}
                                isLoading={manualSubmitLoading}
                                disabled={isManualSubmitDisabled()}
                              ></ActyvButton>
                            </div>
                          </div>
                        </IonCol>
                      </IonRow>
                      <IonRow className="mb-10">
                        <IonCol>
                          <div className="p-relative">
                            <div className="mb-9 choose-btn-wrp ion-text-center">
                              <IonButton
                                expand="block"
                                type="button"
                                disabled={isManualSubmitDisabled()}
                                shape="round"
                                fill="outline"
                                onClick={enableAutoVerification}
                                className="fs-14 fw-600 button-outline-primary"
                              >
                                {t("AADHAAR_E_VERIFICATION_FLOW")}
                              </IonButton>
                            </div>
                          </div>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </form>
                </IonCardContent>
              </IonCard>
            )}

            {action === "auto-verification" && (
              <IonCard className="overflow-visible primary-card no-shadow border-1 br-8">
                <IonCardContent className="py-0">
                  <form onSubmit={handleSubmitAuto(onAutoSubmit)}>
                    <IonGrid>
                      <IonRow className="">
                        <IonCol size="4" className="">
                          <IonImg
                            className="mw-10 uploaded-preview"
                            src="./img/aadhar.svg"
                          ></IonImg>
                        </IonCol>
                      </IonRow>
                      <IonRow>
                        <IonCol>
                          <p className="fs-18 fw-600">
                            {t("LOGIN_TO_AADHAAR_PORTAL")}
                          </p>
                          <p className="fs-14 fw-600">
                            {t("LOGIN_VERIFICATION_INSTRUCTION")}
                          </p>
                        </IonCol>
                      </IonRow>
                      <IonRow>
                        <IonCol>
                          <IonList className="py-0">
                            <IonItem
                              lines="none"
                              className="input-item-labeled"
                            >
                              <IonLabel
                                className="fs-18 fw-600 mb-9 label-sm"
                                position="stacked"
                              >
                                {t("AADHAAR_NUMBER")}
                              </IonLabel>
                              <IonItem lines="none" className="input-item">
                                <IonInput
                                  class="d-flex label-input"
                                  placeholder=""
                                  {...registerAuto("aadhar", {
                                    required: {
                                      value: true,
                                      message: t("FIELD_REQUIRED"),
                                    },
                                    maxLength: {
                                      value: 12,
                                      message: t("LENGTH_GREATER").replace(
                                        "{value}",
                                        "12"
                                      ),
                                    },
                                    minLength: {
                                      value: 12,
                                      message: t("LENGTH_LESS").replace(
                                        "{value}",
                                        "12"
                                      ),
                                    },
                                  })}
                                ></IonInput>
                              </IonItem>
                              {formStateAuto.errors?.aadhar && (
                                <IonText color="danger">
                                  {formStateAuto.errors?.aadhar?.message}
                                </IonText>
                              )}
                            </IonItem>
                          </IonList>
                        </IonCol>
                      </IonRow>

                      {autoVerifyState.state === "otp-verification" && (
                        <IonRow>
                          <IonCol>
                            <IonList className="py-0">
                              <IonItem
                                lines="none"
                                className="input-item-labeled"
                              >
                                <IonLabel
                                  className="fs-18 fw-600 mb-9 label-sm"
                                  position="stacked"
                                >
                                  {t("PLEASE_ENTER_AADHAAR_OTP")}
                                </IonLabel>

                                <IonItem lines="none" className="input-item">
                                  <IonInput
                                    class="d-flex label-input"
                                    {...registerAuto("otp", {
                                      required: {
                                        value:
                                          autoVerifyState.state ===
                                          "otp-verification",
                                        message: t("FIELD_REQUIRED"),
                                      },
                                    })}
                                  ></IonInput>
                                </IonItem>
                              </IonItem>
                            </IonList>
                          </IonCol>
                        </IonRow>
                      )}

                      <IonRow className="">
                        <IonCol size="12" className="ion-text-center">
                          <ActyvButton
                            text={getAutoVerifyBtnText()}
                            isLoading={autoVerifyBtnDisabled()}
                            disabled={autoVerifyBtnDisabled()}
                          />
                        </IonCol>

                        <IonCol size="12" className="ion-text-center pt-0">
                          <IonButton
                            className="clear-btn-gray mt-0"
                            disabled={autoVerifyState.loading}
                            fill="clear"
                            onClick={enableManualVerification}
                          >
                            {t("AADHAAR_MANUAL_VERIFICATION")}
                          </IonButton>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </form>
                </IonCardContent>
              </IonCard>
            )}
            {/* OTP Verification end */}

            {/* main card edit success start */}

            {action === "details" && (
              <div className="details">
                <IonCard className="primary-card no-border br-8">
                  <IonCardContent className="card-content">
                    <IonGrid className="p-0">
                      <IonRow className="">
                        <IonCol size="auto" className="">
                          <h4 className="fs-18 fw-600">
                            {t("SELECT_AADHAAR_CARD")}
                          </h4>
                        </IonCol>
                      </IonRow>

                      <IonRow className="">
                        <IonCol size="12" className="">
                          <IonItem lines="none" className="input-item">
                            <IonSelect
                              interface="popover"
                              mode="md"
                              className="w-100 select-field"
                              value={selectedAadhar || null}
                              onIonChange={(e) => {
                                selectAadhar(e.detail.value);
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
                    </IonGrid>
                  </IonCardContent>
                </IonCard>
                <IonCard className="primary-card no-border br-8">
                  <IonCardContent className="card-content">
                    <IonGrid className="p-0">
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
                            onClick={enableEdit}
                            className="primary-color fs-18 fw-600 pr--0 pl--0"
                          >
                            {t("EDIT")}
                          </IonButton>
                        </IonCol>
                      </IonRow>
                      <IonRow>
                        <IonCol>
                          <h4 className="mb-0 fs-16 fw-600">
                            {t("AADHAAR_CARD_CAP")}
                          </h4>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                    <IonGrid className="certificate-wrapper">
                      <IonRow className="certificate-box ion-align-items-center">
                        {detailsObj.documents.map((item) => (
                          <IonCol size="6">
                            <div className="">
                              <FileDisplayComponent
                                uploadedFile={item}
                                showDelete={false}
                              ></FileDisplayComponent>
                            </div>
                          </IonCol>
                        ))}
                      </IonRow>

                      <DocumentStatusComponent colorClass={detailsObj.colorClass}
                        description={detailsObj.desc}
                        icon={detailsObj.icon}
                        statusText={detailsObj.statusText}
                        updatedOn={detailsObj.updatedOn}
                      />

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
                              <p className="mb-0 fs-10 dark">{t("AADHAAR_CARD_UPLOADED")}</p>
                            </div>
                          </div>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonCardContent>
                </IonCard>
                {/* main card edit success end */}

                <IonCard className="overflow-visible primary-card no-shadow border-1 br-8">
                  <IonCardContent className="">
                    <IonGrid>
                      <IonRow>
                        <IonCol size="auto">
                          <div className="inbox-profile">
                            <IonImg src="./img/profile.svg"></IonImg>
                          </div>
                        </IonCol>

                        <IonRow className="mb-9">
                          <IonCol className="">
                            <div>
                              <p className="fs-14 fw-400 fark">
                                {t("AADHAAR_NAME")}
                              </p>
                              <p className="fs-16 fw-600 fark">
                                {detailsObj?.data?.name}
                              </p>
                            </div>
                          </IonCol>
                        </IonRow>
                      </IonRow>

                      <IonRow className="">
                        <IonCol size="8" className="">
                          <div>
                            <p className="fs-14 fw-400">
                              {t("SON_OR_DAUGHTER_OF")}
                            </p>
                            <p className="fs-16 fw-600">
                              {detailsObj?.data?.careOf}
                            </p>
                          </div>
                        </IonCol>
                      </IonRow>

                      <IonRow>
                        <IonCol size="8" className="pl-0">
                          <IonRow>
                            <IonCol>
                              {" "}
                              <div>
                                <p className="fs-14 fw-400">
                                  {t("DATE_OF_BIRTH")}
                                </p>
                                <p className="fs-16 fw-600">
                                  {DateTimeUtils.displayDateV3(
                                    detailsObj?.data?.dob
                                  )}
                                </p>
                              </div>
                            </IonCol>
                          </IonRow>

                          <IonRow>
                            <IonCol>
                              <div>
                                <p className="fs-14 fw-400">{t("DISTRICT")}</p>
                                <p className="fs-16 fw-600">
                                  {detailsObj?.data?.district}
                                </p>
                              </div>
                            </IonCol>
                          </IonRow>

                          <IonRow>
                            <IonCol>
                              <div>
                                <p className="fs-14 fw-400">{t("STATE")}</p>
                                <p className="fs-16 fw-600">
                                  {detailsObj?.data?.state}
                                </p>
                              </div>
                            </IonCol>
                          </IonRow>

                          <IonRow>
                            <IonCol>
                              <div>
                                <p className="fs-14 fw-400">{t("ADDRESS")}</p>
                                <p className="fs-16 fw-600">
                                  {detailsObj?.data?.address}
                                </p>
                              </div>
                            </IonCol>
                          </IonRow>
                        </IonCol>
                        <IonCol size="4" className="pr-0">
                          <IonRow>
                            <IonCol>
                              <div>
                                <p className="fs-14 fw-400">{t("GENDER")}</p>
                                <p className="fs-16 fw-600">
                                  {detailsObj?.data?.gender}
                                </p>
                              </div>
                            </IonCol>
                          </IonRow>

                          <IonRow>
                            <IonCol>
                              <div>
                                <p className="fs-14 fw-400">
                                  {t("SUB_DISTRICT")}
                                </p>
                                <p className="fs-16 fw-600">
                                  {detailsObj?.data?.subDistrict}
                                </p>
                              </div>
                            </IonCol>
                          </IonRow>

                          <IonRow>
                            <IonCol>
                              <div>
                                <p className="fs-14 fw-400">{t("COUNTRY")}</p>
                                <p className="fs-16 fw-600">
                                  {detailsObj?.data?.country}
                                </p>
                              </div>
                            </IonCol>
                          </IonRow>

                          <IonRow>
                            <IonCol>
                              <div>
                                <p className="fs-14 fw-400">{t("PINCODE")}</p>
                                <p className="fs-16 fw-600">
                                  {detailsObj?.data?.pinCode}{" "}
                                </p>
                              </div>
                            </IonCol>
                          </IonRow>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonCardContent>
                </IonCard>
              </div>
            )}

            {
              (action === 'create' || action === 'edit') && (
                <>
                  <IonList className="list-transparent pr-20" lines="none">
                    <IonItem className="item-transparent">
                      <h4 className="fs-14 fw-700">{t("AADHAAR_INSTRUCTION")}</h4>
                    </IonItem>
                    <IonItem className="item-transparent pr-20">
                      <ul className="pl-20 mb-0">
                        <li className="fs-14 fw-400 mb-9">
                          {t("AADHAAR_INSTRUCTION_TEXT_1")} {getAllowedFiles()}{" "}
                          {t("FORMAT_ONLY")}.
                        </li>
                        <li className="fs-14 fw-400 mb-9">
                          {t("AADHAAR_INSTRUCTION_TEXT_2")}
                        </li>
                        <li className="fs-14 fw-400 mb-9">
                          {t("AADHAAR_INSTRUCTION_TEXT_3")}
                        </li>
                      </ul>
                    </IonItem>
                  </IonList>

                  <IonGrid className="">
                    <IonRow>
                      <IonCol size="4" className="">
                        <div className="img-formate-wrap d-flex ion-justify-content-center">
                          <IonImg
                            src="./img/partner-img/adhar-dont-1.svg"
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
                            src="./img/partner-img/adhar-dont-2.svg"
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
                            src="./img/partner-img/adhar-yes.svg"
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
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AadhaarVerification;
