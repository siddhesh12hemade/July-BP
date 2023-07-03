import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonImg,
  IonInput,
  IonItem,
  IonItemDivider,
  IonList,
  IonPage,
  IonRouterLink,
  IonRow,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import LoginFooter from "../components/LoginFooter";
import { Constants } from "../utils/constants/constants";
import {
  IErrors,
  ISendLoginCodeReq,
} from "../utils/interfaces/Login.interface";
import { otpBasedLogin, sendLoginCode } from "../utils/services/Login.Service";
import {
  getErrorsInOTPLoginRequest,
  getLoggedInUserContext,
} from "../utils/utils/Login.Utils";
import "./Page.css";
import { toast } from "react-toastify";

const VerifyMobileOtp: React.FC = () => {
  const { register, handleSubmit } = useForm({
    mode: "onChange",
    defaultValues: { otp: "" },
  });
  const [mobile, setMobile] = useState("");
  const history = useHistory();
  const [errors, setErrors] = useState<IErrors>();
  const { t } = useTranslation();

  useEffect(() => {
    let mobile = new URLSearchParams(window.location.search).get("mobile");
    if (!mobile) {
      history.replace("/Login-otp");
    } else setMobile(mobile);
  }, []);

  const sendLoginOtp = async () => {
    let sendCodeData: ISendLoginCodeReq = {
      phone: mobile,
    };
    let res = await sendLoginCode(sendCodeData);
    if (res.success) {
      toast.success(t("OTP_SENT"));
    }
  };

  const loginWithOtp = async (data, error) => {
    const loginData = { phone: mobile, otp: data.otp };

    const errors = getErrorsInOTPLoginRequest(loginData);

    const isUserLoginpDataInvalid = Object.values(errors).some(
      (val) => val.status === true
    );
    if (isUserLoginpDataInvalid) {
      setErrors(errors);
      return { errors, statusCode: "LOCAL_ERRORS", message: "" };
    } else {
      let otpRes = await otpBasedLogin(loginData);
      if (otpRes.statusCode === Constants.API_SUCCESS) {
        let res = await getLoggedInUserContext({
          currentBusinessPartnerId: "",
          returnToLogin: false,
        });
        if (res.status) {
          if (res.multipleBusinessPartner) {
            history.replace({
              pathname: '/select-business-partner',
            });
          } else {
            toast.success(t("LOGIN_SUCCESSFUL"));
            history.replace({
              pathname: '/app/application-list',
            });
          }
        }
        
      } else {
        toast.error(otpRes.message);
      }
    }
  };
  return (
    <IonPage className="login-page">
      <IonContent className="white ion-padding">
        {/* Logo section */}
        <section className="logo">
          <IonItem lines="none" className="mb-40 mt-55">
            <IonImg className="mx-auto" src="./img/actyv-logo.svg"></IonImg>
          </IonItem>
        </section>

        <section className="login-text">
          <form onSubmit={handleSubmit(loginWithOtp)}>
            <IonGrid>
              <IonRow>
                <IonCol>
                  <h1 className="fs-24 fw-700 lh-34">{t("ENTER_OTP")}</h1>
                  <p className="fw-400 fs-14">
                  {t("PLEASE_ENTER_OTP_SENT_TO")}
                    <span className="fw-400 fs-14"> {mobile}</span> 
                  </p>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol className="pb-0">
                  <IonList className="pb-0">
                    <IonItem lines="none" className="input-item mb-13">
                      <IonInput
                        type="text"
                        placeholder={t("ENTER_OTP")}
                        {...register("otp")}
                      ></IonInput>
                    </IonItem>
                    {errors &&
                      errors.OTP.status &&
                      errors.OTP.messages.map((message, index) => (
                        <div key={index} className="validationError">
                          {message}
                        </div>
                      ))}
                  </IonList>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <IonButton
                    type="submit"
                    className="button-expand fs-12 fw-600"
                    expand="block"
                  >
                    {t("VERIFY")}
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </form>
        </section>

        <section className="signup-text">
          <IonGrid>
            <IonRow>
              <IonCol className="ion-text-right">
                <p className="fs-11 fw-400">
                  {t("DID_NOT_GET_OTP")}
                  <span
                    onClick={sendLoginOtp.bind(this)}
                    className="primary-color fw-600"
                  >
                    {t("RESEND_OTP")}
                  </span>
                </p>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol className="ion-text-right">
                <p className="fs-11 fw-400">
                  <IonRouterLink
                    className="primary-color fw-600"
                    routerLink="/Login-otp"
                  >
                    {t("TRY_DIFFRENT_NUMBER")}
                  </IonRouterLink>
                </p>
              </IonCol>
            </IonRow>
          </IonGrid>
        </section>
        <IonGrid class="mb-22">
          <IonRow>
            <IonCol>
              <IonItemDivider className="divider mh-auto">
                <p className="divider-text fs-11">{t("OR")}</p>
              </IonItemDivider>
            </IonCol>
          </IonRow>
        </IonGrid>

        <section>
          <IonGrid className="pt-0">
            <IonRow>
              <IonCol className="ion-text-center">
                <IonRouterLink className="fs-11" routerLink="/login">
                  <IonButton
                    expand="block"
                    className="button-outline  fs-12 fw-600"
                    fill="outline"
                  >
                    <IonImg
                      class="icon-space"
                      src="./img/buttons.svg"
                      alt="mail-icon"
                    ></IonImg>
                    {t("LOGIN_WITH_PASSWORD")}
                  </IonButton>
                </IonRouterLink>
              </IonCol>
            </IonRow>
          </IonGrid>
        </section>

        <section className="signup-text">
          <IonGrid>
            <IonRow>
              <IonCol className="ion-text-center">
                <p>
                  {t("DONT_HAVE_ACCOUNT")}
                  <IonRouterLink
                    routerLink='./signup'
                    className="primary-color fw-600"
                  >
                    {t("SIGN_UP1")}
                  </IonRouterLink>
                </p>
              </IonCol>
            </IonRow>
          </IonGrid>
        </section>

        <section className="foot-fix">
          <LoginFooter />
        </section>
      </IonContent>
    </IonPage>
  );
};

export default VerifyMobileOtp;
