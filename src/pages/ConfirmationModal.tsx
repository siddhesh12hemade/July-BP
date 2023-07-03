import {
  IonButton,
  IonCardContent,
  IonCol, IonGrid, IonRow
} from "@ionic/react";
import { useTranslation } from "react-i18next";

const ConfirmationModal = ({
  onDismiss,  
}: {
  onDismiss: (data?: string | null | undefined | number, role?: string) => void;
  
}) => {
  
  const { t } = useTranslation();
  return (
    <>
      <IonGrid>
        <IonRow className="ion-justify-content-center">
          <IonCol size="10">
            <div className="modal-text py-10">
              <p className="fs-18 fw-600 ion-text-center">
                {t("MODAL_HEADER")}
              </p>
            </div>
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonCardContent className="footer-gradient">
        <IonGrid>
          <IonRow className="">
            <IonCol size="6" className="ion-text-center">
              <IonButton shape="round" className="fs-18 fw-600  button-round button-solid" onClick={() => onDismiss(null, "yes")}>{t("MODAL_BTN_YES")}</IonButton>
            </IonCol>
            <IonCol size="6" className="ion-text-center">
              <IonButton fill="outline" shape="round" className="fs-18 fw-600 native-white-bg button-outline-primary button-round" onClick={() => onDismiss(null, "cancel")}>{t("CANCEL")}</IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonCardContent>
    </>
  );
};

export default ConfirmationModal;
