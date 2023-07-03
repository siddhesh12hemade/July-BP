import {
  IonAccordion,
  IonAccordionGroup,
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
  IonText
} from "@ionic/react";
import * as _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import ActyvButton from "../components/ActyvButton";
import Header from "../components/Header";
import { Constants } from "../utils/constants/constants";
import { IBusinessPartner } from "../utils/interfaces/App.interface";
import { IBusinessGstinDocumentHistory } from "../utils/interfaces/DocumentVault.interface";
import {
  IGstinDocumentHistory,
  IGstInDocumentPullStatus,
  IGstinVerificationList
} from "../utils/interfaces/GSTCertificate.interface";
import {
  IRequestGSTOtp,
  IRequestGSTVerifyOtp
} from "../utils/interfaces/GSTPull.interface";
import { systemException } from "../utils/sentry/common.service";
import {
  getDocumentHistory,
  getDocumentHistoryWithGstIn
} from "../utils/services/DocumentVault.Service";
import {
  requestOtpFroGstReturnsPull, verifytGstOtpAndInitialPull
} from "../utils/services/GSTPull.Service";
import { useAppSelector } from "../utils/store/hooks";
import {
  selectCurrentBusinessPartner,
  selectCurrentBusinessPartnerId
} from "../utils/store/user.slice";
import { DateTimeUtils } from "../utils/utils/DateTime.Utils";
import { Helpers } from "../utils/utils/Helpers";

const GSTReturnPull: React.FC = () => {
  const [isLoading, setLoading] = useState(false);
  const currentBusinessPartnerId = useAppSelector<string>(
    selectCurrentBusinessPartnerId
  );
  const currentBusinessPartnerInfo = useAppSelector<IBusinessPartner>(
    selectCurrentBusinessPartner
  );
  const [dropDownList, setDropdownList] = useState<IGstinVerificationList[]>(
    []
  );
  const [allDocuments, setAllDocuments] = useState<
    IBusinessGstinDocumentHistory[]
  >([]);
  const [selectedGst, setSelectedGst] = useState<string>("");
  const [action, setAction] = useState("");
  const [gstHistory, setGstHistory] = useState<IGstinDocumentHistory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formUiState, setFormUiState] = useState<{
    state: "default" | "verify-otp" | "verified";
    loading: boolean;
  }>({
    state: "default",
    loading: false,
  });
  const {
    register,
    handleSubmit,
    formState,
    setValue,
    control,
    reset: resetForm,
    getValues,
    watch: watchForm,
  } = useForm({
    defaultValues: {
      gst: "",
      username: "",
      otp: "",
      gstDetailsField: "",
    },
  });

  const { t } = useTranslation();
  const accordionGroup = useRef<null | HTMLIonAccordionGroupElement>(null);
  let history = useHistory();

  useEffect(() => {
    fetchData();
  }, []);

  const reset = () => {
    setAction("");
  };
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
      let history = gstHistory.find((obj) => obj.gstIn === selectedGst);

      if (history) setFormUiState({ ...formUiState, state: "verified" });
      else setFormUiState({ ...formUiState, state: "default" });
    }
  }, [selectedGst, allDocuments, gstHistory]);

  const onGstChange = (gst) => {
    setSelectedGst(gst);
    setValue("gstDetailsField", gst);
  };

  const fetchGstDocuments = async (gst: string) => {
    const requiredDocuments = [
      "GSTR3B_RETSUM",
      "GSTR2A_B2B",
      "GSTR2A_RETSUM",
      "GSTR1_EXP",
      "GSTR1_B2B",
      "GSTR1_CDNR",
      "GSTR1_HSNSUM",
      "GSTR1_CDNUR",
      "GSTR1_B2CL",
      "GSTR1_CDN",
      "GSTR1_NIL",
      "GSTR1_B2CS",
    ];
    let apiRes = await getDocumentHistoryWithGstIn(
      currentBusinessPartnerId,
      gst,
      requiredDocuments
    );
    if (apiRes.status === Constants.API_SUCCESS) {
      let data = apiRes.data;
      if (data.statusCode === Constants.API_SUCCESS) {
        if (_.size(_.get(data.document, "documents", [])) > 0) {
          const gstDocumentsArr: any = { ...data.document };
          let gstData: IGstinDocumentHistory = gstDocumentsArr;
          gstHistory.push(gstData);
          setGstHistory(gstHistory);
        }
      }
    }
  };

  const fetchData = async () => {
    setLoading(true);
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

      await fetchAllGstDocuments();
    }

    setLoading(false);
  };

  const fetchAllGstDocuments = async () => {
    for (const doc of allDocuments) {
      await fetchGstDocuments(doc.documentNo);
    }
  };

  const onSubmit = async (data) => {
    setIsProcessing(true);
    if (formUiState.state === "default") {
      const req: IRequestGSTOtp = {
        gstUsername: data.username,
        gstin: data.gst,
        businessPartnerId: currentBusinessPartnerId,
      };

      try {
        let apiRes = await requestOtpFroGstReturnsPull(req);
        let res = apiRes.data;

        const { statusCode, message } = res;
        switch (statusCode) {
          case "VERIFIED": {
            setFormUiState({ ...formUiState, state: "verified" });
            toast.success(message ? message : t("GST_OTP_SUCCESS"));
            await fetchAllGstDocuments();

            break;
          }
          case "OTP_SENT": {
            setFormUiState({ ...formUiState, state: "verify-otp" });
            toast.success(message ? message : t("OTP_SENT"));

            break;
          }
          case "ERROR": {
            toast.error(message ? message : t("SOMETHING_WENT_WRONG"));
            break;
          }
          default: {
            setFormUiState({ ...formUiState, state: "default" });
          }
        }
      } catch (e) {
        let obj = {
          fileName: 'GSTReturnPull.tsx',
          functionName: 'onSubmit()',
          error: e,
        };
        systemException(obj);
        toast.error(t("SOMETHING_WENT_WRONG"));
        setFormUiState({ ...formUiState, state: "default" });
      }
    } else if (formUiState.state === "verify-otp") {
      let req: IRequestGSTVerifyOtp = {
        businessPartnerId: currentBusinessPartnerId,
        gstin: data.gst,
        gstUsername: data.username,
        otp: data.otp,
      };
      let res = await verifytGstOtpAndInitialPull(req);
      if (res.status === Constants.API_SUCCESS) {
        const { statusCode, message } = res.data;
        switch (statusCode) {
          case "VERIFIED": {
            setFormUiState({ ...formUiState, state: "verified" });
            toast.success(message ? message : t("GST_OTP_SUCCESS"));
            await fetchAllGstDocuments();

            break;
          }
          case "ERROR": {
            toast.error(message ? message : t("SOMETHING_WENT_WRONG"));
            break;
          }
        }
      } else {
        toast.error(t("SOMETHING_WENT_WRONG"));
        setFormUiState({ ...formUiState, state: "default" });
      }
    }
    setIsProcessing(false);
  };

  const getHistory = (gst) => {
    let items = gstHistory.find((obj, i) => {
      return obj.gstIn === gst;
    });

    return items ?? null;
  };

  const GstDoc = (props: { gstHistory: IGstinDocumentHistory }) => {
    const gstFiling = _.groupBy(
      props.gstHistory.documents,
      (doc) => `${doc?.documentType}`
    );

    return (
      <>
        {Object.keys(gstFiling).map((gstFilingType, index) => {
          const actualGstFilings = gstFiling[
            gstFilingType
          ] as IGstInDocumentPullStatus[];
          const chunkSize = Math.ceil(_.size(actualGstFilings) / 2);
          const chunkedGstFilings = _.chunk(actualGstFilings, chunkSize);
          return (
            <IonAccordionGroup ref={accordionGroup} multiple={true}>
              <IonAccordion value="first" className="bottom-line-grid">
                <IonItem slot="header" lines="none" className="">
                  <div>
                    <IonLabel className="fw-600 fs-18">
                      {t(gstFilingType)}
                    </IonLabel>
                    <p className="fs-10 fw-600">{t("MONTHLY_FILING")}</p>
                  </div>
                </IonItem>

                <div className="p-relative return-pull-list" slot="content">
                  <div className="border-round mb-10">
                    <IonGrid>
                      <IonRow>
                        <IonCol size="6">
                          <ol className="pl-0 dark fw-600 br-light mt-0">
                            {chunkedGstFilings?.[0].map((obj, index) => {
                              const startDate = DateTimeUtils.convertFormat(
                                obj.startDate,
                                DateTimeUtils.FULL_MONTH_YEAR_FORMAT
                              );
                              const endDate = DateTimeUtils.convertFormat(
                                obj.endDate,
                                DateTimeUtils.FULL_MONTH_YEAR_FORMAT
                              );
                              const displayDate =
                                startDate === endDate
                                  ? startDate
                                  : `${startDate} - ${endDate}`;
                              return (
                                <li
                                  className="mb-9"
                                  style={{
                                    listStyleType: "none",
                                  }}
                                >
                                  <IonItem
                                    className="pl--0 mh--auto"
                                    lines="none"
                                  >
                                    <p className="fs-14 fw-600 ws-nowrap">
                                      {index + 1}. {displayDate}
                                    </p>
                                    <IonImg
                                      src={_.get(
                                        Constants.GST_FILING_STATUS_ICONS,
                                        _.get(obj, "status[0].value")
                                      )}
                                      slot="end"
                                      className="ion-no-margin"
                                    />
                                  </IonItem>
                                </li>
                              );
                            })}
                          </ol>
                        </IonCol>
                        <IonCol size="6">
                          <ol className="pl-0 dark fw-600 mt-0">
                            {chunkedGstFilings?.[1].map((obj, index) => {
                              const startDate = DateTimeUtils.convertFormat(
                                obj.startDate,
                                DateTimeUtils.FULL_MONTH_YEAR_FORMAT
                              );
                              const endDate = DateTimeUtils.convertFormat(
                                obj.endDate,
                                DateTimeUtils.FULL_MONTH_YEAR_FORMAT
                              );
                              const displayDate =
                                startDate === endDate
                                  ? startDate
                                  : `${startDate} - ${endDate}`;
                              const currentIndex =
                                index + 1 + _.size(chunkedGstFilings?.[0]);
                              return (
                                <li
                                  className="mb-9"
                                  style={{
                                    listStyleType: "none",
                                  }}
                                >
                                  <IonItem
                                    className="pl--0 mh--auto ipr--0"
                                    lines="none"
                                  >
                                    <p className="fs-14 fw-600 ws-nowrap">
                                      {currentIndex}. {displayDate}
                                    </p>
                                    <IonImg
                                      src="./img/partner-img/right-success.svg"
                                      slot="end"
                                      className="ion-no-margin"
                                    ></IonImg>
                                  </IonItem>
                                </li>
                              );
                            })}
                          </ol>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </div>
                </div>
              </IonAccordion>
            </IonAccordionGroup>
          );
        })}
      </>
    );
  };
  return (
    <IonPage>
      <Header />
      <IonContent fullscreen>
        <IonItem lines="none">
          <IonGrid className="pt-11">
            <IonRow className="">
              <p className="fs-14 fw-600">
                {t("DOCUMENT_VAULT")} ::{" "}
                <span className="pending-text underline ">
                  {t("GSTR_PULL")}
                </span>
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
            <h4 className="fs-20 fw-600">{t("GSTR_PULL")}</h4>
            <p className="fs-14 fw-400">{t("GSTR_PULL_NOTE")}</p>
          </div>
        </IonItem>

        {/* main card start */}
        {formUiState.state !== "verified" && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <IonCard className="primary-card no-border br-8">
              <IonCardContent className="card-content">
                <IonGrid className="p-0">
                  <IonRow className="">
                    <IonCol size="3" className="pb-0">
                      <IonImg
                        className="mw-10 uploaded-preview"
                        src="./img/partner-img/gst-img.svg"
                      ></IonImg>
                    </IonCol>
                  </IonRow>
                  <IonRow className="">
                    <IonCol size="auto" className="">
                      <h4 className="fs-16 fw-600">{t("GST_LOGIN")}</h4>
                      <p className="fs-12 fw-400">{t("GST_LOGIN_NOTE")} </p>
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
                            {t("SELECT_GST")}
                          </IonLabel>
                          <IonItem lines="none" className="input-item">
                            <IonSelect
                              interface="popover"
                              mode="md"
                              placeholder={t("GST_TEXT")}
                              className="w-100 select-field"
                              onIonChange={(e) => {
                                onGstChange(e.detail.value);
                              }}
                              {...register("gst", {
                                required: {
                                  value: true,
                                  message: t("FIELD_REQUIRED"),
                                },
                              })}
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
                          {formState.errors?.gst && (
                            <IonText color="danger">
                              {formState.errors?.gst?.message}
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
                            {t("GST_USERNAME")}
                          </IonLabel>
                          <IonItem lines="none" className="input-item">
                            <IonInput
                              class="d-flex label-input"
                              placeholder={t("GST_USERNAME_PLACEHOLDER")}
                              {...register("username", {
                                required: {
                                  value: true,
                                  message: t("FIELD_REQUIRED"),
                                },
                              })}
                            ></IonInput>
                          </IonItem>
                          {formState.errors?.username && (
                            <IonText color="danger">
                              {formState.errors?.username?.message}
                            </IonText>
                          )}
                        </IonItem>
                      </IonList>
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    {formUiState.state === "verify-otp" && (
                      <IonCol>
                        <IonList className="py-0">
                          <IonItem lines="none" className="input-item-labeled">
                            <IonLabel
                              className="fs-16 fw-600 dark mb-9"
                              position="stacked"
                            >
                              {t("OTP")}
                            </IonLabel>
                            <IonItem lines="none" className="mb-5 input-item">
                              <IonInput
                                class="d-flex label-input"
                                placeholder=""
                                {...register("otp", {
                                  required: {
                                    value: true,
                                    message: t("FIELD_REQUIRED"),
                                  },
                                })}
                              ></IonInput>
                            </IonItem>
                            {formState.errors?.otp && (
                              <IonText color="danger">
                                {formState.errors?.otp?.message}
                              </IonText>
                            )}
                            <p className="">
                              {t("DIDNT_GET_OTP_YET")}{" "}
                              <span className="primary-color underline">
                                {t("RESEND")}
                              </span>
                            </p>
                          </IonItem>
                        </IonList>
                      </IonCol>
                    )}
                  </IonRow>
                </IonGrid>
              </IonCardContent>
              <IonCardContent className="footer-gradient py-0">
                <IonGrid>
                  <IonRow className="ion-justify-content-center">
                    {formUiState.state === "default" && (
                      <IonCol size="auto" className="ion-text-center">
                        <ActyvButton
                          text={t("NEXT")}
                          isLoading={isProcessing}
                          disabled={isProcessing}
                        ></ActyvButton>
                      </IonCol>
                    )}
                  </IonRow>
                  <IonRow className="">
                    {formUiState.state === "verify-otp" && (
                      <IonCol size="12" className="ion-text-center">
                        <IonButton
                          shape="round"
                          type="submit"
                          className="fs-14 fw-500 medium-round-btn"
                        >
                          {t("VERIFY")}
                        </IonButton>
                      </IonCol>
                    )}
                  </IonRow>
                </IonGrid>
              </IonCardContent>
            </IonCard>
          </form>
        )}

        {/* main card end */}

        {/* gst files start */}
        {formUiState.state === "verified" && (
          <IonCard className="primary-card no-border br-8">
            <IonCardContent className="card-content">
              <IonGrid className="p-0">
                <IonRow className="">
                  <IonCol size="12" className="">
                    <h4 className="mb-9 fs-18 fw-600">{t("SELECT_GST")}</h4>

                    <IonItem lines="none" className="input-item">
                      <IonSelect
                        interface="popover"
                        mode="md"
                        placeholder={t("GST_TEXT")}
                        className="w-100 select-field"
                        onIonChange={(e) => {
                          setSelectedGst(e.detail.value);
                          setValue("gst", e.detail.value);
                        }}
                        {...register("gstDetailsField")}
                      >
                        {dropDownList.map((item, index) => (
                          <IonSelectOption key={index} value={`${item.value}`}>
                            {item.label}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
            <div className="card-divider mb-18"></div>
            <IonCardContent className="py-0">
              {getHistory(selectedGst) && (
                <GstDoc gstHistory={getHistory(selectedGst)}></GstDoc>
              )}
            </IonCardContent>

            {!getHistory(selectedGst) && (
              <IonCardContent>
                <IonGrid>
                  <IonRow className="ion-justify-content-center ion-text-center">
                    <IonCol size="auto">
                      <IonImg
                        src="./img/partner-img/no-data.svg"
                        alt="no-data"
                      ></IonImg>
                      <p className="py-20 fs-18 fw-600">
                        {t("GST_DATA_NOT_AVAILABLE")}
                      </p>
                      <IonButton
                        disabled={false}
                        shape="round"
                        onClick={fetchAllGstDocuments}
                        className="fs-14 fw-500 medium-round-btn"
                      >
                        {t("FETCH DATA")}
                      </IonButton>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCardContent>
            )}
          </IonCard>
        )}
        {/* gst files end */}

{
  formUiState.state !== 'verified' && (
<IonList className="list-transparent pr-20" lines="none">
          <IonItem className="item-transparent">
            <h4 className="fs-14 fw-700">{t("GST_RETURN_PULL_INSTRUCTION")}</h4>
          </IonItem>
          <IonItem className="item-transparent pr-20">
            <ul className="pl-20 mb-0">
              <li className="fs-12 fw-400 mb-9">
                {t("GST_RETURN_PULL_TEXT_1")}
              </li>

              <li className="fs-12 fw-400 mb-9">
                {t("GST_RETURN_PULL_TEXT_2")}
              </li>
              <li className="fs-12 fw-400 mb-9">
                {t("GST_RETURN_PULL_TEXT_3")}
                <li>{t("GST_RETURN_PULL_TEXT_LIST_1")}</li>
                <li>{t("GST_RETURN_PULL_TEXT_LIST_2")}</li>
                <li>{t("GST_RETURN_PULL_TEXT_LIST_3")}</li>
              </li>
            </ul>
          </IonItem>
        </IonList>
  )
}
        

        {/* Tab content start */}
      </IonContent>
    </IonPage>
  );
};

export default GSTReturnPull;
