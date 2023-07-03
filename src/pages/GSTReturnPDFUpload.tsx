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
import {
  IDocument,
  IFile,
  IPlatformConfigResponse,
  ISpan,
  ISpanResponse,
  IUploadAndSaveDocument,
  IUploadAndSaveDocumentResponse,
  UploadedFile,
  UploadObj
} from "../utils/interfaces/DocumentVault.interface";
import {
  getBusinessPartnerPlatformConfig,
  getDocumentHistory,
  getDocumentSpan,
  uploadAndSaveBusinessDocument,
  uploadDoc
} from "../utils/services/DocumentVault.Service";
import { useAppSelector } from "../utils/store/hooks";
import { selectCurrentBusinessPartnerId } from "../utils/store/user.slice";
import { DateTimeUtils } from "../utils/utils/DateTime.Utils";
import _ from "lodash";
import * as userSlice from "../utils/store/user.slice";

const GSTReturnPDFUpload: React.FC = () => {
  const SPANS = ["MONTHLY", "QUARTERLY"];
  const currentUser = useAppSelector(userSlice.selectUserState);
  const [financialYears, setFinancialYears] = useState<string[]>();
  const [months, setMonths] = useState<ISpan[]>([]);
  const [qaurters, setQarters] = useState<ISpan[]>([]);

  const [monthsToDisplay, setMonthsToDisplay] = useState<ISpan[]>();
  const [quartersToDisplay, setQuartersToDisplay] = useState<ISpan[]>();

  const [currentSelectedFinancialYear, setCurrentSelectedFinancialYear] =
    useState<string>("");
  const [currentSelectedMonth, setCurrentSelectedMonth] = useState<ISpan>({
    year: "",
    months: [""],
    financialYear: "",
  });
  const [currentSelectedQaurter, setCurrentSelectedQaurter] = useState<ISpan>({
    year: "",
    months: [""],
    financialYear: "",
  });
  const [currentSpan, setCurrentSpan] = useState<string>(SPANS[0]);
  const [loading, setLoading] = useState(false);
  const currentBusinessPartnerId = useAppSelector<string>(
    selectCurrentBusinessPartnerId
  );
  const [allDocuments, setAllDocuments] = useState<IDocument[]>([]);
  const [uploadObj, setUploadObj] = useState<UploadObj>(null);
  const [action, setAction] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [totalFilesRequred, setTotalFilesRequred] = useState<number>();
  const [filesUploaded, setFilesUploaded] = useState<number>();

  const { t } = useTranslation();
  let history = useHistory();
  useEffect(() => {
    fetchData();
  }, []);

  const getMonthsToDisplay = (financialYear: string, months: ISpan[]) => {
    return months.filter((month) => month.financialYear === financialYear);
  };

  const getQuartersToDisplay = (financialYear: string, quarters: ISpan[]) => {
    return quarters.filter(
      (quarter) => quarter.financialYear === financialYear
    );
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
    return start === end
      ? DateTimeUtils.convertFormat(start, DateTimeUtils.MONTH_YEAR_FORMAT)
      : `${DateTimeUtils.convertFormat(
          start,
          DateTimeUtils.MONTH_YEAR_FORMAT
        )} - ${DateTimeUtils.convertFormat(
          end,
          DateTimeUtils.MONTH_YEAR_FORMAT
        )}`;
  };

  useEffect(() => {
    if (!currentSelectedFinancialYear) return;
    const newMonthsToDisplay = getMonthsToDisplay(
      currentSelectedFinancialYear,
      months
    );
    const newSelectedMonth = newMonthsToDisplay[0];

    setMonthsToDisplay(newMonthsToDisplay);
    setCurrentSelectedMonth(newSelectedMonth);

    const newQuartersToDisplay = getQuartersToDisplay(
      currentSelectedFinancialYear,
      qaurters
    );
    const newSelectedQuarter = newQuartersToDisplay[0];

    setQuartersToDisplay(newQuartersToDisplay);
    setCurrentSelectedQaurter(newSelectedQuarter);
  }, [currentSelectedFinancialYear]);

  const setUploadedCount = (data: IPlatformConfigResponse, uploadedDocs:any) => {
    setTotalFilesRequred(
      data?.config?.documents?.GSTR_FILES?.lastNoOfMonthsRequired
    );

    let uploaded = uploadedDocs?.document;
    setFilesUploaded(_.size(uploaded));
  };
  const fetchData = async () => {
    setLoading(true);
    let spanRes = await getDocumentSpan(Constants.DOC_TYPE_GSTR_FILES);
    let res = spanRes.data;
    initDropDown(res);

    let docApiRes = await getDocumentHistory(
      Constants.DOC_TYPE_GSTR_FILES,
      currentBusinessPartnerId
    );
    let docRes = docApiRes.data;
    let apiRes = await getBusinessPartnerPlatformConfig(
      currentBusinessPartnerId
    );
    let configRes = apiRes.data;
    setUploadedCount(configRes,docRes);

    const { statusCode, document } = docRes;
    if (statusCode === Constants.API_SUCCESS) {
      let documents: IDocument[] = document;
      documents = documents.sort((obj1, obj2) =>
        obj1.startDate > obj2.startDate ? 1 : -1
      );
      setAllDocuments(documents);
      if (_.size(documents)) setAction("details");
      else setAction("create");

      let files: IFile[] = [];
      for (const doc of documents) {
        let title = getDocTitle(doc.startDate, doc.endDate);
        let file: UploadedFile = doc.files?.find(
          (file) => file.type === "SELF"
        );
        file.title = title;
        file.startDate = doc.startDate;
        file.endDate = doc.endDate;
        files.push(file);
      }
      setUploadObj({ ...uploadObj, files: files });
    }
    setLoading(false);
  };

  const getMonthsDropdownDisplayName = (month: ISpan) => {
    return `${month.months}`;
  };

  const getQuartersDropdownDisplayName = (quarter: ISpan) => {
    return `${quarter.months[0]} - ${
      quarter.months[_.size(quarter.months) - 1]
    }`;
  };

  const checkIsMimeValid = (mime) => {
    return getMimeTypes().includes(mime);
  };

  const getMimeTypes = () => {
    var list = Constants.ALLOWED_GSTR_FILE_MIME.map((obj) => {
      return obj.mimeType;
    });
    return list.join(",");
  };

  const getAllowedFiles = () => {
    var fileList = Constants.ALLOWED_GSTR_FILE_MIME.map((obj) => {
      return obj.displayValue;
    });
    return fileList.join(", ");
  };

  const getMaxSizeDisplay = () => {
    return Constants.GSTR_MAX_FILE_SIZE_MB;
  };

  const isFileSizeValid = (size) => {
    let sizeInMb = size * Constants.MB_CONVERTER;
    return sizeInMb > Constants.GSTR_MAX_FILE_SIZE_MB;
  };
  const fileChangedHandler = (event) => {
    let file = event.target.files[0];
    let file_size = file.size;
    let mime = file.type;

    let isSizeValid = isFileSizeValid(file_size);
    let isMimeValid = checkIsMimeValid(mime);

    if (!isSizeValid) {
      toast.error(
        `size cannot be greater than ${Constants.GSTR_MAX_FILE_SIZE_MB} MB`
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
      Constants.DOC_TYPE_GSTR_FILES,
      currentBusinessPartnerId,
      file
    );
    if (apiRes.status === Constants.API_SUCCESS) {
      let res = apiRes.data;
      if (res && res.Key) {
        toast.success(t("CUSTOM_FILE_UPLOAD_SUCCESSFUL_ALERT"));
        uploadObj.loading = true;

        let year =
          currentSpan === "MONTHLY"
            ? currentSelectedMonth.year
            : currentSelectedQaurter.year;
        let months =
          currentSpan === "MONTHLY"
            ? currentSelectedMonth.months
            : currentSelectedQaurter.months;

        const from = `${year}-${months[0]}`;
        const to = `${year}-${months[_.size(months) - 1]}`;
        const dateFormat = `YYYY-MMMM`;
        let title = getDocTitle(from, to);
        uploadObj.files = uploadObj.files.filter((obj) => obj.title !== title);

        let newFile: UploadedFile = {
          fileId: res.Key,
          fileType: mime,
          type: "SELF",
          title: title,
          startDate: DateTimeUtils.parseAndGetIso(from, dateFormat),
          endDate: DateTimeUtils.parseAndGetIso(to, dateFormat),
          isNew: true,
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

  const cancelEdit = () => {
    history.goBack()
  };

  const enableEdit = () => {
    setAction("edit");
  };

  const generateRequest = (file: UploadedFile): IUploadAndSaveDocument => {
    return {
      files: [file],
      documentType: Constants.DOC_TYPE_GSTR_FILES,
      documentNo: currentUser?.businessPartner?.gstin ? currentUser?.businessPartner?.gstin :"",
      data: {},
      startDate: file.startDate,
      endDate: file.endDate,
      businessPartnerId: currentBusinessPartnerId,
      personId: "",
    };
  };

  const onSubmit = async () => {
    setIsSaving(true);
    if (!_.size(uploadObj.files)) {
      toast.error(t("UPLOAD_VALID_FILE"));
    }

    let responses: IUploadAndSaveDocumentResponse[] = [];
    const newFiles = uploadObj.files.filter((obj) => obj.isNew);
    for (const file of newFiles) {
      const request = generateRequest(file);
      let apiRes = await uploadAndSaveBusinessDocument(request);
      let res = apiRes.data;
      responses.push(res);
    }
    let isDocumentsSaved = responses.every(
      (item) => item.statusCode === Constants.API_SUCCESS
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
                    <span className="pending-text underline ">
                      {t("GSTR_FILES")}
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
                <h4 className="fs-20 fw-600">{t("GSTR_FILES")}</h4>
                <p className="fs-14 fw-400">
                  {t("GST_FILE_DESCRIPTION")} {totalFilesRequred}{" "}
                  {t("MONTHS_IN_PDF_FORMAT")}
                </p>
              </div>
            </IonItem>

            {/* upload gst return file start */}
            {(action === "create" || action === "edit") && (
              <IonCard className="primary-card no-border br-8">
                <IonCardContent className="card-content">
                  <IonGrid className="p-0">
                    <IonRow className="">
                      <IonCol size="auto" className="">
                        <h4 className="fs-18 fw-600">{t("YEAR")}</h4>
                      </IonCol>
                    </IonRow>

                    <IonRow className="">
                      <IonCol size="12" className="">
                        <IonItem lines="none" className="input-item">
                          <IonSelect
                            interface="popover"
                            value={currentSelectedFinancialYear}
                            onIonChange={(e) => {
                              setCurrentSelectedFinancialYear(e.detail.value);
                            }}
                            mode="md"
                            placeholder={t("SELECT_YEAR")}
                            className="w-100 select-field"
                          >
                            {financialYears &&
                              financialYears.map((financialYear, index) => {
                                return (
                                  <IonSelectOption
                                    key={index}
                                    value={`${financialYear}`}
                                  >
                                    {`${financialYear}`}
                                  </IonSelectOption>
                                );
                              })}
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
                              setCurrentSpan(e.detail.value);
                            }}
                            interface="popover"
                            mode="md"
                            placeholder={t("SELECT_SPAN")}
                            className="w-100 select-field"
                          >
                            {SPANS &&
                              SPANS.map((spanName, index) => {
                                return (
                                  <IonSelectOption key={index} value={spanName}>
                                    {t(spanName)}
                                  </IonSelectOption>
                                );
                              })}
                          </IonSelect>
                        </IonItem>
                      </IonCol>
                    </IonRow>

                    {currentSpan === "MONTHLY" && (
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
                                value={JSON.stringify(currentSelectedMonth)}
                                onIonChange={(e) => {
                                  setCurrentSelectedMonth(
                                    JSON.parse(e.detail.value)
                                  );
                                }}
                                interface="popover"
                                mode="md"
                                placeholder={t("SELECT_MONTH")}
                                className="w-100 select-field"
                              >
                                {monthsToDisplay &&
                                  monthsToDisplay.map((month, index) => {
                                    return (
                                      <IonSelectOption
                                        key={index}
                                        value={JSON.stringify(month)}
                                      >
                                        {getMonthsDropdownDisplayName(month)}
                                      </IonSelectOption>
                                    );
                                  })}
                              </IonSelect>
                            </IonItem>
                          </IonCol>
                        </IonRow>
                      </>
                    )}

                    {currentSpan === "QUARTERLY" && (
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
                                  setCurrentSelectedQaurter(
                                    JSON.parse(e.detail.value)
                                  );
                                }}
                                interface="popover"
                                mode="md"
                                placeholder={t("SELECT_MONTH")}
                                className="w-100 select-field"
                              >
                                {quartersToDisplay &&
                                  quartersToDisplay.map((qaurter, index) => {
                                    return (
                                      <IonSelectOption
                                        key={index}
                                        value={JSON.stringify(qaurter)}
                                      >
                                        {getQuartersDropdownDisplayName(
                                          qaurter
                                        )}
                                      </IonSelectOption>
                                    );
                                  })}
                              </IonSelect>
                            </IonItem>
                          </IonCol>
                        </IonRow>
                      </>
                    )}
                  </IonGrid>

                  <IonRow className="">
                    <IonCol size="auto" className="">
                      <h4 className="fs-18 fw-600">{t("UPLOAD_GSTR_FILES")}</h4>
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
                            <input
                              className="fileupload"
                              type="file"
                              onChange={fileChangedHandler}
                              accept={getMimeTypes()}
                            />
                          </div>

                          <div className="file-size-wrap ion-text-center">
                            <h4 className="fs-14 fw-400">
                              {t("FILE_SUPPORTED")}:{getAllowedFiles()}
                            </h4>
                            <p className="fs-12 fw-400">
                              {t("MAXIMUM")} {getMaxSizeDisplay()}{t("MB")}
                            </p>
                          </div>
                        </div>
                      </IonCol>
                    </IonRow>

                    <IonRow className="pt-11">
                      {uploadObj &&
                        uploadObj.files.map((obj, index) => (
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
                        <ActyvButton
                          onClick={onSubmit}
                          text={t("SAVE")}
                          isLoading={isSaving}
                          disabled={isSaving}
                        ></ActyvButton>
                      </IonCol>
                      <IonCol size="6" className="ion-text-center">
                        <IonButton
                          disabled={isSaving || !_.size(uploadObj.files)}
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

            {/* upload gst return file end */}

            {/* document uploaded preview start */}
            {action === "details" && (
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

                    <IonRow className="my-7 ion-justify-content-center">
                      <IonCol className="" size="auto">
                        <div className="d-flex ion-align-items-center mr-6">
                          <h4 className="fs-12 fw-600">{t("STATUS")}:</h4>
                          <div className="status-box-inbox">
                            <span className="fw-700 fs-12 dark">
                              {filesUploaded}
                            </span>
                            /
                            <span className="fs-12 fw-400">
                              {totalFilesRequred}
                            </span>
                          </div>
                          <div>
                            <p>{t("MONTHS_GST_3B_UPLOADED")}</p>
                          </div>
                        </div>
                      </IonCol>
                    </IonRow>

                    <IonRow className="ion-justify-content-center">
                      {uploadObj &&
                        uploadObj.files.map((obj) => (
                          <IonCol size="4" className="">
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
            {/* document uploaded preview end */}

            {
              (action === 'create' || action === 'edit') && (
                <IonList className="list-transparent pr-20" lines="none">
              <IonItem className="item-transparent">
                <h4 className="fs-14 fw-700">
                  {t("GST_RETURN_PDF_INSTRUCTION")}
                </h4>
              </IonItem>
              <IonItem className="item-transparent pr-20">
                <ul className="pl-20 mb-0">
                  <li className="fs-14 fw-400 mb-9">
                    {t("GST_RETURN_PDF_TEXT_1")}
                  </li>
                  <li className="fs-14 fw-400 mb-9">
                    {t("GST_RETURN_PDF_TEXT_2")}
                  </li>
                  <li className="fs-14 fw-400 mb-0">
                    {t("GST_RETURN_PDF_TEXT_3")}
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
                    {t("GST_RETURN_PDF_TEXT_4")}
                  </li>
                </ul>
              </IonItem>
            </IonList>
              ) 
            }
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default GSTReturnPDFUpload;
