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
  IonList,
  IonPage,
  IonRow,
  IonSpinner,
  IonText,
} from "@ionic/react";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import ActyvButton from "../components/ActyvButton";
import FileDisplayComponent from "../components/FileDisplayComponent";
import Header from "../components/Header";
import Loader from "../components/Loader";
import ModalUI from '../components/Modal'
import { Constants } from "../utils/constants/constants";
import {
  IDocument,
  IFile,
  IUploadAndSaveDocument,
} from "../utils/interfaces/DocumentVault.interface";
import {
  getDocumentHistory,
  uploadAndSaveBusinessDocument,
  initiateOtpUdhyam,
  verifyOtpUdhyam,
  uploadDoc,
} from "../utils/services/DocumentVault.Service";
import { useAppSelector } from "../utils/store/hooks";
import { selectCurrentBusinessPartnerId } from "../utils/store/user.slice";
import { ValidateUtils } from "../utils/utils/Validate.Utils";

const UdyamVerification: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [verifyModal, setVerifyModal] = useState(false)
  const [optInitiated, setOptInitiated] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false);
  const [verificationLoader, setVerificationLoader] = useState(false)
  const [udhyamOtpVerified, setUdhyamOtpVerified] = useState(false);
  const [isValidUdyam, setIsValidUdyam] = useState(false)
  const [activeDocument, setActiveDocument] = useState<IDocument>();
  const currentBusinessPartnerId = useAppSelector<string>(
    selectCurrentBusinessPartnerId
  );
  const [action, setAction] = useState("");
  const { t } = useTranslation();
  const [uploadObj, setUploadObj] = useState<{
    file?: IFile;
    loading: boolean;
  }>({
    loading: false,
  });
  const { register, handleSubmit, formState, setValue } = useForm({
    mode: "onChange",
    defaultValues: { udyam: "", phoneNumber: "", otp: "" },
  });
  let history = useHistory();

  useEffect(() => {
    fetchData();

    
  }, []);

  useEffect(() => {
    if(!verifyModal && !udhyamOtpVerified) {

      setOptInitiated(false)

    }
  },[verifyModal, udhyamOtpVerified])

  useEffect(() => {
    if(formState.errors?.udyam) {
      toast.error('Please enter valid udyam number')
    }
  },[formState.errors?.udyam])

  const getMimeTypes = () => {
    var list = Constants.ALLOWED_UDYAM_MIMES.map((obj) => {
      return obj.mimeType;
    });
    return list.join(",");
  };

  const isFileSizeValid = (size) => {
    let sizeInMb = size * Constants.MB_CONVERTER;
    return sizeInMb > Constants.UDYAM_CERTIFICATE_MAX_FILE_SIZE_MB;
  };
  const checkIsMimeValid = (mime) => {
    return getMimeTypes().includes(mime);
  };

  const getAllowedFiles = () => {
    var fileList = Constants.ALLOWED_UDYAM_MIMES.map((obj) => {
      return obj.displayValue;
    });
    return fileList.join(", ");
  };

  const fileChangedHandler = (event) => {
    let file = event.target.files[0];
    let file_size = file.size;
    let mime = file.type;

    let isSizeValid = isFileSizeValid(file_size);
    let isMimeValid = checkIsMimeValid(mime);

    if (!isSizeValid) {
      toast.error(
        `size cannot be greater than ${Constants.UDYAM_CERTIFICATE_MAX_FILE_SIZE_MB} MB`
      );
      event.value = "";
    } else if (!isMimeValid) {
      toast.error(mime + " not supported");
      event.value = "";
    } else {
      beginUpload(file, mime);
    }
  };

  const beginUpload = async (file: any, mime) => {
    uploadObj.loading = true;
    setUploadObj({ ...uploadObj });

    let apiRes = await uploadDoc(
      Constants.DOC_TYPE_UDHYAM,
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
          title: "Udyam certificate",
        };
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
  const fetchData = async () => {
    setLoading(true);
    let docApiRes = await getDocumentHistory(
      Constants.DOC_TYPE_UDHYAM,
      currentBusinessPartnerId
    );
    let docRes = docApiRes.data;

    const { statusCode, document } = docRes;
    if (statusCode === Constants.API_SUCCESS) {
      let documents: IDocument[] = document;

      if (_.size(documents)) setAction("details");
      else setAction("create");

      if (_.size(documents)) {
        let doc = documents[0];

        setValue("udyam", doc.documentNo);
        setActiveDocument(doc);
        let file: IFile = documents[0].files[0];
        file.title = "Udhyam Certificate";
        setUploadObj({ ...uploadObj, file });
      }
    }
    setLoading(false);
  };

  const enableEdit = () => {
    setAction("edit");
    setUdhyamOtpVerified(false)
  };

  const cancelEdit = () => {
    setAction("details");
  };

  const updateVerifyModel = () => {
      setVerifyModal(!verifyModal)
  }

  const isSaveDisabled = () => {
    if (action === "create") {
      if (!uploadObj.file) return true;
    }
    return uploadObj.loading || submitLoading || !udhyamOtpVerified;
  };

  const generateRequest = (file: IFile, udyamNo): IUploadAndSaveDocument => {
    return {
      files: [file],
      documentType: Constants.DOC_TYPE_UDHYAM,
      documentNo: udyamNo,
      startDate: "",
      endDate: "",
      businessPartnerId: currentBusinessPartnerId,
      data: {},
      personId: "",
    };
  };
  const onSubmit = async (data) => {
    setSubmitLoading(true);

    const request = generateRequest(uploadObj.file, data.udyam);
    let apiRes = await uploadAndSaveBusinessDocument({...request, isVerified: udhyamOtpVerified, status: []});
    let res = apiRes.data;

    if (res.statusCode === Constants.API_SUCCESS) {
      await fetchData();
      setAction("details");
    } else {
      toast.error(t("FILE_UPLOAD_FAILED"));
    }
    setSubmitLoading(false);
  };
  const onErr = async (err) => {};

  const onVerifyInitiate = async (data) => {
    
    setVerificationLoader(true)

    const {phoneNumber = '', udyam = '',} = data

    if(_.size(phoneNumber.trim()) !== Constants.VALID_PHONE) {
      setVerificationLoader(false)
      return toast.info('Please enter valid phone number')
    }

    let apiRes = await initiateOtpUdhyam({
      phoneNumber,
      udyamNumber: udyam
    });
    let res = apiRes.data;

    if(res.statusCode === Constants.OTP_SENT) {
      setOptInitiated(true)
      setValue("otp",'')
      toast.success('Otp sent successfully.')
    } else {
      toast.error('Entered Udyam Registration Number is not registered OR Enter correct detail.')
    }
    setVerificationLoader(false)
  }

  const onVerifyOtp = async(data) => {
    setVerificationLoader(true)
    const { udyam = '', otp = ''} = data
    if(otp.trim() === '') {
      setVerificationLoader(false)
      return toast.info('Please enter valid otp')
    }
    const request = generateRequest(uploadObj.file, data.udyam);
      
    let otpVerifyRes = await verifyOtpUdhyam({
      udyamData: {
        udyamNumber: udyam,
        otp
      },
      uploadAndSaveDocumentRequest: {
        ...request
      }
    })

    let res = otpVerifyRes.data;

    // res.statusCode === Constants.VERIFIED
    if(res.statusCode === Constants.VERIFIED) {
      setOptInitiated(false)
      setVerifyModal(false)
      setUdhyamOtpVerified(true)
    } else {
      toast.error('Invalid Otp')
    }

    setVerificationLoader(false)
  }

  return (
    <IonPage>
      <Header />
      <IonContent fullscreen>
        {loading ? (
          <Loader />
        ) : (
          <form onSubmit={handleSubmit(onSubmit, onErr)}>
            <IonItem lines="none">
              <IonGrid className="pt-11">
                <IonRow className="">
                  <p className="fs-12 fw-600">
                    {t("DOCUMENT_VAULT")} ::{" "}
                    <span className="pending-text underline ">
                      {t("UDYAM")}
                    </span>
                  </p>
                </IonRow>
              </IonGrid>
            </IonItem>

            <IonItem
              lines="none"
              className="pl--0 item-transparent mt-10 mb-25"
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
                <h4 className="fs-20 fw-600">{t("UDYAM")}</h4>
                <p className="fs-14 fw-400">{t("UDYAM_UPLOAD_NOTE")}</p>
              </div>
            </IonItem>
            {/* main card end */}

            {/* upload */}
            {(action === "create" || action === "edit") && (
              <IonCard className="primary-card no-border br-8">
                <IonCardContent className="card-content">
                  <IonGrid className="p-0">
                    <IonRow className="">
                      <IonCol size="auto" className="">
                        <h4 className="fs-18 fw-600">
                          {t("UDYAM_INPUT_HEADER")}
                        </h4>
                      </IonCol>
                    </IonRow>

                    <IonRow className="mb-10">
                      <IonCol size="11" className="">
                        <IonItem lines="none" className="input-item">
                          <IonInput
                            placeholder={t("UDYAM_PLACEHOLDER")}
                            type="text"
                            {...register("udyam", {
                              required: {
                                value: true,
                                message: t("FIELD_REQUIRED"),
                              },
                              pattern: {
                                value: ValidateUtils.UDYAM_REGEX,
                                message: t("VALID_UDYAM_INPUT"),
                              },
                              disabled: udhyamOtpVerified
                            })}
                          ></IonInput>
                        </IonItem>
                        {formState.errors?.udyam && (
                          <IonText color="danger">
                            {formState.errors?.udyam?.message}
                          </IonText>
                        )}
                      </IonCol>
                    </IonRow>
                    <ModalUI open={verifyModal} updateOpen={setVerifyModal} headerTitle={t("VERIFY_UDHYAM")} submitText={t("PROCEED")} >
                    
                    <IonRow className="mb-10">
                      <IonCol size="11" className="">
                        <IonItem lines="none" className="input-item">
                          <IonInput
                            placeholder="Phone number"
                            type="number"
                            {...register("phoneNumber", {
                              
                            })}
                          ></IonInput>
                        </IonItem>
                        
                      </IonCol>
                    </IonRow>
                    {optInitiated && <IonRow className="mb-10">
                      <IonCol size="11" className="">
                        <IonItem lines="none" className="input-item">
                          <IonInput
                            placeholder="OTP"
                            type="number"
                            {...register("otp", {
                              
                            })}
                          ></IonInput>
                        </IonItem>
                        
                      </IonCol>
                    </IonRow>}
                    <IonRow className="mb-10">
                      <IonCol size="11" className="">
                      <IonCol size="6" className="ion-text-center">
                          <IonButton
                            disabled={verificationLoader}
                            className="clear-btn-verify"
                            fill="clear"
                            onClick={handleSubmit(optInitiated ? onVerifyOtp : onVerifyInitiate, onErr)}
                          >
                            {verificationLoader ? <Loader isloading={true} enableMsg={false}/> : t("PROCEED")}
                          </IonButton>
                        </IonCol>
                        
                      </IonCol>
                    </IonRow>
                    </ModalUI>
                     
                    <IonRow className="mb-10">
                      <IonCol size="11" className="">
                      <IonCol size="6" className="ion-text-center">
                          <IonButton
                            disabled={udhyamOtpVerified}
                            className="clear-btn-verify"
                            fill="clear"
                            onClick={updateVerifyModel}
                          >
                            {udhyamOtpVerified ? t("EVERIFY_DONE") : t("VERIFY_WITH_OTP")}
                          </IonButton>
                        </IonCol>
                        
                          
                        
                      </IonCol>
                    </IonRow>

                    <IonRow>
                      <IonCol>
                        <h4 className="mb-0 fs-16 fw-600">
                          {t("UPLOAD_UDYAM_FILES")}
                        </h4>
                      </IonCol>
                    </IonRow>
                  </IonGrid>

                  <IonGrid>
                    {!uploadObj.loading && (
                      <IonRow className="mb-25">
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
                                {t("MAXIMUM")}{" "}
                                {Constants.UDYAM_CERTIFICATE_MAX_FILE_SIZE_MB}
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
                    <IonRow className="ion-justify-content-left">
                      <IonCol size="4" className="">
                        {uploadObj?.file && (
                          <FileDisplayComponent
                            uploadedFile={uploadObj.file}
                          ></FileDisplayComponent>
                        )}
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
                          disabled={isSaveDisabled()}
                        ></ActyvButton>
                      </IonCol>
                      {action === "edit" && (
                        <IonCol size="6" className="ion-text-center">
                          <IonButton
                            disabled={isSaveDisabled()}
                            className="clear-btn-gray"
                            fill="clear"
                            onClick={cancelEdit}
                          >
                            {t("CANCEL_CAP")}
                          </IonButton>
                        </IonCol>
                      )}
                    </IonRow>
                  </IonGrid>
                </IonCardContent>
              </IonCard>
            )}
            {/* details card start */}
            {action === "details" && (
              <>
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
                            className="primary-color fs-18 fw-600 pr--0 pl--0"
                            onClick={enableEdit}
                          >
                            {t("EDIT")}
                          </IonButton>
                        </IonCol>
                      </IonRow>

                      <IonRow>
                        <IonCol className="pt-0">
                          <h4 className="mb-0 fs-12 fw-600">
                            {t("UDYAM_UPLOAD")}
                          </h4>
                        </IonCol>
                      </IonRow>
                    </IonGrid>

                    <IonGrid className="uploaded-wrapper">
                      <IonRow className="ion-justify-content-center">
                        <IonCol size="10" className="">
                          <FileDisplayComponent
                            uploadedFile={activeDocument.files[0]}
                            showDelete={false}
                          ></FileDisplayComponent>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonCardContent>
                </IonCard>
                <IonCard className="primary-card no-border br-8">
                  <IonCardContent className="card-content">
                    <IonGrid>
                      <IonRow>
                        <IonCol>
                          <p className="fs-18 fw-600">
                            {t("UDYAM_CERTIFICATE_DETAILS")}
                          </p>
                        </IonCol>
                      </IonRow>

                      <IonRow>
                        <IonCol>
                          <IonItem
                            className="ion-align-items-start pl--0"
                            lines="none"
                          >
                            <IonImg
                              src="./img/partner-img/file-icon.svg"
                              className=" mr-10"
                            ></IonImg>
                            <div>
                              <p className="fs-14 fw-400">
                                {t("UDYAM_NUMBER")}
                              </p>
                              <p className="fs-14 fw-600">
                                {activeDocument.documentNo}
                              </p>
                            </div>
                          </IonItem>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonCardContent>
                </IonCard>
              </>
            )}
            {/* details card start */}
            {
              (action === 'create' || action === 'edit') && (
                <>
                <IonList className="list-transparent pr-20" lines="none">
              <IonItem className="item-transparent">
                <h4 className="fs-14 fw-700">{t("UDYAM_INSTRUCTION")}</h4>
              </IonItem>
              <IonItem className="item-transparent pr-20">
                <ul className="pl-20 mb-0">
                  <li className="fs-14 fw-400 mb-9">{t("UDYAM_TEXT_1")}</li>
                  <li className="fs-14 fw-400 mb-9">{t("UDYAM_TEXT_2")}</li>
                  <li className="fs-14 fw-400 mb-0">{t("UDYAM_TEXT_3")}</li>
                </ul>
              </IonItem>
            </IonList>

            <IonGrid className="">
              <IonRow>
                <IonCol size="4" className="">
                  <div className="img-formate-wrap d-flex ion-justify-content-center">
                    <IonImg
                      src="./img/partner-img/udyam-i-strech.svg"
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
                      src="./img/partner-img/udyam-i-dark.svg"
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
                      src="./img/partner-img/udyam-i-correct.svg"
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
          </form>
        )}
      </IonContent>
    </IonPage>
  );
};

export default UdyamVerification;
