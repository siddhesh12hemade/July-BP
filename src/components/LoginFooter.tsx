import { IonCol, IonGrid, IonRow, IonText } from '@ionic/react';
import React from "react";
import { useTranslation } from 'react-i18next';

const LoginFooter: React.FC = () => {
  const {t} = useTranslation();

  return (
    <section className='login-footer'>
      <IonGrid>
        <IonRow class='ion-justify-content-center'>
          <IonCol size='10'>
            <IonRow className='ion-justify-content-between'>

              <IonCol size='auto' className='pb-0 px-0'>
                <IonText className='fs-10 fw-600 primary-color'>
                  <a href={process.env.REACT_APP_TERMS} className='footer-links'>{t("TERMS")}</a>
                </IonText>
              </IonCol>
              <IonCol size='auto' className='pb-0 px-0'>
                <IonText className='fs-10 fw-600 primary-color'>
                  <a href={process.env.REACT_APP_PRIVACY_POLICY} className='footer-links'>{t("POLICY")}</a>
                </IonText>
              </IonCol>
              <IonCol size='auto' className='pb-0 px-0'><IonText className='fs-10 fw-600 primary-color'>
                <a href={process.env.REACT_APP_TERMS_AND_CONDITIONS} className='footer-links'>{t("CONDITIONS")}</a>
              </IonText>
              </IonCol>

              
            </IonRow>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <h6 className='ion-text-center fs-10 fw-300'>{t("ALL_RIGHTS_RESERVED")}
            </h6>
          </IonCol>
        </IonRow>
      </IonGrid>
    </section>

  );
};

export default LoginFooter;
