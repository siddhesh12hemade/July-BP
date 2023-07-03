import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonImg,
  IonItem, IonList, IonPage, IonRow,
  IonSelect,
  IonSelectOption
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import ActyvButton from "../components/ActyvButton";
import FileDisplayComponent from "../components/FileDisplayComponent";
import Header from "../components/Header";
import Loader from "../components/Loader";
import { Constants } from "../utils/constants/constants";
import { IDocument, IFile, IPlatformConfigResponse, ISpan, ISpanResponse, IUploadAndSaveDocument, IUploadAndSaveDocumentResponse, UploadedFile, UploadObj } from "../utils/interfaces/DocumentVault.interface";
import { getBusinessPartnerPlatformConfig, getDocumentHistory, getDocumentSpan, uploadAndSaveBusinessDocument, uploadDoc } from "../utils/services/DocumentVault.Service";
import { useAppSelector } from "../utils/store/hooks";
import { selectCurrentBusinessPartnerId } from "../utils/store/user.slice";
import { DateTimeUtils } from "../utils/utils/DateTime.Utils";
import _ from 'lodash';
import moment from "moment";

const BankStatement: React.FC = () => {
  const SPANS = ["MONTHLY"];
  const [financialYears, setFinancialYears] = useState<string[]>();
  const [months, setMonths] = useState<ISpan[]>([]);
  const [qaurters, setQarters] = useState<ISpan[]>([]);
  const [monthsToDisplay, setMonthsToDisplay] = useState<ISpan[]>();
  const [quartersToDisplay, setQuartersToDisplay] = useState<ISpan[]>();
  const [currentSelectedFinancialYear, setCurrentSelectedFinancialYear] = useState<string>("");
  const [currentSelectedMonth, setCurrentSelectedMonth] = useState<ISpan>({ year: "", months: [""], financialYear: "" });
  const [currentSelectedQaurter, setCurrentSelectedQaurter] = useState<ISpan>({ year: "", months: [""], financialYear: "" });
  const [currentSpan, setCurrentSpan] = useState<string>(SPANS[0]);
  const [loading, setLoading] = useState(false);
  const currentBusinessPartnerId = useAppSelector<string>(selectCurrentBusinessPartnerId);
  const [allDocuments, setAllDocuments] = useState<IDocument[]>([]);
  const [uploadObj, setUploadObj] = useState<UploadObj>(null);
  const [action, setAction] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [totalFilesRequred, setTotalFilesRequred] = useState<number>();
  const [filesUploaded, setFilesUploaded] = useState<number>();

  const { t } = useTranslation();
  let history = useHistory();
  useEffect(() => {
    fetchData()
  }, [])

  const getMonthsToDisplay = (financialYear: string, months: ISpan[]) => {
    return months.filter(month => month.financialYear === financialYear);
  };

  const getQuartersToDisplay = (financialYear: string, quarters: ISpan[]) => {
    return quarters.filter(quarter => quarter.financialYear === financialYear);
  };

  const initDropDown = (spans: ISpanResponse) => {

    const { months, quarters, financialYears } = spans;
    const selectedFinancialYear = `${financialYears[0]}`;

    setFinancialYears(financialYears);
    setCurrentSelectedFinancialYear(selectedFinancialYear);

    setMonths(months);
    setMonthsToDisplay(getMonthsToDisplay(selectedFinancialYear, months));
    setCurrentSelectedMonth(months[0]);

    setQarters(quarters);
    setQuartersToDisplay(getQuartersToDisplay(selectedFinancialYear, quarters));
    setCurrentSelectedQaurter(quarters[0]);

  };

  const getDocTitle = (start, end) => {
    return start === end ? DateTimeUtils.convertFormat(start, DateTimeUtils.MONTH_YEAR_FORMAT) : `${DateTimeUtils.convertFormat(start, DateTimeUtils.MONTH_YEAR_FORMAT)} - ${DateTimeUtils.convertFormat(end, DateTimeUtils.MONTH_YEAR_FORMAT)}`
  }

  useEffect(() => {
    if (!currentSelectedFinancialYear)
      return
    const newMonthsToDisplay = getMonthsToDisplay(currentSelectedFinancialYear, months);
    const newSelectedMonth = newMonthsToDisplay[0];

    setMonthsToDisplay(newMonthsToDisplay);
    setCurrentSelectedMonth(newSelectedMonth);

    const newQuartersToDisplay = getQuartersToDisplay(currentSelectedFinancialYear, qaurters);
    const newSelectedQuarter = newQuartersToDisplay[0];

    setQuartersToDisplay(newQuartersToDisplay);
    setCurrentSelectedQaurter(newSelectedQuarter);

  }, [currentSelectedFinancialYear]);

  const setUploadedCount = (data: IPlatformConfigResponse) => {
    setTotalFilesRequred(data?.config?.documents?.BANK_STATEMENT?.lastNoOfMonthsRequired)
    let uploaded = data?.config?.documents?.BANK_STATEMENT?.status?.filter((obj) => obj.name === "UPLOAD" && obj.value === "COMPLETED")
    setFilesUploaded(_.size(uploaded))
  }
  const fetchData = async () => {
    setLoading(true)
    let spanRes = await getDocumentSpan(Constants.DOC_TYPE_BANK_STATEMENT)
    let res = spanRes.data
    initDropDown(res)

    let docApiRes = await getDocumentHistory(Constants.DOC_TYPE_BANK_STATEMENT, currentBusinessPartnerId);
    let docRes = docApiRes.data
    let apiRes = await getBusinessPartnerPlatformConfig(currentBusinessPartnerId)
    let configRes = apiRes.data
    setUploadedCount(configRes)

    const { statusCode, document } = docRes;
    if (statusCode === Constants.API_SUCCESS) {

      let documents: IDocument[] = document
      documents = documents.sort((obj1, obj2) => obj1.startDate > obj2.startDate ? 1 : -1)
      setAllDocuments(documents)
      if (_.size(documents))
        setAction('details')
      else
        setAction('create')

      let files: IFile[] = []

      for (const doc of documents) {
        let title = getDocTitle(doc.startDate, doc.endDate)
        let file: UploadedFile = doc.files?.find(file => file.type === "SELF")
        file.title = title
        file.startDate = doc.startDate
        file.endDate = doc.endDate
        files.push(file)
      }
      setUploadObj({ ...uploadObj, files: files })
    }
    setLoading(false)
  }

  const getMonthsDropdownDisplayName = (month: ISpan) => {
    return `${month.months}`;
  };

  const getQuartersDropdownDisplayName = (quarter: ISpan) => {
    return `${quarter.months[0]} - ${quarter.months[_.size(quarter.months) - 1]}`;
  };

  const checkIsMimeValid = (mime) => {
    return getMimeTypes().includes(mime)
  }

  const getMimeTypes = () => {
    var list = Constants.ALLOWED_BANK_STATEMENT_MIME.map((obj) => {
      return obj.mimeType
    })
    return list.join(",")
  }

  const getAllowedFiles = () => {
    var fileList = Constants.ALLOWED_BANK_STATEMENT_MIME.map((obj) => {
      return obj.displayValue
    })
    return fileList.join(", ")
  }

  const getMaxSizeDisplay = () => {
    return Constants.BANK_STMT_MAX_FILE_SIZE_MB
  }

  const isFileSizeValid = (size) => {
    let sizeInMb = size * Constants.MB_CONVERTER
    return sizeInMb > Constants.BANK_STMT_MAX_FILE_SIZE_MB

  }

  const saveDisabled = () => {
    return isSaving || uploadObj.loading;
  };

  const fileChangedHandler = (event) => {
    let file = event.target.files[0]
    let file_size = file.size;
    let mime = file.type;

    let isSizeValid = isFileSizeValid(file_size)
    let isMimeValid = checkIsMimeValid(mime)

    if (!isSizeValid) {
      toast.error(`size cannot be greater than ${Constants.BANK_STMT_MAX_FILE_SIZE_MB} MB`)
      event.value = "";
    }
    else if (!isMimeValid) {
      toast.error(mime + " not supported",)
      event.value = "";
    }
    else {
      beginUpload(file, mime)
    }

  };

  const beginUpload = async (file: any, mime) => {
    uploadObj.loading = true
    setUploadObj({ ...uploadObj })

    let apiRes = await uploadDoc(Constants.DOC_TYPE_BANK_STATEMENT, currentBusinessPartnerId, file)
    if (apiRes.status === Constants.API_SUCCESS) {
      let res = apiRes.data
      if (res && res.Key) {
        toast.success(t("CUSTOM_FILE_UPLOAD_SUCCESSFUL_ALERT"));
        uploadObj.loading = true

        let year = currentSpan === "MONTHLY" ? currentSelectedMonth.year : currentSelectedQaurter.year
        let months = currentSpan === "MONTHLY" ? currentSelectedMonth.months : currentSelectedQaurter.months
        let monthNoFrom = moment().month(months[0]).format("MM");
        let monthNoTo = moment().month(months[_.size(months) - 1]).format("MM");
        const from = `${year}-${monthNoFrom}`;
        const to = `${year}-${monthNoTo}`;
        const dateFormat = `YYYY-MMMM`;
        let title = getDocTitle(from+Constants.TIMESTAMP_EXT, to+Constants.TIMESTAMP_EXT);
        uploadObj.files = uploadObj.files.filter((obj) => obj.title !== title)

        let newFile: UploadedFile = {
          fileId: res.Key,
          fileType: mime,
          type: "SELF",
          title: title,
          startDate: DateTimeUtils.parseAndGetIso(from, dateFormat),
          endDate: DateTimeUtils.parseAndGetIso(to, dateFormat),
          isNew: true
        }
        uploadObj.files.push(newFile)
        setUploadObj({ ...uploadObj })
      } else {
        toast.error(t("FILE_UPLOAD_FAILED"));
      }
      uploadObj.loading = false
      setUploadObj({ ...uploadObj })
    }
    else {
      uploadObj.loading = false
      setUploadObj({ ...uploadObj })
      toast.error(t("FILE_UPLOAD_FAILED"));
    }

  }

  const cancelEdit = () => {
    history.goBack();
  }

  const enableEdit = () => {
    setAction("edit");
  }

  const generateRequest = (file: UploadedFile): IUploadAndSaveDocument => {

    return {
      files: [file],
      documentType: Constants.DOC_TYPE_BANK_STATEMENT,
      documentNo: "",
      data: {},
      startDate: file.startDate,
      endDate: file.endDate,
      businessPartnerId: currentBusinessPartnerId,
      personId: ""
    };
  };

  const onSubmit = async () => {
    setIsSaving(true)
    if (!_.size(uploadObj.files)) {
      toast.warning(t("UPLOAD_VALID_FILE"));
    }

    let responses: IUploadAndSaveDocumentResponse[] = []
    const newFiles = uploadObj.files.filter((obj) => obj.isNew)
    for (const file of newFiles) {
      const request = generateRequest(file);
      let apiRes = await uploadAndSaveBusinessDocument(request)
      let res = apiRes.data
      responses.push(res)
    }
    let isDocumentsSaved = responses.every(item => item.statusCode === Constants.API_SUCCESS);
    if (!isDocumentsSaved) {
      toast.error(t("FILE_UPLOAD_FAILED"));
    }
    else {
      await fetchData()
      setAction('details')
    }
    setIsSaving(false)
  }

  return (
    <IonPage>
      <Header />

      <IonContent fullscreen>
        {
          loading ? (<Loader />) : (
            <>
              <IonItem lines="none">
                <IonGrid className="pt-11">
                  <IonRow className="">
                    <p className="fs-12 fw-600">
                      {t("DOCUMENT_VAULT")} ::{" "}
                      <span className="pending-text underline ">
                        {t("BANK_STATEMENT")}
                      </span>
                    </p>
                  </IonRow>
                </IonGrid>
              </IonItem>

              <IonItem lines="none" className="pl--0 item-transparent mt-10 mb-25">
                <IonButton className="mr-6 h-auto" slot="start" fill="clear" onClick={() => history.goBack()}>
                  <IonImg src="./img/partner-img/back-button.svg"></IonImg>
                </IonButton>
                <div className="">
                  <h4 className="fs-20 fw-600">{t("BANK_STATEMENT")}</h4>
                  <p className="fs-14 fw-400">
                   {t("PROVIDE_THE_LATEST")} {totalFilesRequred} {t("MONTHS_BANK_STATEMENT")}
                  </p>
                </div>
              </IonItem>

              {/* upload return file start */}
              {
                (action === 'create' || action === 'edit') && (
                  <IonCard className="primary-card no-border br-8">
                    <IonCardContent className="card-content">
                      <IonGrid className="p-0">
                        <IonRow className="">
                          <IonCol size="auto" className="">
                            <h4 className="fs-18 fw-600">{t("FINANCIAL_YEAR")}</h4>
                          </IonCol>
                        </IonRow>

                        <IonRow className="">
                          <IonCol size="12" className="">
                            <IonItem lines="none" className="input-item">

                              <IonSelect
                                interface="popover"
                                value={currentSelectedFinancialYear}
                                onIonChange={(e) => {
                                  setCurrentSelectedFinancialYear(e.detail.value)
                                }}
                                mode="md"
                                placeholder={t("SELECT_YEAR")}
                                className="w-100 select-field"
                              >
                                {
                                  financialYears && financialYears.map((financialYear, index) => {
                                    return (
                                      <IonSelectOption key={index} value={`${financialYear}`}>
                                        {`${financialYear}`}
                                      </IonSelectOption>
                                    );
                                  })
                                }

                              </IonSelect>
                            </IonItem>
                          </IonCol>
                        </IonRow>

                        <IonRow className="">
                          <IonCol size="auto" className="">
                            <h4 className="fs-18 fw-600">{t("SPAN")}</h4>
                          </IonCol>
                        </IonRow>

                        <IonRow className="">
                          <IonCol size="12" className="">
                            <IonItem lines="none" className="input-item">
                              <IonSelect
                                value={currentSpan}
                                onIonChange={(e) => {
                                  setCurrentSpan(e.detail.value)
                                }}
                                interface="popover"
                                mode="md"
                                placeholder={t("SELECT_SPAN")}
                                className="w-100 select-field"
                              >
                                {
                                  SPANS && SPANS.map((spanName, index) => {
                                    return (
                                      <IonSelectOption key={index} value={spanName}>
                                        {t(spanName)}
                                      </IonSelectOption>
                                    );
                                  })
                                }
                              </IonSelect>
                            </IonItem>
                          </IonCol>
                        </IonRow>

                        {
                          currentSpan === "MONTHLY" && (
                            <>
                              <IonRow className="">
                                <IonCol size="auto" className="">
                                  <h4 className="fs-18 fw-600">{t("MONTH")}</h4>
                                </IonCol>
                              </IonRow>

                              <IonRow className="">
                                <IonCol size="12" className="">
                                  <IonItem lines="none" className="input-item">
                                    <IonSelect
                                      value={JSON.stringify(currentSelectedMonth)}
                                      onIonChange={(e) => {
                                        setCurrentSelectedMonth(JSON.parse(e.detail.value))
                                      }}
                                      interface="popover"
                                      mode="md"
                                      placeholder={t("SELECT_MONTH")}
                                      className="w-100 select-field"
                                    >
                                      {
                                        monthsToDisplay &&
                                        monthsToDisplay.map((month, index) => {
                                          return (
                                            <IonSelectOption key={index} value={JSON.stringify(month)}>
                                              {getMonthsDropdownDisplayName(month)}
                                            </IonSelectOption>
                                          );
                                        })
                                      }

                                    </IonSelect>
                                  </IonItem>
                                </IonCol>
                              </IonRow>
                            </>
                          )
                        }


                        {
                          currentSpan === "QUARTERLY" && (
                            <>
                              <IonRow className="">
                                <IonCol size="auto" className="">
                                  <h4 className="fs-18 fw-600">{t("QAURTER")}</h4>
                                </IonCol>
                              </IonRow>

                              <IonRow className="">
                                <IonCol size="12" className="">
                                  <IonItem lines="none" className="input-item">
                                    <IonSelect
                                      value={JSON.stringify(currentSelectedQaurter)}
                                      onIonChange={(e) => {
                                        setCurrentSelectedQaurter(JSON.parse(e.detail.value))
                                      }}
                                      interface="popover"
                                      mode="md"
                                      placeholder={t("SELECT_MONTH")}
                                      className="w-100 select-field"
                                    >
                                      {
                                        quartersToDisplay && quartersToDisplay.map((qaurter, index) => {
                                          return (
                                            <IonSelectOption key={index} value={JSON.stringify(qaurter)}>
                                              {getQuartersDropdownDisplayName(qaurter)}
                                            </IonSelectOption>
                                          );
                                        })
                                      }

                                    </IonSelect>
                                  </IonItem>
                                </IonCol>
                              </IonRow>
                            </>
                          )
                        }
                      </IonGrid>

                      <IonRow className="">
                        <IonCol size="auto" className="">
                          <h4 className="fs-18 fw-600">
                            {t("UPLOAD_DIGITAL_BANK_STATEMENT_FILES")}
                          </h4>
                        </IonCol>
                      </IonRow>

                      <IonGrid>
                        <IonRow className="mb-10">
                          <IonCol>
                            <div className="file-main-wrapper p-relative">
                              <div className="mb-9 choose-btn-wrp ion-text-center">
                                <IonButton className="fs-18 fw-600 square-btn">
                                  {t("CHOOSE_FILE")}
                                </IonButton>
                                <input className="fileupload" type="file" onChange={fileChangedHandler} accept={getMimeTypes()} />
                              </div>

                              <div className="file-size-wrap ion-text-center">
                                <h4 className="fs-14 fw-400">{t("FILE_SUPPORTED")}:{getAllowedFiles()}</h4>
                                <p className="fs-12 fw-400">{t("MAXIMUM")} {getMaxSizeDisplay()}{t("MB")}</p>
                              </div>
                            </div>
                          </IonCol>
                        </IonRow>

                        <IonRow className="pt-11">

                          {
                            uploadObj && uploadObj.files.map((obj) => (
                              <IonCol size="4" className="">
                                <FileDisplayComponent uploadedFile={obj} ></FileDisplayComponent>
                              </IonCol>
                            ))
                          }

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
                            <IonButton disabled={saveDisabled()} className="fs-14 fw-500 clear-btn-gray" fill="clear" onClick={cancelEdit}>
                              {t("CANCEL_CAP")}
                            </IonButton>
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </IonCardContent>
                  </IonCard>
                )
              }

              {/* upload return file end */}

              {/* document uploaded preview start */}
              {
                action === 'details' && (
                  <IonCard className="primary-card no-border br-8">
                    <IonCardContent className="card-content">
                      <IonGrid className="p-0">
                        <IonRow className="ion-align-items-center">
                          <IonCol size="auto">
                            <h4 className="fs-20 fw-600">{t("DOCUMENTS_UPLOADED")}</h4>
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

                     

                        <IonRow className="ion-justify-content-center">
                          {
                            uploadObj && uploadObj.files.map((obj) => (
                              <IonCol size="4" className="">
                                <FileDisplayComponent uploadedFile={obj} ></FileDisplayComponent>
                              </IonCol>
                            ))
                          }

                        </IonRow>
                      </IonGrid>
                    </IonCardContent>
                  </IonCard>
                )
              }
              {/* document uploaded preview end */}
              {
                (action === 'create' || action === 'edit') && (
                  <IonList className="list-transparent pr-20" lines="none">
              <IonItem className="item-transparent">
                <h4 className="fs-14 fw-700">
                  {t("BANK_STATEMENT_INSTRUCTION")}
                </h4>
              </IonItem>
              <IonItem className="item-transparent pr-20">
                <ul className="pl-20 mb-0">
                  <li className="fs-14 fw-400 mb-9">
                   {t("BANK_STATEMENT_TEXT_1")}
                  </li>
                  <li className="fs-14 fw-400 mb-9">
                   {t("BANK_STATEMENT_TEXT_2")}
                  </li>
                </ul>
              </IonItem>
            </IonList>
                )
              }
            </>
          )
        }

      </IonContent>


    </IonPage>
  );
};

export default BankStatement;
