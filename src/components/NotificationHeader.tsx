import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonImg,
  IonItem,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import React from "react";
import { useTranslation } from "react-i18next";

const NotificationHeader: React.FC = () => {
  const {t} = useTranslation();
  return (
    // Common header
    <IonHeader className="notify-header ion-no-border">
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton defaultHref="notification"></IonBackButton>
        </IonButtons>
        <IonTitle className="px-0">
          <h4 className="fs-20 fw-700">{t("NOTIFICATION")}</h4>
        </IonTitle>
        <IonItem lines="none" slot="end">
          <IonImg src="./img/notification.svg" className="mw-100"></IonImg>
        </IonItem>
      </IonToolbar>
    </IonHeader>
  );
};

export default NotificationHeader;
