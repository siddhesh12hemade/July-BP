import {
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid, IonImg,
  IonPage,
  IonRow
} from "@ionic/react";
import React from "react";
import NotificationHeader from "../components/NotificationHeader";

const NotificationList: React.FC = () => {
  return (
    <IonPage>
      <NotificationHeader />

      <IonContent className="white" fullscreen>
        <IonGrid>
          <IonCard className="bg-notify no-shadow br-8">
            <IonCardContent className="card-content">
              <IonRow className="ion-align-items-start">
                <IonCol size="auto" className="pl-0 py-0">
                  <div className="profile-wrap profile-wrap-lg">
                    <IonImg className="with-profile d-none"></IonImg>
                    <h4 className="without-profile fs-22 fw-700">N</h4>
                  </div>
                </IonCol>
                <IonCol className="pr-0 py-0">
                  <h3 className="fs-16 fw-600">Neva Enterprises</h3>
                  <p className="fs-12 fw-400">
                   Application:1234567891 is initiated from Neva Enterprises.Please click on the invitation link to apply.
                    
                  </p>
                  <p className="absolute-tr fs-10 fw-400">
                    02 oct 2022,11.16 AM
                  </p>
                </IonCol>
              </IonRow>
            </IonCardContent>
          </IonCard>

          <IonGrid className="py-0">
            <IonRow>
              <IonCol className="py-0">
                <div className="card-divider"></div>
              </IonCol>
            </IonRow>
          </IonGrid>

          <IonCard className="bg-notify no-shadow br-8">
            <IonCardContent className="card-content">
              <IonRow className="ion-align-items-start">
                <IonCol size="auto" className="pl-0 py-0">
                  <div className="profile-wrap profile-wrap-lg">
                    <IonImg className="with-profile  d-none"></IonImg>
                    <h4 className="without-profile fs-22 fw-700">N</h4>
                  </div>
                </IonCol>
                <IonCol className="pr-0 py-0">
                  <h3 className="fs-16 fw-600">Neva Enterprises</h3>
                  <p className="fs-12 fw-400">
                  Application:1234567891 is approved by RSM in Neva Enterprise
                   
                  </p>
                  <p className="absolute-tr fs-10 fw-400">
                  2 oct 2022,11.16 AM
                  </p>
                </IonCol>
              </IonRow>
            </IonCardContent>
          </IonCard>

          <IonGrid className="py-0">
            <IonRow>
              <IonCol className="py-0">
                <div className="card-divider"></div>
              </IonCol>
            </IonRow>
          </IonGrid>

          <IonCard className="bg-notify no-shadow br-8">
            <IonCardContent className="card-content">
              <IonRow className="ion-align-items-start">
                <IonCol size="auto" className="pl-0 py-0">
                  <div className="profile-wrap profile-wrap-lg">
                    <IonImg className="with-profile  d-none"></IonImg>
                    <h4 className="without-profile fs-22 fw-700">M</h4>
                  </div>
                </IonCol>
                <IonCol className="pr-0 py-0">
                  <h3 className="fs-16 fw-600">MKM Distributors</h3>
                  <p className="fs-12 fw-400">
                  Application:1234567891 is pending for E-sign.Please click on link to complete e-sign process.
                    
                  </p>
                  <p className="absolute-tr fs-10 fw-400">
                  2 oct 2022,11.16 AM
                  </p>
                </IonCol>
              </IonRow>
            </IonCardContent>
          </IonCard>

          <IonGrid className="py-0">
            <IonRow>
              <IonCol className="py-0">
                <div className="card-divider"></div>
              </IonCol>
            </IonRow>
          </IonGrid>

          <IonCard className="bg-notify no-shadow br-8">
            <IonCardContent className="card-content">
              <IonRow className="ion-align-items-start">
                <IonCol size="auto" className="pl-0 py-0">
                  <div className="profile-wrap profile-wrap-lg">
                    <IonImg className="with-profile  d-none"></IonImg>
                    <h4 className="without-profile fs-22 fw-700">N</h4>
                  </div>
                </IonCol>
                <IonCol className="pr-0 py-0">
                  <h3 className="fs-16 fw-600">Neva Enterprises</h3>
                  <p className="fs-12 fw-400">
                  Application:1234567891 has been successfully E-signed by Neva Enterprises.
                    
                  </p>
                  <p className="absolute-tr fs-10 fw-400">
                  2 oct 2022,11.16 AM
                  </p>
                </IonCol>
              </IonRow>
            </IonCardContent>
          </IonCard>

          <IonGrid className="py-0">
            <IonRow>
              <IonCol className="py-0">
                <div className="card-divider"></div>
              </IonCol>
            </IonRow>
          </IonGrid>

          <IonCard className="no-shadow br-8">
            <IonCardContent className="card-content">
              <IonRow className="ion-align-items-start">
                <IonCol size="auto" className="pl-0 py-0">
                  <div className="profile-wrap profile-wrap-lg">
                    <IonImg className="with-profile  d-none"></IonImg>
                    <h4 className="without-profile fs-22 fw-700">M</h4>
                  </div>
                </IonCol>
                <IonCol className="pr-0 py-0">
                  <h3 className="fs-16 fw-600">MKM Distributors</h3>
                  <p className="fs-12 fw-400">
                  Application:1234567891 is completed for MKM Distributors.
                    
                  </p>
                  <p className="absolute-tr fs-10 fw-400">
                  2 oct 2022,11.16 AM
                  </p>
                </IonCol>
              </IonRow>
            </IonCardContent>
          </IonCard>

          <IonGrid className="py-0">
            <IonRow>
              <IonCol className="py-0">
                <div className="card-divider"></div>
              </IonCol>
            </IonRow>
          </IonGrid>
          
          <IonCard className="no-shadow br-8">
            <IonCardContent className="card-content">
              <IonRow className="ion-align-items-start">
                <IonCol size="auto" className="pl-0 py-0">
                  <div className="profile-wrap profile-wrap-lg">
                    <IonImg className="with-profile  d-none"></IonImg>
                    <h4 className="without-profile fs-22 fw-700">N</h4>
                  </div>
                </IonCol>
                <IonCol className="pr-0 py-0">
                  <h3 className="fs-16 fw-600">Neva Enterprises</h3>
                  <p className="fs-12 fw-400">
                  Application:1234567891 is rejected by RSM in Neva Enterprise
                    
                  </p>
                  <p className="absolute-tr fs-10 fw-400">
                  2 oct 2022,11.16 AM
                  </p>
                </IonCol>
              </IonRow>
            </IonCardContent>
          </IonCard>

          <IonGrid className="py-0">
            <IonRow>
              <IonCol className="py-0">
                <div className="card-divider"></div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default NotificationList;
