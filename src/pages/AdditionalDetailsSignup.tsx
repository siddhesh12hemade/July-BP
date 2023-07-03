import { IonButton, IonCheckbox, IonCol, IonContent, IonGrid, IonImg, IonInput, IonItem, IonLabel, IonList, IonPage, IonRouterLink, IonRow, IonSelect, IonSelectOption } from '@ionic/react';
import React from "react";
import { useTranslation } from 'react-i18next';
import './Page.css';


const AdditionalDetailsSignup: React.FC = () => {
    const { i18n, t } = useTranslation();
    return (
        <IonPage className='login-page'>
            <IonContent className='white ion-padding'>
                {/* Logo section */}
                <section className='logo'>
                    <IonItem lines='none' className='mt-55'>
                        <IonImg className='' src='./img/logo-text.svg'></IonImg>
                    </IonItem>
                </section>

                <section className='signup-text'>
                    <IonGrid>
                        <IonRow>
                            <IonCol className=''>
                                <p>{t("ALREADY_HAVE_ACCOUNT")}<IonRouterLink routerLink='/app/signin' className='primary-color fw-600'>
                                    {t( "SIGN_IN")}
                                </IonRouterLink></p>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </section>
                <section className='signup-text'>
                    <IonGrid >
                        <IonRow>
                            <IonCol>
                                <h1 className='fs-24 fw-700 lh-34'>{t("SIGN_UP")}</h1>
                                <p className=''>{t("SIGN_UP_NOTE")}</p>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </section>

                <section className='signup-form'>
                    <form>
                        <IonGrid className='pb-0'>
                            <IonRow>
                                <IonCol className='pb-0'>
                                    <IonList className='py-0'>
                                        <IonItem lines='none' className='input-item'>
                                            
                                            <IonSelect interface="popover" mode='md' placeholder="Number Of Vehicles *" className='w-100 select-field'>
                                                <IonSelectOption value="apples">Option 1</IonSelectOption>
                                                <IonSelectOption value="oranges">Option 2</IonSelectOption>
                                                <IonSelectOption value="bananas">Option 3</IonSelectOption>
                                            </IonSelect>
                                        </IonItem>
                                    </IonList>
                                </IonCol>
                            </IonRow>

                            <IonRow>
                                <IonCol>
                                    <IonList className='py-0'>
                                        <IonItem lines='none' className='input-item-labeled'>
                                            <IonLabel className='fs-13 mb-9 label-sm' position="stacked">{t("OLD_DISTRIBUTER")} *</IonLabel>
                                            <IonItem lines='none' className='input-item'>
                                                <IonInput class='d-flex label-input' placeholder='Old Distributer'>
                                                </IonInput>
                                            </IonItem>
                                        </IonItem>
                                    </IonList>
                                </IonCol>
                            </IonRow>

                            <IonRow>
                                <IonCol>
                                    <IonList className='py-0'>
                                        <IonItem lines='none' className='input-item-labeled'>
                                            <IonLabel className='fs-13 mb-9 label-sm' position="stacked">{t( "BUSINESS_VINTAGE")} *</IonLabel>
                                            <IonItem lines='none' className='input-item'>
                                                <IonInput class='d-flex label-input' placeholder='Business Vintage'>
                                                </IonInput>
                                            </IonItem>
                                        </IonItem>
                                    </IonList>
                                </IonCol>
                            </IonRow>


                            <IonRow className='ion-align-items-center ion-justify-content-between'>
                                <IonCol size='auto'>
                                    <IonItem lines='none'>
                                        <IonCheckbox slot="start"></IonCheckbox>
                                        
                                        <p>{t( "TERMS_AND_CONDITION")}</p>
                                    </IonItem>
                                </IonCol>
                            </IonRow>

                            <IonRow>
                                <IonCol>
                                    <IonRouterLink className='fs-11' routerLink='/app/otp'>
                                        <IonButton className='button-expand' expand='block'>
                                            {t("SIGN_UP_BUTTON")}
                                        </IonButton>
                                    </IonRouterLink>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </form>
                </section>
            </IonContent >
        </IonPage >
    );
};

export default AdditionalDetailsSignup;
