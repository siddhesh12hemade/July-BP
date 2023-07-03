import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent, IonGrid,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonList, IonPage, IonRow, IonText, useIonModal
} from "@ionic/react";

import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import ActyvButton from "../components/ActyvButton";
import VerifyCaptchaModal from "../components/CaptchaComponent";
import Header from "../components/Header";
import Loader from "../components/Loader";
import { Constants } from "../utils/constants/constants";
import { IDocument } from "../utils/interfaces/DocumentVault.interface";
import { initiateCinVerification, verifyCINCaptcha } from "../utils/services/Cin.Service";
import { getDocumentHistory, uploadAndSaveBusinessDocument } from "../utils/services/DocumentVault.Service";
import { useAppSelector } from "../utils/store/hooks";
import { selectCurrentBusinessPartnerId } from "../utils/store/user.slice";
import { Helpers } from "../utils/utils/Helpers";
import { ValidateUtils } from "../utils/utils/Validate.Utils";

const CINNumber: React.FC = () => {
  let history = useHistory();
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const currentBusinessPartnerId = useAppSelector<string>(selectCurrentBusinessPartnerId);
  const [action, setAction] = useState("");
  const [activeDocument, setActiveDocument] = useState<IDocument>()
  const [verificationInfo, setVerificationInfo] = useState<
    { companyLLPInfo: object, directorInfo: object, chargesInfo: object }>()
  const { register, handleSubmit, formState, setValue } = useForm({
    mode: "onChange",
    defaultValues: { cin: "" },
  });
  const [captchaBase64, setCaptchaBase64] = useState("")
  const [verifyCaptchaModal, dismissVerifyCaptchaModal] = useIonModal(VerifyCaptchaModal, {
    onDismiss: (data: string, role: string) => dismissVerifyCaptchaModal(data, role),
    captchaUrl: captchaBase64
  });

  // save - save doc
  // "verify" - begin verification
  const [autoVerifyState, setAutoVerifyState] = useState({
    state: "verify",
    loading: false
  });

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    let docApiRes = await getDocumentHistory(Constants.DOC_TYPE_CIN, currentBusinessPartnerId);
    let docRes = docApiRes.data

    const { statusCode, document } = docRes;
    if (statusCode === Constants.API_SUCCESS) {
      let documents: IDocument[] = document

      if (_.size(documents))
        setAction('details')
      else
        setAction('create')

      if (_.size(documents)) {
        let doc = documents[0]

        setValue('cin', doc.documentNo)
        setActiveDocument(doc)
      }

    }
    setLoading(false)
  }

  const onSubmit = async (data) => {
    setAutoVerifyState({ ...autoVerifyState, loading: true })
    if (autoVerifyState.state === 'verify') {

      let response = await initiateCinVerification({ cinNumber: data.cin })
      if (response.status === Constants.API_SUCCESS) {
        let res = response.data
        setAutoVerifyState({ ...autoVerifyState, loading: false })
        let resData = res.response
        if (resData["status-code"] === Constants.STATUS_CODE_CIN_SUCCESS) {
          setCaptchaBase64(Helpers.bufferToBase64(resData.data))
          verifyCaptchaModal({
            cssClass: "custom-modal",
            onWillDismiss: async (ev: CustomEvent<OverlayEventDetail>) => {
              if (ev.detail.role === 'refresh') {
                onSubmit(data)
              }
              else if (ev.detail.role === 'confirm') {
                let captchaText = ev.detail.data

                setAutoVerifyState({ ...autoVerifyState, loading: true })


                let captchaVerifyApiRes = await verifyCINCaptcha({
                  businessPartnerId: currentBusinessPartnerId,
                  cinNumber: data.cin,
                  captchaCode: captchaText
                })
                if (captchaVerifyApiRes.status === Constants.API_SUCCESS) {
                  let captchaVerifyRes = captchaVerifyApiRes?.data
                  if (captchaVerifyRes.response["status-code"] === Constants.STATUS_CODE_CIN_SUCCESS) {
                    const { companyLLPInfo, directorInfo, chargesInfo } = captchaVerifyRes.response;
                    setVerificationInfo({ companyLLPInfo, directorInfo, chargesInfo })
                    autoVerifyState.state = 'submit'
                    toast.success(t("CIN_VERIFICATION_SUCCESSFUL"));
                  }
                  else {
                    toast.error(captchaVerifyRes.response.message)
                  }
                }
                else {
                  toast.error(t('ISSUE_WHILE_CIN_CAPTCHA_VERIFICATION').replace('{message}', ''))
                }

                autoVerifyState.loading = false
                setAutoVerifyState(autoVerifyState)
              }
            },
          });

        }
        else {
          toast.error(t('ISSUE_WHILE_INITIATING_CIN_VERIFICATION'))

        }
      }
      else {
        setAutoVerifyState({ ...autoVerifyState, loading: false })
        toast.error(t('ISSUE_WHILE_INITIATING_CIN_VERIFICATION'))
      }
    }
    else if (autoVerifyState.state === 'submit') {
      try {
        setAutoVerifyState({ ...autoVerifyState, loading: true })
        let apiRes = await uploadAndSaveBusinessDocument({
          files: [],
          documentNo: data.cin,
          documentType: Constants.DOC_TYPE_CIN,
          data: verificationInfo,
          businessPartnerId: currentBusinessPartnerId,
          endDate: "",
          personId: "",
          startDate: ""
        })
        let res = apiRes.data
        setAutoVerifyState({ ...autoVerifyState, loading: false })
        if (res.statusCode === Constants.API_SUCCESS) {
          toast.success(t("CIN_DETAILS_SUBMISSION_SUCCESSFUL"));
          await fetchData();
          setAction('details');
        }
        else {
          toast.error(t('ISSUE_WHILE_INITIATING_CIN_VERIFICATION'));
        }
      }
      catch (e) {
        setAutoVerifyState({ ...autoVerifyState, loading: false });
        toast.error(t('ISSUE_WHILE_INITIATING_CIN_VERIFICATION'));
      }
    }

  }
  const enableEdit = () => {
    setAutoVerifyState({ state: 'verify', loading: false });
    setAction("edit");
  }

  const isBtnDisabled = () => {
    return autoVerifyState.loading;
  }

  return (
    <IonPage>
      <Header />
      <IonContent fullscreen>
        {
          loading ? (
            <Loader />
          ) : (
            <>
              <IonItem lines="none">
                <IonGrid className="pt-11">
                  <IonRow className="">
                    <p className="fs-12 fw-600">
                      {t("DOCUMENT_VAULT")} ::{" "}
                      <span className="pending-text underline ">
                        {t("CIN_NUMBER")}
                      </span>
                    </p>
                  </IonRow>
                </IonGrid>
              </IonItem>

              <IonItem lines="none" className="pl--0 item-transparent mt-10 mb-13">
                <IonButton className="mr-6 h-auto" slot="start" fill="clear" onClick={() => history.goBack()}>
                  <IonImg src="./img/partner-img/back-button.svg"></IonImg>
                </IonButton>
                <div className="">
                  <h4 className="fs-16 fw-600">{t("CIN_VERIFICATION_HEADER")}</h4>
                  <p className="fs-14 fw-400">
                    {t("CIN_VERIFICATION_INSTRUCTION")}
                  </p>
                </div>
              </IonItem>

              {/* main card start */}
              {
                (action === 'create' || action === 'edit') && (
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <IonCard className="primary-card no-border br-8">
                      <IonCardContent className="card-content">
                        <IonGrid className="p-0">
                          <IonRow>
                            <IonCol>
                              <IonList className="py-0">
                                <IonItem className="input-item-labeled">
                                  <IonLabel
                                    className="fs-16 fw-600 dark mb-9"
                                    position="stacked"
                                  >
                                    {t("ENTER_21_DIGIT_CIN_NUMBER")}
                                  </IonLabel>

                                  <IonItem lines="none" className="input-item">
                                    <IonInput
                                      class="d-flex label-input"
                                      placeholder={t("CIN_NUMBER_PLACEHOLDER")}
                                      {...register("cin", {
                                        required: { value: true, message: t("FIELD_REQUIRED") },
                                        pattern: { value: ValidateUtils.CIN_REGEX, message: t("VALID_CIN_INPUT") }
                                      })}
                                    >
                                    </IonInput>
                                  </IonItem>

                                </IonItem>
                                {formState.errors?.cin && <IonText color="danger">{formState.errors?.cin?.message}</IonText>}
                              </IonList>
                            </IonCol>
                          </IonRow>

                          <IonRow className="">
                          {autoVerifyState.state === 'verify'?
                            <IonCol size="12" className="ion-text-center">
                            <ActyvButton text={t("VERIFY")} isLoading={autoVerifyState.loading} disabled={isBtnDisabled()}></ActyvButton>
                            <Loader isloading={loading} />
                            </IonCol>
                            :
                            <IonCol size="12" className="ion-text-center">
                            <ActyvButton text={t("SAVE")} isLoading={autoVerifyState.loading} disabled={isBtnDisabled()}></ActyvButton>
                            <Loader isloading={loading} />
                            </IonCol>
                          }  
                          </IonRow>
                        </IonGrid>
                      </IonCardContent>
                    </IonCard>
                  </form>
                )
              }
              {/* main card end */}

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
                        <IonRow>
                          <IonCol>
                            <h4 className="mb-0 fs-12 fw-600">{t("COMPANY_IDENTIFICATION_NUMBER_CAP")}</h4>
                          </IonCol>
                        </IonRow>
                        <IonRow>
                          <IonCol>
                            <IonRow>
                              <IonCol size="auto" className="pl-0">
                                <IonImg src="./img/note-gray.svg"></IonImg>
                              </IonCol>
                              <IonCol>
                                <div>
                                  <p className="fs-14 fw-400">{t("CIN_VERIFICATION_HEADER")}</p>
                                  <p className="fs-14 fw-600">{activeDocument.documentNo}</p>
                                </div>
                              </IonCol>
                            </IonRow>
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </IonCardContent>
                  </IonCard>
                )
              }
              <IonList className="list-transparent pr-20" lines="none">
                <IonItem className="item-transparent">
                  <h4 className="fs-14 fw-700">{t("CIN_INSTRUCTION")}</h4>
                </IonItem>
                <IonItem className="item-transparent pr-20">
                  <ul className="pl-20 mb-0">
                    <li className="fs-14 fw-400 mb-9">
                      {t("CIN_TEXT")}
                    </li>
                  </ul>
                </IonItem>
              </IonList>

              {/* Tab content start */}
            </>
          )}

      </IonContent>
    </IonPage>
  );
};

export default CINNumber;
