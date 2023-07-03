import {
    IonLabel,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonTabs
} from '@ionic/react';
import { useTranslation } from "react-i18next";
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import AdditionalDetailsSignup from './pages/AdditionalDetailsSignup';
import Signup from './pages/Signup';

const AppTabs: React.FC = () => {
    const { t } = useTranslation();
    return (
        <IonTabs>
            <IonRouterOutlet>
                <Route exact path='/app/signup/business_details'>
                    <Signup />
                </Route>
                <Route path='/app/signup/additional_details' component={AdditionalDetailsSignup} />
                    
                <Route exact path='/app/signup'>
                    <Redirect to='/app/signup/business_details' />
                </Route>
            </IonRouterOutlet>
            <IonTabBar slot='top'>
                <IonTabButton tab='business_details' href='/app/signup/business_details'>
                    <IonLabel>{t("BUSINESS_DETAILS")}</IonLabel>
                </IonTabButton>
               
            </IonTabBar>
        </IonTabs>
    );
};

export default AppTabs;
