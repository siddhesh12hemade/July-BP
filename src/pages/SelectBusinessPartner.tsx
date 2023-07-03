import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonIcon,
  IonPage,
  IonRow,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { checkmarkDoneCircle } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../components/Header";
import { IBusinessPartner } from "../utils/interfaces/App.interface";
import { getBusinessPartnerDetails } from "../utils/services/App.Service";
import { useAppDispatch, useAppSelector } from "../utils/store/hooks";
import {
  selectBusinessPartnerIds,
  setUserValue,
} from "../utils/store/user.slice";

const SelectBusinessPartner: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const [selectedIndex, setSelectedIndex] = useState<number>(null);
  const [dataList, setDataList] = useState<IBusinessPartner[]>([]);
  const businessPartnerIds = useAppSelector<string[]>(selectBusinessPartnerIds);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    async function getBusinessPartnerInfoToDisplay() {
      let list = [];
      setIsLoading(true);
      await Promise.all(
        businessPartnerIds.map(async (businessPartnerId) => {
          let businessPartnerApiRes = await getBusinessPartnerDetails(
            businessPartnerId
          );
          const businessPartner = businessPartnerApiRes.data;
          list.push(businessPartner);
        })
      );
      setDataList(list);
      setIsLoading(false);
    }

    getBusinessPartnerInfoToDisplay();
  }, []);

  const selectPartner = (index: number) => {
    setSelectedIndex(index);
  };

  const goNext = () => {
    let obj = dataList[selectedIndex];
    dispatch(setUserValue({ key: "businessPartner", value: obj }));
    dispatch(setUserValue({ key: "currentBusinessPartnerId", value: obj._id }));
    toast.success(t("LOGIN_SUCCESSFUL"));
    history.replace("/app/application-list");
  };
  return (
    <IonPage>
      <Header />
      {isLoading && (
        <IonContent fullscreen>
          <IonGrid>
            <IonRow class="ion-text-center">
              <IonCol>
                <IonSpinner
                  color="success"
                  justify-content-center
                  align-items-center
                  name="crescent"
                ></IonSpinner>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      )}

      {!isLoading && (
        <>
          <IonContent fullscreen>
            <IonGrid>
              <IonRow>
                <IonCol className="" size="auto">
                  <h4 className="ion-padding-horizontal fs-20 fw-700 dark">
                    {t("SELECT_BUSINESS_PARTNER")}
                  </h4>
                </IonCol>
              </IonRow>
            </IonGrid>

            <>
              {dataList.map((obj, index) => (
                <IonCard
                  onClick={() => selectPartner(index)}
                  className="primary-card br-8"
                >
                  <IonCardContent className="card-content">
                    <IonRow className="ion-align-items-center">
                      <IonCol size="10">
                        <IonRow className="ion-align-items-center">
                          <IonCol size="12">
                            <h4>
                              {t("BUSINESS_NAME")}: {obj.businessName}
                            </h4>
                          </IonCol>
                          {obj.gstin && (
                            <IonCol size="12">
                              <h4>
                                {t("BUSINESS_GSTIN")}: {obj.gstin}
                              </h4>
                            </IonCol>
                          )}
                        </IonRow>
                      </IonCol>
                      <IonCol size="2">
                        <div>
                          {selectedIndex === index && (
                            <IonIcon
                              slot="start"
                              ios={checkmarkDoneCircle}
                              md={checkmarkDoneCircle}
                            />
                          )}
                        </div>
                      </IonCol>
                    </IonRow>
                  </IonCardContent>
                </IonCard>
              ))}
            </>
          </IonContent>
          <IonFooter translucent={true}>
            <IonToolbar>
              <IonTitle>
                <IonButton
                  disabled={selectedIndex == null}
                  className="button-expand"
                  expand="block"
                  onClick={goNext}
                >
                  {t("CONTINUE")}
                </IonButton>
              </IonTitle>
            </IonToolbar>
          </IonFooter>
        </>
      )}
    </IonPage>
  );
};

export default SelectBusinessPartner;
