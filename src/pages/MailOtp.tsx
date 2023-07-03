import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonImg,
  IonInput,
  IonItem,
  IonList,
  IonPage,
  IonRouterLink,
  IonRow,
} from "@ionic/react";
import React from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import LoginFooter from "../components/LoginFooter";
import { Constants } from "../utils/constants/constants";
import { ILoginState } from "../utils/interfaces/Login.interface";
import { otpBasedLogin } from "../utils/services/Login.Service";
import {
  getErrorsInOTPLoginRequest,
  getLoggedInUserContext,
} from "../utils/utils/Login.Utils";
import "./Page.css";
import { toast } from "react-toastify";

const MailOtp: React.FC = () => {
  const { register, handleSubmit, watch, setError, formState } = useForm({
    mode: "onChange",
    defaultValues: { otp: "8976171111" },
  });
  const history = useHistory();

  const loginWithOtp = async (loginState: ILoginState) => {
    const loginData = { phone: loginState.phone, otp: loginState.otp };
    const errors = getErrorsInOTPLoginRequest(loginData);
    const isUserLoginpDataInvalid = Object.values(errors).some(
      (val) => val.status === true
    );
    if (isUserLoginpDataInvalid) {
      return { errors, statusCode: "LOCAL_ERRORS", message: "" };
    } else {
      let res = await otpBasedLogin(loginData);
      if (res.statusCode === Constants.API_SUCCESS) {
        let res = await getLoggedInUserContext({
          currentBusinessPartnerId: "",
          returnToLogin: false,
        });
        history.push({
          pathname: "/app/business-partner",
        });
      } else {
        toast.error(res.message);
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
                  <h1 className="fs-24 fw-700 lh-34">Verify Email</h1>
                  <p className="">
                    We have noticed that your email is not verified. Please
                    enter the verification code sent to your email address
                    abc*******@gmail.com.
                  </p>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol className="pb-0">
                  <IonList className="pb-0">
                    <IonItem lines="none" className="input-item mb-13">
                      <IonInput
                        type="text"
                        {...register("otp", {
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
                    type="submit"
                    className="button-expand"
                    expand="block"
                  >
                    Verify
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
                  Did not get verification code?{" "}
                  <IonRouterLink className="primary-color fw-600">
                    Resend
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

export default MailOtp;
