import {
  FormRenderer,
  useFormApi,
} from "@data-driven-forms/react-form-renderer";
import {
  IonButton,
  IonCheckbox,
  IonCol,
  IonContent,
  IonGrid,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRouterLink,
  IonRow,
  IonSpinner,
  IonText,
  IonPopover,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { Form } from "antd";
import _ from "lodash";
import React, { useRef, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { getCustomComponentMapper } from "../components/Form";
import { selectDropDownState } from "../components/Form/DynamicDropDown/DynamicDropDown.slice";
import { IGstRules } from "../utils/interfaces/BPInvite.interface";
import {
  EmailVerificationRequest,
  IRequestGSTOtp,
  IRequestGSTVerifyOtp,
  ISignupRequest,
  PhoneVerificationRequest,
  VerifyEmailRequest,
  VerifyPhoneRequest,
} from "../utils/interfaces/BPSelfSignUp.interface";
import { IInitialFormState } from "../utils/interfaces/DynamicDropDown.interface";
import { signOut } from "../utils/libs/cognito";
import { getFormSchema } from "../utils/services/BPInvite.Service";
import * as signUpService from "../utils/services/SelfSignUp.Service";
import { useAppDispatch, useAppSelector } from "../utils/store/hooks";
import * as userSlice from "../utils/store/user.slice";
import "./Page.css";
import { toast } from "react-toastify";
import { Constants } from "../utils/constants/constants";
import Loader from "../components/Loader";
import i18n from "../utils/translations";
import { ValidateUtils } from "../utils/utils/Validate.Utils";

const Signup: React.FC = () => {
  const popover = useRef<HTMLIonPopoverElement>(null);
  const [emailPopoverOpen, setEmailPopoverOpen] = useState(false);
  const [mobilePopoverOpen, setMobilePopoverOpen] = useState(false);
  const [passPopoverOpen, setPassPopoverOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const openEmialPopover = (e: any) => {
    popover.current!.event = e;
    setEmailPopoverOpen(true);
  };

  const openPassPopover = (e: any) => {
    popover.current!.event = e;
    setPassPopoverOpen(true);
  };

  const openMobilePopover = (e: any) => {
    popover.current!.event = e;
    setMobilePopoverOpen(true);
  };

  const { t } = useTranslation();

  const { inviteId } = useParams<{
    inviteId: string;
  }>();
  const {
    control,
    register,
    handleSubmit: handleRegisterSubmit,
    getValues: getFormValues,
    reset,
    formState,
    trigger: triggerFormValidation,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      businessName: "",
      selectOrganization: "",
      dateOfIncorporation: "",
      applicantMobile: "",
      applicantEmail: "",
      password: "",
      gstin: "",
      gstUsername: "",
      gstOtp: "",
      inviteId: "",
      firstName: "",
      lastName: "",
      fieldValues: "",
      applicationConfigId: "",
      existingBusinessPartnerId: "",
      registerAsAnchor: "",
    },
  });

  const [isConsentAccepted, setIsConsentAccepted] = useState(false);
  const [showConsentErr, setShowConsentErr] = useState(false);

  const [disableGstVerifyWithOtpBtn, setDisableGstVerifyWithOtpBtn] =
    useState(true);
  const [basicFormIsValid, setBasicFormIsValid] = useState(false);
  const [disableGstUsernameProceedBtn] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [inviteData, setInviteData] = useState<ISignupRequest>();
  const [disableGstVerifyOtpBtn] = useState(false);
  const [showGstUsername, setShowGstUsername] = useState(false);
  const [showGstOtp, setShowGstOtp] = useState(false);
  const [gstOtpVerified, setGstOtpVerified] = useState(true);
  const [gstOtpSendLoader, setGstOtpSendLoader] = useState(false);
  const [gstOtpVerifyLoader, setGstOtpVerifyLoader] = useState(false);

  const [disableEmailVerifyWithOtpBtn, setDisableEmailVerifyWithOtpBtn] =
    useState(true);
  const [disableEmailVerifyOtpBtn] = useState(false);
  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [emailOtpSendLoader, setEmailOtpSendLoader] = useState(false);
  const [emailOtpVerifyLoader, setEmailOtpVerifyLoader] = useState(false);

  const [disableMobileVerifyWithOtpBtn, setDisableMobileVerifyWithOtpBtn] =
    useState(true);
  const [disableMobileVerifyOtpBtn, setDisableMobileVerifyOtpBtn] =
    useState(false);
  const [showMobileOtp, setShowMobileOtp] = useState(false);
  const [mobileOtp, setMobileOtp] = useState("");
  const [mobileOtpVerified, setMobileOtpVerified] = useState(false);
  const [mobileOtpSendLoader, setMobileOtpSendLoader] = useState(false);
  const [mobileOtpVerifyLoader, setMobileOtpVerifyLoader] = useState(false);
  const [formSchema, setFormSchema] = useState<any>();
  const [formConfigToRender, setFormConfigToRender] = useState<any[]>([]);
  const [fieldValues, setFieldValues] = useState<any>();
  const [additionalFormState, setAdditionalFormState] = useState({});
  const [isAdditionalDetailsValid, setIsAdditionalDetailsValid] =
    useState<boolean>(false);
  const [showAdditionalError, setShowAdditionalError] = useState(false);
  const navigate = useHistory();
  const [gstRules, setGstRules] = useState<IGstRules>({
    INVITE_DISPLAY: "YES",
    BP_DISPLAY: "YES",
    INVITE_VALIDATION: "LVL_1",
    BP_VALIDATION: "LVL_2",
  });
  const [displayTabStatus, setDisplayTabStatus] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const [passwordShown, setPasswordShown] = useState<boolean>(false);
  const [appConfigId, setAppConfigId] = useState("");
  const [userEnteredGst, setUserEnteredGst] = useState(false);

    function gstinChange(event) {
        const GSTIN = _.get(event, 'detail.value');
        if (_.isEmpty(GSTIN))
        {
          setGstOtpVerified(true);
          setUserEnteredGst(false);
        } 
        if (!_.isEmpty(GSTIN)) setUserEnteredGst(true);
        if (gstOtpVerified && !_.isEmpty(GSTIN)) setGstOtpVerified(false);
        if (showGstUsername) setShowGstUsername(false);
        if (showGstOtp) setShowGstOtp(false);

    let pattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
    setDisableGstVerifyWithOtpBtn(!GSTIN.match(pattern));
  }

  useEffect(() => {
    if (!inviteData) return;
    (async () => {
      let apiRes = await getFormSchema(inviteData.enterpriseFormConfigKey);
      let res = apiRes.data;
      setFormSchema(res);
    })();
  }, [inviteData]);

  const fetchData = async () => {
    if (inviteId) {
      let apiRes = await signUpService.retrieveDataFromInvite({
        businessPartnerInviteId: inviteId,
      });
      let res = apiRes.data;

      const { statusCode, businessPartnerInvite } = res;
      switch (statusCode) {
        case "VALID": {
          setInviteData(res.businessPartnerInvite);
          setFieldValues(res.businessPartnerInvite.fieldValues);
          setAppConfigId(res.businessPartnerInvite.applicationConfigId);
          await fetchConfig(res.businessPartnerInvite.applicationConfigId);
          reset({
            businessName: businessPartnerInvite.businessName,
            applicantEmail: businessPartnerInvite.applicantEmail,
            applicantMobile: businessPartnerInvite.applicantMobile,
          });

          break;
        }
        default: {
          toast.error(t("INVITATION_EXPIRED"));
        }
      }
    }
  };

  const fetchConfig = async (appConfigId: string) => {
    let apiRes = await signUpService.getApplicationConfigFromId(appConfigId);
    let res = apiRes.data;
    setGstRules(res.gstRules);
  };

  useEffect(() => {
    fetchData();
    signOut(() => {
      dispatch(userSlice.logOut({ redirect: false, cb: () => {} }));
    });
  }, []);

  function mobileChange(e) {
    if (mobileOtpVerified) setMobileOtpVerified(false);
    if (showMobileOtp) setShowMobileOtp(false);

    const text = e.detail.value;
    let pattern = /^\d{10}$/i;
    setDisableMobileVerifyWithOtpBtn(!text.match(pattern));
  }

  function emailChange(event) {
    if (emailOtpVerified) setEmailOtpVerified(false);
    if (showEmailOtp) setShowEmailOtp(false);

    const emailId = _.get(event, 'detail.value', "");
    setDisableEmailVerifyWithOtpBtn(!ValidateUtils.isEmailForSignUpValid(emailId));

  }

  function verifyGstWithOtp() {
    setShowGstUsername(true);
  }
  async function sendGstUserOtp() {
    const requestGstVerificationOtpRequest: IRequestGSTOtp = {
      gstin: getFormValues("gstin"),
      gstUsername: getFormValues("gstUsername"),
    };
    setGstOtpSendLoader(true);
    const apiRes = await signUpService.requestGstVerificationOtp(
      requestGstVerificationOtpRequest
    );
    const res = apiRes.data;
    if (res.statusCode === "OTP_SENT") {
      setShowGstOtp(true);
    } else if (res.statusCode === "VERIFIED") {
      setGstOtpVerified(true);
      setShowGstOtp(false);
    }
    toast(res.message);
    setGstOtpSendLoader(false);
  }

  async function verifyUserGstOtp() {
    const requestGstVerificationOtpRequest: IRequestGSTVerifyOtp = {
      gstin: getFormValues("gstin"),
      gstUsername: getFormValues("gstUsername"),
      otp: getFormValues("gstOtp"),
    };
    setGstOtpVerifyLoader(true);
    const apiRes = await signUpService.verifytGstOtp(
      requestGstVerificationOtpRequest
    );
    const res = apiRes.data;
    if (res.statusCode === "VERIFIED") {
      setGstOtpVerified(true);
      setShowGstOtp(false);
    } else {
      toast.error(res.message);
    }
    setGstOtpVerifyLoader(false);
  }

  async function sendUserMobileOtp() {
    const sendOtpPayload: PhoneVerificationRequest = {
      phone: getFormValues("applicantMobile"),
      fname: getFormValues("firstName"),
      lname: getFormValues("lastName"),
    };
    setMobileOtpSendLoader(true);
    const res = await signUpService.requestPhoneVerification(sendOtpPayload);
    setShowMobileOtp(true);
    toast(res.message);
    setMobileOtpSendLoader(false);
  }

  async function verifyUserMobileOtp() {
    const verifyOtpPayload: VerifyPhoneRequest = {
      phone: getFormValues("applicantMobile"),
      otp: mobileOtp,
    };
    setMobileOtpVerifyLoader(true);
    const apiRes = await signUpService.verifyPhone(verifyOtpPayload);
    const res = apiRes.data;
    if (res.success) {
      setMobileOtpVerified(true);
      setShowMobileOtp(false);
    } else {
      toast.error(res.message);
    }
    setMobileOtpVerifyLoader(false);
  }

  async function sendUserEmailOtp() {
    const sendOtpPayload: EmailVerificationRequest = {
      email: getFormValues("applicantEmail"),
      fname: getFormValues("firstName"),
      lname: getFormValues("lastName"),
    };
    setEmailOtpSendLoader(true);
    const res = await signUpService.requestEmailVerification(sendOtpPayload);
    setShowEmailOtp(true);
    toast(res.message);
    setEmailOtpSendLoader(false);
  }

  async function verifyUserEmailOtp() {
    const verifyOtpPayload: VerifyEmailRequest = {
      email: getFormValues("applicantEmail"),
      otp: emailOtp,
    };
    setEmailOtpVerifyLoader(true);
    const apiRes = await signUpService.verifyEmail(verifyOtpPayload);
    const res = apiRes.data;
    if (res.success) {
      setEmailOtpVerified(true);
      setShowEmailOtp(false);
    } else {
      toast.error(res.message);
    }
    setEmailOtpVerifyLoader(false);
  }

  const otherValidations = (canShowToast = true) => {
    let message = "";
    let isValid = true;
    if (_.includes(["LVL_2"], gstRules?.BP_VALIDATION)) {
      if (!gstOtpVerified) {
        message = "Verify Gst otp";
        isValid = false;
      }
    }

    if (!mobileOtpVerified) {
      message = "Verify mobile otp";
      isValid = false;
    }
    if (!isConsentAccepted) {
      isValid = false;
      setShowConsentErr(true);
    } else {
      setShowConsentErr(false);
    }
    if (canShowToast && !isValid && message) toast(message);
    return isValid;
  };

  const basicSignupValidation = async (triggerErrors: boolean) => {
    let isFormValid = triggerErrors
      ? await triggerFormValidation()
      : formState.isValid;
    let valid = false;
    if (isFormValid) {
      valid = otherValidations(triggerErrors);
    } else {
      valid = false;
    }
    setBasicFormIsValid(valid);
    return valid;
  };

  const basicSignup = async () => {
    if (await basicSignupValidation(true)) {
      setSelectedTab(1);
    }
  };

  const isAdditionalFormAvailable = () => {
    return !_.isEmpty(formConfigToRender);
  };

  // const isAdditionalFormAvailable = () => {
  //   return true;
  // };

  const signup = async (fieldValues: Object = {}) => {
    if (!isAdditionalFormAvailable()) fieldValues = {};
    if (!(await basicSignupValidation(true))) return;
    let data = getFormValues();
    const signUpRequest: ISignupRequest = {
      businessName: data.businessName,
      applicantMobile: data.applicantMobile,
      applicantEmail: data.applicantEmail,
      password: data.password,
      gstin: data.gstin,
      inviteId: inviteId ?? "",
      firstName: data.firstName,
      lastName: data.lastName,
      fieldValues: fieldValues,
      applicationConfigId: appConfigId,
      registerAsAnchor: "NO",
      isConsentAccepted: isConsentAccepted,
    };

    setSubmitLoading(true);
    const apiRes = await signUpService.signup(signUpRequest);
    setSubmitLoading(false);
    const res = apiRes.data;
    if (res.statusCode === "ERROR") {
      var errMsg = t("SOMETHING_WENT_WRONG");
      if (res.message) errMsg = res.message;
      toast.error(errMsg);
    } else if (res.statusCode === "USER_ALREADY_EXIST") {
      toast.error(t("USER_ALREADY_EXISTS"));
    } else if (res.statusCode === "SUCCESS") {
      var message = t("SIGN_UP_SUCCESSFUL");
      if (res.message) {
        message = res.message;
      }
      toast.success(message);

      navigate.replace("/login");
    }
  };

  const FormTemplate = (props: any) => {
    const {
      handleSubmit,
      getState,
      change,
      initialize,
      resumeValidation,
      getFieldState,
      focus,
      blur,
    } = useFormApi();
    // @ts-ignore
    const initialStateValues =
      useAppSelector<IInitialFormState>(selectDropDownState);
    useEffect(() => {
      let existingFormState = _.omitBy(additionalFormState, _.isEmpty);
      if (!_.isEmpty(existingFormState)) {
        initialize(existingFormState);
        setIsAdditionalDetailsValid(getState().valid);
      }
      _.forEach(formConfigToRender, ({ name }) => {
        let validationResult = _.get(getFieldState(name), "valid", false);
        !validationResult && showAdditionalError && blur(name);
      });
    }, [additionalFormState, showAdditionalError]);
    const fields = _.map(props.formFields, (field) => {
      if (field.props.component === "select")
        return {
          ...field,
          props: {
            ...field.props,
            onChange: (value: string) => {
              change(field.key, value);
              const formattedInitialState = _.omitBy(
                initialStateValues.formState,
                _.isEmpty
              );
              const currentFormState = _.omitBy(getState().values, _.isEmpty);

              setAdditionalFormState({
                ...formattedInitialState,
                ...currentFormState,
                [field.key]: value,
              });
            },
          },
        };
      return field;
    });

    return (
      <Form
        layout={"vertical"}
        id="bp-signup-form"
        onSubmitCapture={(event) => {
          let formattedInitialState = _.omitBy(
            initialStateValues.formState,
            _.isEmpty
          );
          let currentFormState = _.omitBy(getState().values, _.isEmpty);
          event.preventDefault();
          handleSubmit();
          const updatedStateValue = {
            ...formattedInitialState,
            ...currentFormState,
          };
          setAdditionalFormState({ ...additionalFormState, updatedStateValue });
          setIsAdditionalDetailsValid(getState().valid);
        }}
        // @ts-ignore
        onChange={(e) => {
          const name: any = _.get(e, "target.name");
          const value = _.get(e, "target.value");
          change(name, value);
          const formattedInitialState = _.omitBy(
            initialStateValues.formState,
            _.isEmpty
          );
          const currentFormState = _.omitBy(getState().values, _.isEmpty);
          let additionalObj = {
            ...additionalFormState,
            ...formattedInitialState,
            ...currentFormState,
            [name]: value,
          };
          setAdditionalFormState(additionalObj);
        }}
      >
        {fields}
      </Form>
    );
  };

  useEffect(() => {
    let config: any[] = [];
    let currentFormState = _.omitBy(additionalFormState, _.isEmpty);
    if (!_.isEmpty(currentFormState)) {
      formSchema?.config.forEach((formConfig: any) => {
        const value = _.get(currentFormState, formConfig.name, "");
        config.push({ ...formConfig, initialValue: value });
      });
      setFormConfigToRender(config);
    }
  }, [additionalFormState]);

  useEffect(() => {
    let config: any[] = [];
    if (formSchema?.config) {
      formSchema.config.forEach((formConfig: any) => {
        const value = _.get(fieldValues, formConfig.name, "");
        config.push({ ...formConfig, initialValue: value });
      });
    }
    setFormConfigToRender(config);
  }, [formSchema, fieldValues]);

  return (
    <IonPage className="login-page signup-page pt-11">
      {submitLoading ? (
        <IonContent>
          <Loader isloading={submitLoading} />
        </IonContent>
      ) : (
        <IonContent className="white ion-padding">
          {/* Logo section */}
          <section className="logo">
            <IonItem lines="none" className="">
              <IonImg className="" src="./img/logo-text.svg"></IonImg>
            </IonItem>
          </section>

          <section className="signup-text">
            <IonGrid>
              <IonRow>
                <IonCol className="">
                  <p>
                    {t("ALREADY_HAVE_ACCOUNT")}{" "}
                    <IonRouterLink
                      routerLink="/login"
                      className="primary-color fw-600"
                    >
                      {t("SIGN_IN")}
                    </IonRouterLink>
                  </p>
                </IonCol>
              </IonRow>
            </IonGrid>
          </section>
          <section className="signup-text">
            <IonGrid>
              <IonRow>
                <IonCol>
                  <h1 className="fs-24 fw-700 lh-34">{t("SIGN_UP")}</h1>
                  <p className="">{t("SIGN_UP_NOTE")}</p>
                </IonCol>
              </IonRow>
            </IonGrid>
          </section>

          <Tabs
            className="custom-tabs"
            selectedIndex={selectedTab}
            onSelect={(index) => setSelectedTab(index)}
          >
            <TabList className="ion-justify-content-start px-10 signup-tabs">
              <Tab className="ml-10 fs-16 react-tabs__tab">
                {t("FIELDS_TAB")}
                {displayTabStatus && (
                  <>
                    <span style={{ marginRight: 10 }} />
                    <img
                      style={{
                        width: "15px",
                        height: "15px",
                      }}
                      src={
                        basicFormIsValid
                          ? "https://actyv-platform-assets.s3.ap-south-1.amazonaws.com/icons/big-tick.svg"
                          : "https://actyv-platform-assets.s3.ap-south-1.amazonaws.com/icons/error.svg"
                      }
                      alt=""
                    />
                  </>
                )}
              </Tab>
             
              {isAdditionalFormAvailable() && (
                <Tab className="fs-16 react-tabs__tab">
                  {t("ADDITIONAL_INFO")}
                  {displayTabStatus && (
                    <>
                      <span style={{ marginRight: 10 }} />
                      <img
                        style={{
                          width: "15px",
                          height: "15px",
                        }}
                        src={
                          isAdditionalDetailsValid
                            ? "https://actyv-platform-assets.s3.ap-south-1.amazonaws.com/icons/big-tick.svg"
                            : "https://actyv-platform-assets.s3.ap-south-1.amazonaws.com/icons/error.svg"
                        }
                        alt=""
                      />
                    </>
                  )}
                </Tab>
              )}
            </TabList>
            <TabPanel>
              <div className="tab1">
                <section className="signup-form">
                  <form
                    onSubmit={
                      isAdditionalFormAvailable()
                        ? handleRegisterSubmit(basicSignup)
                        : handleRegisterSubmit(signup)
                    }
                  >
                    <IonGrid className="pb-0">

                      <IonRow>
                        <IonCol>
                          <IonList className="py-0">
                            <IonItem
                              lines="none"
                              className="input-item-labeled"
                            >
                              <IonLabel
                                className="fs-13 mb-9 label-sm"
                                position="stacked"
                              >
                                {t("BUSINESS_NAME")} *
                              </IonLabel>
                              <IonItem lines="none" className="input-item">
                                <IonInput
                                  class="d-flex label-input"
                                  placeholder={t("BUSINESS_NAME")}
                                  {...register("businessName", {
                                    required: {
                                      value: true,
                                      message: t("FIELD_REQUIRED"),
                                    },
                                  })}
                                ></IonInput>
                              </IonItem>
                              {formState.errors?.businessName && (
                                <IonText color="danger">
                                  {formState.errors?.businessName?.message}
                                </IonText>
                              )}
                            </IonItem>
                          </IonList>
                        </IonCol>
                      </IonRow>

                      <IonRow className="ion-align-items-end">
                        {gstRules?.BP_DISPLAY === "YES" && (
                          <IonCol size="7">
                            <IonList className="py-0">
                              <IonItem
                                lines="none"
                                className="input-item-labeled"
                              >
                                <IonLabel
                                  className="fs-13 mb-9 label-sm"
                                  position="stacked"
                                >
                                  {t("GSTIN_HEADING")}{" "}
                                  
                                </IonLabel>
                                <IonItem lines="none" className="input-item">
                                  <IonInput
                                    class="d-flex label-input"
                                    placeholder={t("GSTIN_HEADING")}
                                    onIonChange={gstinChange}
                                    {...register("gstin", {
                                      required: {
                                        value: false,
                                        message: t("FIELD_REQUIRED"),
                                      },
                                    })}
                                  ></IonInput>
                                </IonItem>
                                {formState.errors?.gstin && (
                                  <IonText color="danger">
                                    {formState.errors?.gstin?.message}
                                  </IonText>
                                )}
                              </IonItem>
                            </IonList>
                          </IonCol>
                        )}
                        {gstRules?.BP_VALIDATION === "LVL_2" && (
                          <IonCol size="5">
                            <IonRow className="ion-justify-content-between">
                              {
                                (! userEnteredGst)
                              
                              || (gstOtpVerified && (
                                <IonImg
                                  src="./img/check-success.svg"
                                  className="my-7"
                                ></IonImg>
                              )) || (
                                <IonRouterLink className="fs-11">
                                  <IonButton
                                    disabled={disableGstVerifyWithOtpBtn}
                                    onClick={verifyGstWithOtp}
                                    className="fs-9 my-0 button-expand"
                                    expand="block"
                                  >
                                    <IonLabel>{t("VERIFY_WITH_OTP")}</IonLabel>
                                  </IonButton>
                                </IonRouterLink>
                              )}
                            </IonRow>
                          </IonCol>
                        )}
                      </IonRow>
                      {showGstUsername && (
                        <IonRow className="ion-align-items-end">
                          <IonCol size="7">
                            <IonList className="py-0">
                              <IonItem
                                lines="none"
                                className="input-item-labeled"
                              >
                                <IonLabel
                                  className="fs-13 mb-9 label-sm"
                                  position="stacked"
                                >
                                  {t("GST_USERNAME")} *
                                </IonLabel>
                                <IonItem lines="none" className="input-item">
                                  <IonInput
                                    class="d-flex label-input"
                                    placeholder={t("GST_USERNAME")}
                                    {...register("gstUsername", {
                                      required: {
                                        value: true,
                                        message: t("FIELD_REQUIRED"),
                                      },
                                    })}
                                  ></IonInput>
                                </IonItem>
                                {formState.errors?.gstUsername && (
                                  <IonText color="danger">
                                    {formState.errors?.gstUsername?.message}
                                  </IonText>
                                )}
                              </IonItem>
                            </IonList>
                          </IonCol>
                          <IonCol size="5">
                            <IonRow className="ion-justify-content-between">
                              {(gstOtpVerified && (
                                <IonImg
                                  src="./img/check-success.svg"
                                  className="my-7"
                                ></IonImg>
                              )) || (
                                <IonRouterLink className="fs-11">
                                  <IonButton
                                    disabled={
                                      disableGstUsernameProceedBtn ||
                                      gstOtpSendLoader ||
                                      gstOtpVerified
                                    }
                                    onClick={sendGstUserOtp}
                                    className="fs-9 my-0 button-expand"
                                    expand="block"
                                  >
                                    {(gstOtpSendLoader && (
                                      <IonSpinner></IonSpinner>
                                    )) || <IonLabel>{t("PROCEED")}</IonLabel>}
                                  </IonButton>
                                </IonRouterLink>
                              )}
                            </IonRow>
                          </IonCol>
                        </IonRow>
                      )}
                      {showGstOtp && (
                        <IonRow className="ion-align-items-end">
                          <IonCol size="7">
                            <IonList className="py-0">
                              <IonItem
                                lines="none"
                                className="input-item-labeled"
                              >
                                <IonLabel
                                  className="fs-13 mb-9 label-sm"
                                  position="stacked"
                                >
                                  {t("GST_OTP")} *
                                </IonLabel>
                                <IonItem lines="none" className="input-item">
                                  <IonInput
                                    class="d-flex label-input"
                                    placeholder={t("OTP")}
                                    {...register("gstOtp", {
                                      required: {
                                        value: true,
                                        message: t("FIELD_REQUIRED"),
                                      },
                                    })}
                                  ></IonInput>
                                </IonItem>
                                {formState.errors?.gstOtp && (
                                  <IonText color="danger">
                                    {formState.errors?.gstOtp?.message}
                                  </IonText>
                                )}
                              </IonItem>
                            </IonList>
                          </IonCol>
                          <IonCol size="5">
                            <IonRow className="ion-justify-content-between">
                              <IonRouterLink className="fs-11">
                                <IonButton
                                  disabled={
                                    disableGstVerifyOtpBtn || gstOtpVerifyLoader
                                  }
                                  onClick={verifyUserGstOtp}
                                  className="fs-9 my-0 button-expand"
                                  expand="block"
                                >
                                  {(gstOtpVerifyLoader && (
                                    <IonSpinner></IonSpinner>
                                  )) || <IonLabel>{t("VERIFY")}</IonLabel>}
                                </IonButton>
                              </IonRouterLink>
                            </IonRow>
                          </IonCol>
                        </IonRow>
                      )}

                      <IonRow>
                        <IonCol>
                          <IonList className="py-0">
                            <IonItem
                              lines="none"
                              className="input-item-labeled"
                            >
                              <IonLabel
                                className="fs-13 mb-9 label-sm"
                                position="stacked"
                              >
                                {t("APPLICANT_FNAME")} *
                              </IonLabel>
                              <IonItem lines="none" className="input-item">
                                <IonInput
                                  class="d-flex label-input"
                                  placeholder={t("APPLICANT_FNAME")}
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
                            <IonItem
                              lines="none"
                              className="input-item-labeled"
                            >
                              <IonLabel
                                className="fs-13 mb-9 label-sm"
                                position="stacked"
                              >
                                {t("APPLICANT_LNAME")} *
                              </IonLabel>
                              <IonItem lines="none" className="input-item">
                                <IonInput
                                  class="d-flex label-input"
                                  placeholder={t("APPLICANT_LNAME")}
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

                      <IonRow className="ion-align-items-end">
                        <IonCol size="7">
                          <IonList className="py-0">
                            <IonItem
                              lines="none"
                              className="input-item-labeled"
                            >
                              <IonLabel
                                className="fs-13 mb-9 label-sm"
                                position="stacked"
                              >
                                {t("APPLICANT_MOBILE")} *
                              </IonLabel>
                              <IonItem lines="none" className="input-item">
                                <IonInput
                                  class="d-flex label-input"
                                  placeholder={t("APPLICANT_MOBILE")}
                                  onIonChange={mobileChange}
                                  {...register("applicantMobile", {
                                    required: {
                                      value: true,
                                      message: t("FIELD_REQUIRED"),
                                    },
                                  })}
                                ></IonInput>
                              </IonItem>
                              {formState.errors?.applicantMobile && (
                                <IonText color="danger">
                                  {formState.errors?.applicantMobile?.message}
                                </IonText>
                              )}
                            </IonItem>
                          </IonList>
                        </IonCol>
                        <IonCol size="5">
                          <IonRow className="ion-justify-content-between">
                            {(mobileOtpVerified && (
                              <IonImg
                                src="./img/check-success.svg"
                                className="my-7"
                              ></IonImg>
                            )) || (
                              <IonRouterLink className="fs-11">
                                <IonButton
                                  disabled={
                                    disableMobileVerifyWithOtpBtn ||
                                    mobileOtpSendLoader ||
                                    mobileOtpVerified
                                  }
                                  onClick={sendUserMobileOtp}
                                  className="fs-9 my-0 button-expand"
                                  expand="block"
                                >
                                  {(mobileOtpSendLoader && (
                                    <IonSpinner></IonSpinner>
                                  )) || (
                                    <IonLabel>{t("VERIFY_WITH_OTP")}</IonLabel>
                                  )}
                                </IonButton>
                              </IonRouterLink>
                            )}

                            <IonImg
                              onClick={openMobilePopover}
                              className=""
                              src="./img/i-sign.svg"
                            ></IonImg>
                            <IonPopover
                              ref={popover}
                              isOpen={mobilePopoverOpen}
                              onDidDismiss={() => setMobilePopoverOpen(false)}
                            >
                              <IonContent class="ion-padding">
                                {Constants.MOBILE_POPOVER_TEXT}
                              </IonContent>
                            </IonPopover>
                          </IonRow>
                        </IonCol>
                      </IonRow>
                      {showMobileOtp && (
                        <IonRow className="ion-align-items-end">
                          <IonCol size="7">
                            <IonList className="py-0">
                              <IonItem
                                lines="none"
                                className="input-item-labeled"
                              >
                                <IonLabel
                                  className="fs-13 mb-9 label-sm"
                                  position="stacked"
                                >
                                  {t("MOBILE_OTP")} *
                                </IonLabel>
                                <IonItem lines="none" className="input-item">
                                  <IonInput
                                    class="d-flex label-input"
                                    placeholder={t("OTP")}
                                    value={mobileOtp}
                                    onIonChange={(e) =>
                                      setMobileOtp(e.detail.value)
                                    }
                                  ></IonInput>
                                </IonItem>
                              </IonItem>
                            </IonList>
                          </IonCol>
                          <IonCol size="5">
                            <IonRow className="ion-justify-content-between">
                              <IonRouterLink className="fs-11">
                                <IonButton
                                  disabled={
                                    disableMobileVerifyOtpBtn ||
                                    mobileOtpVerifyLoader ||
                                    mobileOtpVerified
                                  }
                                  onClick={verifyUserMobileOtp}
                                  className="fs-9 my-0 button-expand"
                                  expand="block"
                                >
                                  {(mobileOtpVerifyLoader && (
                                    <IonSpinner></IonSpinner>
                                  )) || <IonLabel>{t("VERIFY")}</IonLabel>}
                                </IonButton>
                              </IonRouterLink>
                            </IonRow>
                          </IonCol>
                        </IonRow>
                      )}

                      <IonRow className="ion-align-items-end">
                        <IonCol size="7">
                          <IonList className="py-0">
                            <IonItem
                              lines="none"
                              className="input-item-labeled"
                            >
                              <IonLabel
                                className="fs-13 mb-9 label-sm"
                                position="stacked"
                              >
                                {t("APPLICANT_EMAIL")} *
                              </IonLabel>
                              <IonItem lines="none" className="input-item">
                                <IonInput
                                  class="d-flex label-input"
                                  placeholder={t("APPLICANT_EMAIL")}
                                  onIonChange={emailChange}
                                  {...register("applicantEmail", {
                                    required: {
                                      value: true,
                                      message: t("FIELD_REQUIRED"),
                                    },
                                  })}
                                ></IonInput>
                              </IonItem>
                              {formState.errors?.applicantEmail && (
                                <IonText color="danger">
                                  {formState.errors?.applicantEmail?.message}
                                </IonText>
                              )}
                            </IonItem>
                          </IonList>
                        </IonCol>
                        <IonCol size="5">
                          <IonRow className="ion-justify-content-between">
                            {(emailOtpVerified && (
                              <IonImg
                                src="./img/check-success.svg"
                                className="my-7"
                              ></IonImg>
                            )) || (
                              <IonRouterLink className="fs-11">
                                <IonButton
                                  disabled={
                                    disableEmailVerifyWithOtpBtn ||
                                    emailOtpSendLoader
                                  }
                                  onClick={sendUserEmailOtp}
                                  className="fs-9 my-0 button-expand"
                                  expand="block"
                                >
                                  {(emailOtpSendLoader && (
                                    <IonSpinner></IonSpinner>
                                  )) || (
                                    <IonLabel>{t("VERIFY_WITH_OTP")}</IonLabel>
                                  )}
                                </IonButton>
                              </IonRouterLink>
                            )}
                            <IonImg
                              onClick={openEmialPopover}
                              className=""
                              src="./img/i-sign.svg"
                            ></IonImg>
                            <IonPopover
                              ref={popover}
                              isOpen={emailPopoverOpen}
                              onDidDismiss={() => setEmailPopoverOpen(false)}
                            >
                              <IonContent class="ion-padding">
                                {Constants.EMAIL_POPOVER_TEXT}
                              </IonContent>
                            </IonPopover>
                          </IonRow>
                        </IonCol>
                      </IonRow>

                      {showEmailOtp && (
                        <IonRow className="ion-align-items-end">
                          <IonCol size="7">
                            <IonList className="py-0">
                              <IonItem
                                lines="none"
                                className="input-item-labeled"
                              >
                                <IonLabel
                                  className="fs-13 mb-9 label-sm"
                                  position="stacked"
                                >
                                  {t("EMAIL_OTP")}
                                </IonLabel>
                                <IonItem lines="none" className="input-item">
                                  <IonInput
                                    class="d-flex label-input"
                                    placeholder={t("OTP")}
                                    value={emailOtp}
                                    onIonChange={(e) =>
                                      setEmailOtp(e.detail.value)
                                    }
                                  ></IonInput>
                                </IonItem>
                              </IonItem>
                            </IonList>
                          </IonCol>
                          <IonCol size="5">
                            <IonRow className="ion-justify-content-between">
                              <IonRouterLink className="fs-11">
                                <IonButton
                                  disabled={
                                    disableEmailVerifyOtpBtn ||
                                    emailOtpVerifyLoader
                                  }
                                  onClick={verifyUserEmailOtp}
                                  className="fs-9 my-0 button-expand"
                                  expand="block"
                                >
                                  {(emailOtpVerifyLoader && (
                                    <IonSpinner></IonSpinner>
                                  )) || <IonLabel>{t("VERIFY")}</IonLabel>}
                                </IonButton>
                              </IonRouterLink>
                            </IonRow>
                          </IonCol>
                        </IonRow>
                      )}

                      <IonRow>
                        <IonCol>
                          <IonList className="py-0">
                            <IonItem
                              lines="none"
                              className="input-item-labeled"
                            >
                              <IonLabel
                                className="fs-13 mb-9 label-sm"
                                position="stacked"
                              >
                                {t("CREATE_NEW_PASSWORD")} *
                              </IonLabel>
                              <IonItem lines="none" className="input-item">
                                <IonInput
                                  class="d-flex label-input"
                                  placeholder={t("PASSWORD")}
                                  type={passwordShown ? "text" : "password"}
                                  {...register("password", {
                                    required: {
                                      value: true,
                                      message: t("FIELD_REQUIRED"),
                                    },
                                  })}
                                ></IonInput>
                                {passwordShown ? (
                                  <IonImg
                                    src="./img/eye-show.svg"
                                    onClick={() => {
                                      setPasswordShown(!passwordShown);
                                    }}
                                  ></IonImg>
                                ) : (
                                  <IonImg
                                    src="./img/eye.svg"
                                    onClick={() => {
                                      setPasswordShown(!passwordShown);
                                    }}
                                  ></IonImg>
                                )}
                              </IonItem>
                              {formState.errors?.password && (
                                <IonText color="danger">
                                  {formState.errors?.password?.message}
                                </IonText>
                              )}
                            </IonItem>
                          </IonList>
                        </IonCol>
                        <IonImg
                          onClick={openPassPopover}
                          className="pt-18"
                          src="./img/i-sign.svg"
                        ></IonImg>
                        <IonPopover
                          ref={popover}
                          isOpen={passPopoverOpen}
                          onDidDismiss={() => setPassPopoverOpen(false)}
                        >
                          <IonContent
                            class="ion-padding"
                            dangerouslySetInnerHTML={{
                              __html: Constants.PASSWORD_POPOVER_TEXT,
                            }}
                          ></IonContent>
                        </IonPopover>
                      </IonRow>

                      <IonRow className="ion-align-items-center ion-justify-content-between">
                        <IonCol size="auto">
                          <IonItem>
                            <IonCheckbox
                              checked={isConsentAccepted}
                              onIonChange={(e) => {
                                setIsConsentAccepted(e.detail.checked);
                              }}
                              className="checkbox-custom"
                              slot="start"
                            ></IonCheckbox>
                            
                            <p className="fs-11 fw-100">
                              {t("ACCEPT_POLICY")}{" "}
                              <a
                                className="footer-links"
                                href={process.env.REACT_APP_TERMS}
                              >
                                <span className="primary-color">
                                  {t("TERMS")}
                                </span>
                              </a>{" "}
                              ,{" "}
                              <a href={process.env.REACT_APP_PRIVACY_POLICY}>
                                <span className="primary-color">
                                  {t("POLICY")}
                                </span>
                              </a>{" "}
                              {t("I_PROVIDE")}{" "}
                              <a href={process.env.REACT_APP_CONSENT}>
                                <span className="primary-color">
                                  {t("MY_CONSENT")}
                                </span>
                              </a>{" "}
                              {t("CREDIT_INFO")}{" "}
                              <a
                                href={
                                  process.env.REACT_APP_TERMS_AND_CONDITIONS
                                }
                              >
                                <span className="primary-color">
                                  {t("CONDITIONS")}
                                </span>
                              </a>{" "}
                              {t("SERVICES")}{" "}
                            </p>
                          </IonItem>

                          {showConsentErr && (
                            <IonText color="danger">
                              {t("FIELD_REQUIRED")}
                            </IonText>
                          )}
                        </IonCol>
                      </IonRow>
                      <IonRow>
                        <IonCol>
                          <IonRouterLink className="fs-11">
                            <IonButton
                              className="button-expand"
                              expand="block"
                              type="submit"
                            
                            >
                              {isAdditionalFormAvailable()
                                ? t("NEXT")
                                : "Submit"}
                            </IonButton>
                          </IonRouterLink>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </form>
                </section>
              </div>
            </TabPanel>
            <TabPanel>
              <div className="tab2">
                <FormRenderer
                  schema={{ fields: formConfigToRender }}
                  componentMapper={getCustomComponentMapper({
                    entireConfig: formConfigToRender,
                  })}
                  FormTemplate={(props) => <FormTemplate {...props} />}
                  onSubmit={(response) => {
                    setDisplayTabStatus(true);
                    signup(response);
                  }}
                />
              </div>

              <IonGrid>
                <IonRow>
                  <IonCol className="pb-0">
                    <IonList className="py-0">
                      <IonItem lines="none" className="input-item">
                        <IonSelect
                          interface="popover"
                          mode="md"
                          placeholder="Number Of Vehicles *"
                          className="w-100 select-field"
                        >
                          <IonSelectOption value="apples">
                            Option 1
                          </IonSelectOption>
                          <IonSelectOption value="oranges">
                            Option 2
                          </IonSelectOption>
                          <IonSelectOption value="bananas">
                            Option 3
                          </IonSelectOption>
                        </IonSelect>
                      </IonItem>
                    </IonList>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol>
                    <IonList className="py-0">
                      <IonItem lines="none" className="input-item-labeled">
                        <IonLabel
                          className="fs-13 mb-9 label-sm"
                          position="stacked"
                        >
                          {t("OLD_DISTRIBUTER")} *
                        </IonLabel>
                        <IonItem lines="none" className="input-item">
                          <IonInput
                            class="d-flex label-input"
                            placeholder="Old Distributer"
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
                          className="fs-13 mb-9 label-sm"
                          position="stacked"
                        >
                          {t("BUSINESS_VINTAGE")} *
                        </IonLabel>
                        <IonItem lines="none" className="input-item">
                          <IonInput
                            class="d-flex label-input"
                            placeholder="Business Vintage"
                          ></IonInput>
                        </IonItem>
                      </IonItem>
                    </IonList>
                  </IonCol>
                </IonRow>

                <IonRow className="ion-align-items-center ion-justify-content-between">
                  <IonCol size="auto">
                    <IonItem lines="none">
                      <IonCheckbox slot="start"></IonCheckbox>

                      <p>{t("TERMS_AND_CONDITION")}</p>
                    </IonItem>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol>
                    <IonRouterLink className="fs-11">
                      <IonButton
                        className="button-expand"
                        expand="block"
                        type="submit"
                        form="bp-signup-form"
                        onClick={() => {
                          setShowAdditionalError(true);
                          setDisplayTabStatus(true);
                         
                        }}
                      >
                        {t("SUBMIT1")}
                      </IonButton>
                    </IonRouterLink>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </TabPanel>
          </Tabs>
        </IonContent>
      )}
    </IonPage>
  );
};

export default Signup;
