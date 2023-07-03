import {
  IonCol,
  IonContent,
  IonFooter,
  IonGrid, IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle, IonRow,
  IonToolbar
} from "@ionic/react";
import { useEffect, useState } from "react";

import createMatcher from 'feather-route-matcher';
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { signOut } from "../utils/libs/cognito";
import { useAppDispatch, useAppSelector } from "../utils/store/hooks";
import * as userSlice from "../utils/store/user.slice";
import "./Menu.css";
import _ from "lodash";

interface AppPage {
  url: string;
  title: string;
  custIcon: string;
}

const appPages: AppPage[] = [

  {
    title: "All Applications",
    url: "/app/application-list",
    custIcon: "./img/business-list.png",
  },
  {
    title: "Document Vault",
    url: "/cross-verification",
    custIcon: "./img/docu-vault.png",
  },
  


];

const Menu: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [currentPath, setCurrentPath] = useState("");
  const currentUser = useAppSelector(userSlice.selectUserState);
  let userImg = currentUser.logo;
  let userName = currentUser.firstName + " " + currentUser.lastName;
  if (_.size(userImg) === 0) {
    userImg = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
  }
  useEffect(() => {
    setCurrentPath(location.pathname);

  }, [location]);

  const { t } = useTranslation();

  const handleLogout = () => {
    signOut(() => {
      dispatch(userSlice.logOut({ redirect: true, cb: () => { } }));
    });
  };
  const isMenuDisabled = () => {
    let routeMatcher = createMatcher({
      '/app/signup/:inviteId': 'signup-invite',
      '/app/signup': 'signup',
      '/login': 'login',
      '/app/verify-otp': 'verify-otp',
      '/Login-otp': 'login-otp',
      '/select-business-partner': 'select-partner',
      '/forgotPassword': 'forgot-password',
    })
        
    if(routeMatcher(currentPath) != null)    
      return true
    else
      return false
  }

  return (
    <IonMenu disabled={isMenuDisabled()} className="side-menu" contentId="main" type="overlay">
      <IonContent className="white px--0">
        <IonListHeader className="profile-head">
          <IonGrid>
            <IonRow className="ion-align-items-center">
              <IonCol size="auto">
                <div className="menu-profile-wrap">
                  <IonImg
                    className="menu-profile-inner"
                    src={userImg}
                  ></IonImg>
                </div>
              </IonCol>
              <IonCol>
                <h4 className="white-heading fs-16 fw-600">{userName}</h4>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonListHeader>

        <IonList id="inbox-list" class="menu-list" lines="none">
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem
                  className={
                    location.pathname === appPage.url ? "selected" : ""
                  }
                  routerLink={appPage.url}
                  routerDirection="none"
                  lines="none"
                  detail={false}
                >
               
                  <IonImg
                    className="menu-icons"
                    src={appPage.custIcon}
                    alt="Icon"
                  ></IonImg>
                  <IonLabel className="dark fs-14 fw-400">
                    {appPage.title}
                  </IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>
      </IonContent>
      <IonFooter className="ion-no-border">
        <IonToolbar>
          <div>
            <IonItem className="ion-align-items-start menu-footer">
              <IonImg
                className="menu-icons mr-10"
                src="./img/partner-img/question.svg"
                alt="Icon"
              ></IonImg>
              <p className="fs-12 fw-400">
                {t("HAVING_TROUBLE_REACH_OUT_ACTYV_TEAM")}{" "}
                <a href={process.env.REACT_APP_HELP_URL} className='footer-links'>
                  <span className="primary-color">{t("HERE")}!</span>
                </a>
              </p>
            </IonItem>
            <IonMenuToggle autoHide={false}>
              <IonItem
                className='logout-btn'
                routerLink='/app-info'
                lines='none'
                detail={false}
              >
                <IonImg
                  className='mr-10 menu-icons'
                  src='./img/info.svg'
                  alt='Icon'
                ></IonImg>

                <IonLabel className='dark fs-14 fw-400'>{t("APP_INFO")}</IonLabel>
              </IonItem>
            </IonMenuToggle>
            <IonMenuToggle autoHide={false}>
              <IonItem className="logout-btn" onClick={handleLogout} lines="none" detail={false}>
                
                <IonImg
                  className="mr-10 menu-icons"
                  src="./img/logout.svg"
                  alt="Icon"
                ></IonImg>

                <IonLabel className="dark fs-14 fw-400">{t("LOGOUT")}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          </div>
        </IonToolbar>
      </IonFooter>
    </IonMenu>
  );
};

export default Menu;
