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
  IonRadio,
  IonRadioGroup,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTextarea,
  useIonModal
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import ActyvButton from "../components/ActyvButton";
import BureauQuestionnaireModal from "../components/BureauQuestionnaireModal";
import Header from "../components/Header";
import { Constants } from "../utils/constants/constants";
import {
  ExistingBureauServiceResponse,
  IGenerateReportRequest,
  IGenerateReportResponse,
  IPersonData
} from "../utils/interfaces/Bureau.interface";
import {
  generateBureauReport,
  getBureauReportForBusinessPartnerId,
  getPersonDataForBusinessPartnerId
} from "../utils/services/Bureau.Service";
import { useAppSelector } from "../utils/store/hooks";
import { selectCurrentBusinessPartnerId } from "../utils/store/user.slice";
import { DateTimeUtils } from "../utils/utils/DateTime.Utils";
const CreditInformationReport: React.FC = () => {
  const { t } = useTranslation();
  let history = useHistory();
  const [action, setAction] = useState("");
  const [allPersons, setAllPersons] = useState<IPersonData[]>([]);
  const [bureauRes, setBureauRes] = useState<IGenerateReportResponse>();
  const [bureauDetails, setBureauDetails] =
    useState<ExistingBureauServiceResponse>();
  const [submitLoading, setSubmitLoading] = useState(false);
  const { register, handleSubmit, formState, setValue, control, reset } =
    useForm({
      mode: "onChange",
      defaultValues: {
        person: "",
        address: "",
        age: "",
        city: "",
        country: "",
        dob: "",
        email: "",
        fathersName: "",
        firstName: "",
        gender: "",
        lastName: "",
        mobile: "",
        pan: "",
        pin: "",
        state: "",
        village: "",
      },
    });
  const currentBusinessPartnerId = useAppSelector<string>(
    selectCurrentBusinessPartnerId
  );

  const [questionnaireModal, dismissQuestionnaireModal] = useIonModal(
    BureauQuestionnaireModal,
    {
      onDismiss: (data: string, role: string) =>
        dismissQuestionnaireModal(data, role),
      defaultOptionsList: bureauRes?.data?.optionsList,
      defaultQuestion: bureauRes?.data?.question,
      // defaultAnswerType: bureauRes.data.buttonBehaviour,
      // orderId: string,
      // reportId:string,
    }
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    let reportAPiRes = await getBureauReportForBusinessPartnerId(
      currentBusinessPartnerId
    );
    let personDataApiRes = await getPersonDataForBusinessPartnerId(
      currentBusinessPartnerId
    );

    if (
      reportAPiRes.status === Constants.API_SUCCESS &&
      personDataApiRes.status === Constants.API_SUCCESS
    ) {
      let reportData = reportAPiRes.data;
      let personData = personDataApiRes.data;
      setAllPersons(personData);
      const { exists } = reportData;
      if (exists) setAction("details");
      else setAction("create");
      setBureauDetails(reportData);
    }
  };

  const getGenerateBureauReportRequest = (
    data: any
  ): IGenerateReportRequest => {
    return {
      addresss1: data.address,
      age: Number(data.age),
      city1: data.city,
      country1: data.country,
      dob: data.dob,
      email: data.email,
      fatherName: data.fathersName,
      firstName: data.firstName,
      gender: data.gender,
      lastName: data.lastName,
      mobileNumber1: data.mobile,
      pan: data.pan,
      pin1: data.pin,
      state1: data.state,
      village1: data.village,
      businessPartnerId: currentBusinessPartnerId,
    };
  };

  const onSubmit = async (formData) => {
    setSubmitLoading(true);
    const generateBureauReportRequest =
      getGenerateBureauReportRequest(formData);
    let apiRes = await generateBureauReport(generateBureauReportRequest);
    if (apiRes.status === Constants.API_SUCCESS) {
      const { errors, statusCode, message, data } = apiRes.data;
      switch (statusCode) {
        case "SUCCESS": {
          const {
            isQuestionnaire,
            question,
            optionsList,
            buttonBehaviour,
            orderId,
            reportId,
          } = data;
          setBureauRes(apiRes.data);
          // state.orderId = orderId;
          // state.reportId = reportId;
          // state.displayQuestion = isQuestionnaire;
          // state.questionText = question;
          // state.answerList = optionsList;
          // state.answerType = buttonBehaviour === "R" ? "RADIO" : "TEXT";
          break;
        }
        case "REPORT_AVAILABLE": {
          fetchData();
          break;
        }
      }
    } else {
      toast.error(t("CRIF_SOMETHING_WENT_WRONG"));
    }
    setSubmitLoading(false);
  };

  const onPersonChange = (idValue) => {
    let person = allPersons.find(
      (obj) => obj.panNumber === idValue || obj.aadhaarNumber === idValue
    );

    const [firstName, ...tempLastName] = person.name.split(" ");
    const lastName = tempLastName.join(" ");

    let parsedDob = DateTimeUtils.convertFormat(person.dob, "YYYY-MM-DD");
    let start = DateTimeUtils.now();
    let age = DateTimeUtils.getDiff(start, parsedDob, "years");
    reset({
      person: idValue,
      address: person.address,
      age: age + "",
      city: "",
      country: person.country,
      dob: person.dob ?? "",
      email: person.email,
      fathersName: person.careOf,
      firstName: firstName,
      gender: person.gender,
      lastName: lastName,
      mobile: person.phone?.replace("+91", ""),
      pan: person.panNumber,
      pin: person.pinCode,
      state: person.state,
      village: person.subDistrict,
    });
  };

  const getPersonValue = (item: IPersonData) => {
    return item.panNumber || item.aadhaarNumber;
  };
  return (
    <IonPage>
      <Header />

      <IonContent fullscreen>
        <IonItem lines="none">
          <IonGrid className="pt-11">
            <IonRow className="">
              <p className="fs-12 fw-600">
                {t("DOCUMENT_VAULT")} ::{" "}
                <span className="pending-text underline ">{t("BUREAU")}</span>
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
            <h4 className="fs-16 fw-600">{t("BUREAU")}</h4>
            <p className="fs-14 fw-400">{t("BUREAU_DESCRIPTION")}</p>
          </div>
        </IonItem>

        {/* main card start */}
        {(action === "create" || action === "edit") && (
          <IonCard className="primary-card no-border br-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              <IonCardContent className="card-content">
                <IonGrid className="p-0">
                  <IonRow className="">
                    <IonCol size="3" className="pb-0">
                      <IonImg
                        className="mw-10 uploaded-preview"
                        src="./img/crif.svg"
                      ></IonImg>
                    </IonCol>
                  </IonRow>
                  <IonRow className="">
                    <IonCol size="auto" className="">
                      <h4 className="fs-18 fw-600">{t("CRIF_DETAILS")}</h4>
                      <p className="fs-12 fw-400"></p>
                    </IonCol>
                  </IonRow>
                  <IonRow className="">
                    <IonCol size="auto" className="">
                      <h4 className="fs-16 fw-600">{t("SELECT_A_PERSON")}*</h4>
                    </IonCol>
                  </IonRow>
                  <IonRow className="">
                    <IonCol size="12" className="">
                      <IonItem lines="none" className="input-item">
                        <IonSelect
                          interface="popover"
                          mode="md"
                          placeholder=""
                          className="w-100 select-field"
                          onIonChange={(e) => {
                            onPersonChange(e.detail.value);
                          }}
                          {...register("person", {
                            required: {
                              value: true,
                              message: t("FIELD_REQUIRED"),
                            },
                          })}
                        >
                          {allPersons.map((item, index) => (
                            <IonSelectOption
                              key={index}
                              value={getPersonValue(item)}
                            >
                              {item.name}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonItem>
                      {formState.errors?.person && (
                        <IonText color="danger">
                          {formState.errors?.person?.message}
                        </IonText>
                      )}
                    </IonCol>
                  </IonRow>

                  <IonRow className="">
                    <IonCol size="auto" className="">
                      <h4 className="fs-16 fw-600">
                        {t("BUREAU_INPUT_HEADER_GENDER")}*
                      </h4>
                    </IonCol>
                  </IonRow>

                  <IonRadioGroup value="account" className="">
                    <IonRow>
                      <IonCol size="6">
                        <IonItem lines="none" className="mh--auto pl--0">
                          <IonLabel className="fs-14 fwp-400">
                            {t("MALE")}
                          </IonLabel>
                          <IonRadio
                            slot="start"
                            value="M"
                            className="mr-15"
                            {...register("gender")}
                          ></IonRadio>
                        </IonItem>
                      </IonCol>
                      <IonCol size="6">
                        <IonItem lines="none" className="mh--auto pl--0">
                          <IonLabel className="fs-14 fwp-400">
                            {t("FEMALE")}
                          </IonLabel>
                          <IonRadio
                            slot="start"
                            value="F"
                            {...register("gender")}
                            className="mr-15"
                          ></IonRadio>
                        </IonItem>
                      </IonCol>
                    </IonRow>
                  </IonRadioGroup>

                  <IonRow>
                    <IonCol>
                      <IonList className="py-0">
                        <IonItem lines="none" className="input-item-labeled">
                          <IonLabel
                            className="fs-16 fw-600 dark mb-9"
                            position="stacked"
                          >
                            {t("BUREAU_INPUT_HEADER_DOB")}*
                          </IonLabel>
                          <IonItem lines="none" className="input-item">
                            <IonInput
                              type="date"
                              class="d-flex label-input"
                              placeholder={t("YYYY-MM-DD")}
                              {...register("dob", {
                                required: {
                                  value: true,
                                  message: t("FIELD_REQUIRED"),
                                },
                              })}
                            ></IonInput>
                          </IonItem>
                          {formState.errors?.dob && (
                            <IonText color="danger">
                              {formState.errors?.dob?.message}
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
                            {t("BUREAU_INPUT_HEADER_AGE")} *
                          </IonLabel>
                          <IonItem lines="none" className="input-item">
                            <IonInput
                              type="number"
                              class="d-flex label-input"
                              placeholder=""
                              {...register("age", {
                                required: {
                                  value: true,
                                  message: t("FIELD_REQUIRED"),
                                },
                              })}
                            ></IonInput>
                          </IonItem>
                          {formState.errors?.age && (
                            <IonText color="danger">
                              {formState.errors?.age?.message}
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
                            {t("BUREAU_INPUT_HEADER_FATHER_NAME")}
                          </IonLabel>
                          <IonItem lines="none" className="input-item">
                            <IonInput
                              class="d-flex label-input"
                              placeholder=""
                              {...register("fathersName", {
                                required: {
                                  value: true,
                                  message: t("FIELD_REQUIRED"),
                                },
                              })}
                            ></IonInput>
                          </IonItem>
                          {formState.errors?.fathersName && (
                            <IonText color="danger">
                              {formState.errors?.fathersName?.message}
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
                            {t("BUREAU_INPUT_HEADER_FIRST_NAME")} *
                          </IonLabel>
                          <IonItem lines="none" className="input-item">
                            <IonInput
                              class="d-flex label-input"
                              placeholder=""
                              {...register("firstName", {
                                required: {
                                  value: true,
                                  message: t("FIELD_REQUIRED"),
                                },
                              })}
                            ></IonInput>
                          </IonItem>
                          {formState.errors?.firstName && (
                            <IonText color="danger">
                              {formState.errors?.firstName?.message}
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
                            {t("BUREAU_INPUT_HEADER_LAST_NAME")} *
                          </IonLabel>
                          <IonItem lines="none" className="input-item">
                            <IonInput
                              class="d-flex label-input"
                              placeholder=""
                              {...register("lastName", {
                                required: {
                                  value: true,
                                  message: t("FIELD_REQUIRED"),
                                },
                              })}
                            ></IonInput>
                          </IonItem>
                          {formState.errors?.lastName && (
                            <IonText color="danger">
                              {formState.errors?.lastName?.message}
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
                            {t("BUREAU_INPUT_HEADER_PAN")}*
                          </IonLabel>
                          <IonItem lines="none" className="input-item">
                            <IonInput
                              class="d-flex label-input"
                              placeholder=""
                              {...register("pan", {
                                required: {
                                  value: true,
                                  message: t("FIELD_REQUIRED"),
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
                            {t("BUREAU_INPUT_HEADER_MOBILE_NO")}*
                          </IonLabel>
                          <IonItem lines="none" className="input-item">
                            <IonInput
                              class="d-flex label-input"
                              placeholder=""
                              {...register("mobile", {
                                required: {
                                  value: true,
                                  message: t("FIELD_REQUIRED"),
                                },
                              })}
                            ></IonInput>
                          </IonItem>
                          {formState.errors?.mobile && (
                            <IonText color="danger">
                              {formState.errors?.mobile?.message}
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
                            {t("BUREAU_INPUT_HEADER_ADDRESS")}*
                          </IonLabel>
                          <IonItem lines="none" className="input-item">
                            <IonTextarea
                              class="label-input"
                              {...register("address", {
                                required: {
                                  value: true,
                                  message: t("FIELD_REQUIRED"),
                                },
                              })}
                              placeholder=""
                            ></IonTextarea>
                          </IonItem>
                          {formState.errors?.address && (
                            <IonText color="danger">
                              {formState.errors?.address?.message}
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
                            {t("BUREAU_INPUT_HEADER_EMAIL")}*
                          </IonLabel>
                          <IonItem lines="none" className="input-item">
                            <IonInput
                              class="d-flex label-input"
                              placeholder=""
                              {...register("email", {
                                required: {
                                  value: true,
                                  message: t("FIELD_REQUIRED"),
                                },
                              })}
                            ></IonInput>
                          </IonItem>
                          {formState.errors?.email && (
                            <IonText color="danger">
                              {formState.errors?.email?.message}
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
                            {t("BUREAU_INPUT_HEADER_PINCODE")}*
                          </IonLabel>
                          <IonItem lines="none" className="input-item">
                            <IonInput
                              class="d-flex label-input"
                              placeholder=""
                              {...register("pin", {
                                required: {
                                  value: true,
                                  message: t("FIELD_REQUIRED"),
                                },
                              })}
                            ></IonInput>
                          </IonItem>
                          {formState.errors?.pin && (
                            <IonText color="danger">
                              {formState.errors?.pin?.message}
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
                            {t("BUREAU_INPUT_HEADER_CITY")}*
                          </IonLabel>
                          <IonItem lines="none" className="input-item">
                            <IonInput
                              class="d-flex label-input"
                              placeholder=""
                              {...register("city", {
                                required: {
                                  value: true,
                                  message: t("FIELD_REQUIRED"),
                                },
                              })}
                            ></IonInput>
                          </IonItem>
                          {formState.errors?.city && (
                            <IonText color="danger">
                              {formState.errors?.city?.message}
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
                            {t("BUREAU_INPUT_HEADER_STATE")}*
                          </IonLabel>
                          <IonItem lines="none" className="input-item">
                            <IonInput
                              class="d-flex label-input"
                              placeholder=""
                              {...register("state", {
                                required: {
                                  value: true,
                                  message: t("FIELD_REQUIRED"),
                                },
                              })}
                            ></IonInput>
                          </IonItem>
                          {formState.errors?.state && (
                            <IonText color="danger">
                              {formState.errors?.state?.message}
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
                            {t("BUREAU_INPUT_HEADER_COUNTRY")}*
                          </IonLabel>
                          <IonItem lines="none" className="input-item">
                            <IonInput
                              class="d-flex label-input"
                              placeholder=""
                              {...register("country", {
                                required: {
                                  value: true,
                                  message: t("FIELD_REQUIRED"),
                                },
                              })}
                            ></IonInput>
                          </IonItem>
                          {formState.errors?.country && (
                            <IonText color="danger">
                              {formState.errors?.country?.message}
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
                            {t("BUREAU_INPUT_HEADER_VILLAGE")} *
                          </IonLabel>
                          <IonItem lines="none" className="input-item">
                            <IonInput
                              class="d-flex label-input"
                              placeholder=""
                              {...register("village", {
                                required: {
                                  value: true,
                                  message: t("FIELD_REQUIRED"),
                                },
                              })}
                            ></IonInput>
                          </IonItem>
                          {formState.errors?.village && (
                            <IonText color="danger">
                              {formState.errors?.village?.message}
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
                            text={t("GENERATE_BUREAU_REPORT")}
                            isLoading={submitLoading}
                            disabled={submitLoading}
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
                            shape="round"
                            className="clear-btn-gray"
                            fill="clear"
                            onClick={() => history.goBack()}
                          >
                            {t("CANCEL_CAP")}
                          </IonButton>
                        </div>
                      </div>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCardContent>
            </form>
          </IonCard>
        )}

        {action === "details" && (
          <IonCard class="primary-card no-border br-8 dark">
            <IonCardContent>
              <IonGrid className="p-0">
                <IonRow className="mb-10 ion-align-items-center">
                  <IonCol size="auto" className="pb-0">
                    <div className="fs-16 fw-600">{t("CRIF_REPORT_DETAILS")}</div>
                  </IonCol>
                  <IonCol size="">
                    <div className="card-divider"></div>
                  </IonCol>
                  <IonCol size="auto">
                    <div
                      className="primary-color"
                      onClick={() => {
                        setAction("edit");
                      }}
                    >
                      {t("CRIF_REPULL")}
                    </div>
                  </IonCol>
                </IonRow>
                <IonRow className="mb-10">
                  <IonCol size="" className="pb-0">
                    <div className="fs-14 fw-600">{t("CRIF_SCORE")}</div>
                    <div className="fs-12 fw-600">{bureauDetails.score}</div>
                  </IonCol>
                </IonRow>

                <IonRow className="mb-10">
                  <IonCol size="" className="pb-0">
                    <div className="fs-14 fw-600">{t("CRIF_DATE_OF_REQUEST")}</div>
                    <div className="fs-12 fw-600">{bureauDetails.dateOfRequest}</div>
                  </IonCol>
                </IonRow>

                <IonRow className="mb-10">
                  <IonCol size="" className="pb-0">
                    <div className="fs-14 fw-600">{t("CRIF_DATE_OF_ISSUE")}</div>
                    <div className="fs-14 fw-600">{bureauDetails.dateOfIssue}</div>
                  </IonCol>
                </IonRow>

                <IonRow className="mb-10">
                  <IonCol size="" className="pb-0">
                    <div className="fs-14 fw-600">{t("CRIF_REPORT_ID")}</div>
                    <div className="fs-12 fw-600">{bureauDetails.reportId}</div>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default CreditInformationReport;
