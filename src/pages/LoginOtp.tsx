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
  IonRow
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

const LoginOtp: React.FC = () => {
  const { register, handleSubmit, watch, setError, formState } = useForm({
    mode: "onChange",
    defaultValues: { phone: "8976171111" },
  });
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<IErrors>();
  const isBtnDisabled = () => {
    return !formState.isValid || loading;
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
      await sendLoginCode(sendCodeData);
      history.push({
        pathname: "/app/verify-otp",
      });
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
                <h1 className="fs-24 fw-700 lh-34">{t("LOGIN_WITH_OTP")}</h1>
                <p className="">{t("LOGIN_NOTE")}</p>
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
                        placeholder={t("EMAIL")}
                        {...register("phone", {
                          required: { value: true, message: "" },
                        })}
                      ></IonInput>
                      <IonImg src="./img/mail.svg" alt="mail-icon"></IonImg>
                    </IonItem>
                  </IonList>
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol>
                  <IonButton
                    disabled={isBtnDisabled()}
                    type="submit"
                    className="button-expand"
                    expand="block"
                  >
                    {t("SEND OTP")}
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
                    {t("SIGN_UP")}
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

export default LoginOtp;
