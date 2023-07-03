import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonRow,
} from "@ionic/react";
import { refresh } from "ionicons/icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./CaptchaComponent.css";

const VerifyCaptchaModal = ({
  onDismiss,
  captchaUrl,
}: {
  onDismiss: (data?: string | null | undefined | number, role?: string) => void;
  captchaUrl: string;
}) => {
  const [captchaText, setCaptchaText] = useState("");
  const { t } = useTranslation();
  return (
    <div className="captcha-container">
      <IonGrid className="mb-20">
        <IonRow>
          <IonCol>
            <h3 className="fs-18 fw-600 dark mb-10">{t("ENTER_CAPTCHA")}</h3>
            <p className="fs-14 fw-400 light">{t("ENTER_CAPTCHA_SUBTITLE")}</p>
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonGrid className="mb-15">
        <IonRow>
          <IonCol size="10">
            <IonImg className="" src={captchaUrl}></IonImg>
          </IonCol>
          <IonCol
            size="2"
            class="ion-justify-content-center ion-align-items-center ion-align-self-center"
          >
            <IonIcon
              ios={refresh}
              md={refresh}
              onClick={() => onDismiss(captchaText, "refresh")}
            />
          </IonCol>
        </IonRow>
      </IonGrid>
      <div className="mb-13">
        <IonLabel position="stacked"></IonLabel>
        <IonInput
          className="pt--0 captcha-field pb--0"
          placeholder={t("ENTER_TEXT_FROM_CAPTCHA")}
          value={captchaText}
          onIonChange={(e) => {
            setCaptchaText(e.target.value.toString());
          }}
        />
      </div>
      {}
      <IonGrid>
        <IonRow className="ion-justify-content-center">
          <IonCol size="auto" className="ion-text-center">
            <IonButton
              disabled={!captchaText}
              onClick={() => onDismiss(captchaText, "confirm")}
              
              className="fs-14 fw-500"
            >
              {t("Continue")}
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonButton
        className="captcha-close clear-btn-gray"
        fill="clear"
        onClick={() => onDismiss(null, "cancel")}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.6663 1.33398L1.33301 14.6673M14.6663 14.6673L1.33301 1.33398L14.6663 14.6673Z"
            stroke="#D9D9D9"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>

        {/* {t("X")} */}
      </IonButton>
    </div>
  );
};

export default VerifyCaptchaModal;
