import {
  IonButtons,
  IonHeader,
  IonImg,
  IonMenuButton,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import React from "react";

const Header: React.FC = () => {
  return (
    // Common header
    <IonHeader className="menu-header ion-no-border">
      <IonToolbar className="native-white-bg">
        <IonButtons slot="start">
          <IonMenuButton className="sidebar-button" />
        </IonButtons>

        <IonTitle className="px-0 main-logo">
          <IonImg src="./img/logo-text.svg" className="mw-100"></IonImg>
        </IonTitle>

      
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
