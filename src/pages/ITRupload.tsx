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
  IonPage, IonRow,
  IonSelect,
  IonSelectOption,
  IonSpinner
} from "@ionic/react";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import ActyvButton from "../components/ActyvButton";
import FileDisplayComponent from "../components/FileDisplayComponent";
import Header from "../components/Header";
import Loader from "../components/Loader";
import {
  Constants
} from "../utils/constants/constants";
import {
  IDocument,
  IFile,
  IUploadAndSaveDocument,
  IUploadAndSaveDocumentResponse
} from "../utils/interfaces/DocumentVault.interface";
import {
  getDocumentHistory,
  getDocumentSpan,
  uploadAndSaveBusinessDocument,
  uploadDoc
} from "../utils/services/DocumentVault.Service";
import { fetchBusinessPartnerGstin } from "../utils/services/Pan.Service";
import { useAppSelector } from "../utils/store/hooks";
import { selectCurrentBusinessPartnerId } from "../utils/store/user.slice";
import { DateTimeUtils } from "../utils/utils/DateTime.Utils";

interface UploadedFile extends IFile {
  startDate?: string;
  endDate?: string;
}
interface UploadObj {
  files: UploadedFile[];
  loading: boolean;
}

const ItrUpload: React.FC = () => {
  const [assessmentYears, setAssessmentYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>();
  const [loading, setLoading] = useState(false);
  const currentBusinessPartnerId = useAppSelector<string>(
    selectCurrentBusinessPartnerId
  );
  const [allDocuments, setAllDocuments] = useState<IDocument[]>([]);
  const [uploadObj, setUploadObj] = useState<UploadObj>(null);
  const [action, setAction] = useState("");
  const [panNo, setPanNo] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useTranslation()
  let history = useHistory();

  useEffect(() => {
    fetchData();
  }, []);

  const generateRequest = (file: UploadedFile): IUploadAndSaveDocument => {
    return {
      files: [file],
      documentType: Constants.DOC_TYPE_ITR,
      documentNo: panNo,
      data: {},
      startDate: file.startDate,
      endDate: file.endDate,
      businessPartnerId: currentBusinessPartnerId,
      personId: "",
    };
  };

  const fetchData = async () => {
    setLoading(true);
    let apiRes = await fetchBusinessPartnerGstin(currentBusinessPartnerId);
    let gstRes = apiRes.data
    let panNo = `${gstRes.gstin}`.substring(2, 10);
    setPanNo(panNo);
    let spanRes = await getDocumentSpan(Constants.DOC_TYPE_ITR);
    let res = spanRes.data
    const assessmentYears = res.assessmentYears;
    const selectedAssessmentYear = `${assessmentYears[0]}`;

    let docApiRes = await getDocumentHistory(
      Constants.DOC_TYPE_ITR,
      currentBusinessPartnerId
    );
    let docRes = docApiRes.data
    setAssessmentYears(assessmentYears);
    setSelectedYear(selectedAssessmentYear);
    const { statusCode, document } = docRes;
    if (statusCode === Constants.API_SUCCESS) {
      let documents: IDocument[] = document;
      setAllDocuments(documents);
      if (_.size(documents)) setAction("details");
      else setAction("create");

      let files: IFile[] = [];
      for (const doc of documents) {
        let file: UploadedFile = doc.files[0];
        file.title = `${DateTimeUtils.getYear(doc.startDate)} - ${DateTimeUtils.getYear(doc.endDate)}`;
        file.startDate = doc.startDate;
        file.endDate = doc.endDate;
        files.push(file);
      }
      setUploadObj({ ...uploadObj, files: files });
    }
    setLoading(false);
  };

  const getMimeTypes = () => {
    var list = Constants.ALLOWED_ITR_MIME.map((obj) => {
      return obj.mimeType;
    });
    return list.join(",");
  };

  const getAllowedFiles = () => {
    var fileList = Constants.ALLOWED_ITR_MIME.map((obj) => {
      return obj.displayValue;
    });
    return fileList.join(", ");
  };

  const getMaxSizeDisplay = () => {
    return Constants.ITR_MAX_FILE_SIZE_MB;
  };

  const isFileSizeValid = (size) => {
    let sizeInMb = size * Constants.MB_CONVERTER;
    return sizeInMb > Constants.ITR_MAX_FILE_SIZE_MB;
  };

  const getUploadedCount = () => {
    return _.size(allDocuments);
  };

  const getTotalDocumentsRequired = () => {
    return _.size(assessmentYears);
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
      toast.error(`size cannot be greater than ${Constants.ITR_MAX_FILE_SIZE_MB} MB`);
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
      let apiRes = await uploadDoc(Constants.DOC_TYPE_ITR, currentBusinessPartnerId, file);
      if (apiRes.status === Constants.API_SUCCESS) {
        let res = apiRes.data
      if (res && res.Key) {
        toast.success(t("CUSTOM_FILE_UPLOAD_SUCCESSFUL_ALERT"));
        uploadObj.loading = true;

        uploadObj.files = uploadObj.files.filter(
          (obj) => obj.title !== selectedYear
        );
        let years = selectedYear.split("-");
        let newFile: UploadedFile = {
          fileId: res.Key,
          fileType: mime,
          type: "SELF",
          title: selectedYear,
          startDate: DateTimeUtils.parseAndGetIso(years[0], DateTimeUtils.YEAR_FORMAT),
          endDate: DateTimeUtils.parseAndGetIso(years[1], DateTimeUtils.YEAR_FORMAT) 
        };
        uploadObj.files.push(newFile);
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

  const enableEdit = () => {
    setAction("edit");
  };

  const cancelEdit = () => {
    history.goBack()
  };

  const saveDisabled = () => {
    return isSaving || uploadObj.loading || !_.size(uploadObj.files);
  };

  const onSubmit = async () => {
    setIsSaving(true);
    if (!_.size(uploadObj.files)) {
      toast.error(t("UPLOAD_VALID_FILE"));
    }

    let responses: IUploadAndSaveDocumentResponse[] = [];
    for (const file of uploadObj.files) {
      const request = generateRequest(file);
      let apiRes = await uploadAndSaveBusinessDocument(request);
      let res = apiRes.data
      responses.push(res);
    }
    let isDocumentsSaved = responses.every(
      (item) => item.statusCode === "SUCCESS"
    );
    if (!isDocumentsSaved) {
      toast.error(t("FILE_UPLOAD_FAILED"));
    } else {
      await fetchData();
      setAction("details");
    }
    setIsSaving(false);
  };

  return (
    <IonPage>
      <Header />


      <IonContent fullscreen>
        {loading ? (
          <Loader />
        ) : (
          <>
            <IonItem lines="none">
              <IonGrid className="pt-11">
                <IonRow className="">
                  <p className="fs-12 fw-600">
                    {t("DOCUMENT_VAULT")} ::{" "}
                    <span className="pending-text underline ">{t("ITR_SHORT")}</span>
                  </p>
                </IonRow>
              </IonGrid>
            </IonItem>

            <IonItem lines="none" className="pl--0 item-transparent mt-10 mb-25">
              <IonButton
                className="mr-6 h-auto"
                slot="start"
                fill="clear"
                onClick={() => history.goBack()}
              >
                <IonImg src="./img/partner-img/back-button.svg"></IonImg>
              </IonButton>
              <div className="">
                <h4 className="fs-20 fw-600">{t("ITR")}</h4>
                <p className="fs-14 fw-400">
                  {t("ITR_UPLOAD_NOTE")}
                </p>
              </div>
            </IonItem>

            {/* upload pan card start */}
            {(action === "create" || action === "edit") && (
              <IonCard className="primary-card no-border br-8">
                <IonCardContent className="card-content">
                  <IonGrid className="p-0">
                    <IonRow className="">
                      <IonCol size="12" className="">
                        <h4 className="mb-9 fs-18 fw-600">{t("ASSESSMENT_YEAR")}</h4>

                        <IonItem lines="none" className="input-item">
                          <IonSelect
                            interface="popover"
                            mode="md"
                            placeholder={t("SELECT_FINANCIAL_YEAR")}
                            className="w-100 select-field"
                            value={selectedYear || null}
                            onIonChange={(e) => {
                              setSelectedYear(e.detail.value);
                            }}
                          >
                            {assessmentYears.map((item, index) => (
                              <IonSelectOption key={index} value={`${item}`}>
                                {item}
                              </IonSelectOption>
                            ))}
                          </IonSelect>
                        </IonItem>
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
                                name="file"
                                onChange={fileChangedHandler}
                                accept={getMimeTypes()}
                              />
                            </div>

                            <div className="file-size-wrap ion-text-center">
                              <p className="fs-14 fw-400 mb-0">
                                {t("FILE_SUPPORTED")}: {getAllowedFiles()}
                              </p>
                              <p className="fs-12 fw-400">
                                {t("MAXIMUM")} {getMaxSizeDisplay()}{t("MB")}
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

                    <IonRow className="pt-11">
                      {uploadObj &&
                        uploadObj.files.map((obj,index) => (
                          <IonCol size="4" className="">
                            <FileDisplayComponent
                              uploadedFile={obj}
                              showDelete={true}
                              onDelete={
                                ()=>{                                  
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
                      <ActyvButton onClick={onSubmit} text={t("SAVE")} isLoading={isSaving} disabled={saveDisabled()}></ActyvButton>
                        
                      </IonCol>
                      
                        <IonCol size="6" className="ion-text-center">
                          <IonButton
                            className="Fs-14 fw-500 clear-btn-gray"
                            fill="clear"
                            disabled={saveDisabled()}
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
            {/* upload pan card end */}

            {/* document uploaded preview start */}
            {action === "details" && (
              <IonCard className="primary-card no-border br-8">
                <IonCardContent className="card-content">
                  <IonGrid className="p-0">
                    <IonRow className="ion-align-items-center">
                      <IonCol size="auto">
                        <h4 className="fs-18 fw-600">{t("DOCUMENTS_UPLOADED")}</h4>
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

                    <IonRow className="my-7 ion-justify-content-center">
                      <IonCol className="" size="auto">
                        <div className="d-flex ion-align-items-center mr-6">
                          <h4 className="fs-12 fw-600">{t("STATUS")}:</h4>
                          <div className="status-box-inbox">
                            <span className="fw-700 fs-12 dark">
                              {getUploadedCount()}
                            </span>
                            /
                            <span className="fs-12 fw-400">
                              {getTotalDocumentsRequired()}
                            </span>
                          </div>
                          <div>
                            <p>{t("ITR_UPLOADED")}</p>
                          </div>
                        </div>
                      </IonCol>
                    </IonRow>

                    <IonRow className="">
                      {uploadObj.files.map((obj) => (
                        <IonCol size="6">
                          <FileDisplayComponent
                            showDelete={false}
                            uploadedFile={obj}
                          ></FileDisplayComponent>
                        </IonCol>
                      ))}
                    </IonRow>
                  </IonGrid>
                </IonCardContent>
              </IonCard>
            )}
            {/* document uploaded preview end */}

           {
            (action === 'create' || action === 'edit') && (
              <>
               <IonList className="list-transparent pr-20" lines="none">
              <IonItem className="item-transparent">
                <h4 className="fs-14 fw-700">
                  {t("ITR_INSTRUCTION")}
                </h4>
              </IonItem>
              <IonItem className="item-transparent pr-20">
                <ul className="pl-20 mb-0">
                  <li className="fs-14 fw-400 mb-9">
                    {t("ITR_TEXT_1")}
                  </li>
                  <li className="fs-14 fw-400 mb-9">
                  {t("ITR_TEXT_2")}
                  </li>
                  <li className="fs-14 fw-400 mb-9">
                  {t("ITR_TEXT_3")}
                  </li>
                  <li className="fs-14 fw-400 mb-0">{t("ITR_TEXT_4")}</li>
                </ul>
              </IonItem>
            </IonList>

            <IonGrid className="">
              <IonRow>
                <IonCol size="4" className="">
                  <div className="img-formate-wrap d-flex ion-justify-content-center">
                    <IonImg
                      src="./img/partner-img/itr-dont-1.svg"
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
                      src="./img/partner-img/itr-dont-2.svg"
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
                      src="./img/partner-img/itr-yes.svg"
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
          </>
        )}
          
        </IonContent>

    </IonPage>
  );
};

export default ItrUpload;
