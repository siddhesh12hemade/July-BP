import {
  IonButton, IonCol, IonContent, IonGrid, IonImg, IonInput, IonItem, IonItemDivider, IonList, IonPage, IonRouterLink, IonRow
} from "@ionic/react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import LoginFooter from "../components/LoginFooter";
import {
  IErrors,
  ISendLoginCodeReq
} from "../utils/interfaces/Login.interface";
import { sendLoginCode } from "../utils/services/Login.Service";
import { getErrorsInOTPGenerateRequest } from "../utils/utils/Login.Utils";
import "./Page.css";
import { toast } from "react-toastify";

const LoginMobile: React.FC = () => {
  const { register, handleSubmit, watch, setError, formState } = useForm({
    mode: "onChange",
    defaultValues: { phone: "" },
  });
  const {t} = useTranslation();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<IErrors>();

  const isBtnDisabled = () => {
    return loading;
  };
  const history = useHistory();
  const sendLoginOtp = async (sendCodeData: ISendLoginCodeReq) => {
    const errors = getErrorsInOTPGenerateRequest(sendCodeData);
    const isUserLoginpDataInvalid = Object.values(errors).some(
      (val) => val.status === true
    );
    if (isUserLoginpDataInvalid) {            
      setErrors(errors);
    } else {
      let otpRes = await sendLoginCode(sendCodeData);
      if(otpRes?.success){
        toast.success(otpRes?.message);
        history.push({
          pathname: "/app/verify-otp",
          search:
            "?" + new URLSearchParams({ mobile: sendCodeData.phone }).toString(),
        });
      }else{
        toast.error(otpRes?.message);
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
          <IonGrid>
            <IonRow>
              <IonCol>
                <h1 className="fs-24 fw-700 lh-34">{t("LOGIN")}</h1>
                <p className="">{t("LOGIN_WITH_OTP_NOTES")}</p>
              </IonCol>
            </IonRow>
          </IonGrid>
        </section>

        {/* login section */}
        <section className="login-form-wrapper mb-22">
          <form onSubmit={handleSubmit(sendLoginOtp)}>
            <IonGrid className="pb-0">
              <IonRow>
                <IonCol className="pb-0">
                  <IonList className="pb-0">
                    <IonItem lines="none" className="input-item mb-13">
                      <IonInput
                        type="tel"
                        placeholder={t("ENTER_MOBILE_NUMBER")}
                        {...register("phone")}
                      ></IonInput>
                    </IonItem>
                    {errors &&
                      errors.PHONE.status &&
                      errors.PHONE.messages.map((message, index) => (
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
                    disabled={isBtnDisabled()}
                    type="submit"
                    className="button-expand fs-12 fw-600"
                    expand="block"
                  >
                    {t("CONTINUE_UPPER")}
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </form>
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
                    routerLink="./app/signup"
                    className="primary-color fw-600"
                  >
                    {t("SIGN_UP1")}
                  </IonRouterLink>
                </p>
              </IonCol>
            </IonRow>
          </IonGrid>
        </section>

        <LoginFooter />

      </IonContent>
    </IonPage>
  );
};

export default LoginMobile;
