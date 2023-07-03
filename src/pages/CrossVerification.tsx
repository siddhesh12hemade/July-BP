import {
  IonCol,
  IonContent,
  IonGrid, IonItem, IonPage, IonRow,
  IonSpinner
} from "@ionic/react";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from 'react-router-dom';
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import CrossValidationList from "../components/CrossValidationList";
import DocumentList from "../components/DocumentList";
import Header from "../components/Header";
import { IBusinessPartner } from "../utils/interfaces/App.interface";
import { ICrossValidation, IPlatformDocument } from "../utils/interfaces/DocumentVault.interface";
import { getBusinessPartnerPlatformConfig, getCrossValidations } from "../utils/services/DocumentVault.Service";
import { useAppSelector } from "../utils/store/hooks";
import { selectCurrentBusinessPartner, selectCurrentBusinessPartnerId } from "../utils/store/user.slice";
import { Helpers } from "../utils/utils/Helpers";
import "./Page.css";


const CrossVerification: React.FC = () => {

  const [documentConfig, setDocumentConfig] = useState<IPlatformDocument>(Object);
  const [crossValidation, setCrossValidation] = useState<ICrossValidation[]>([]);
  const currentBusinessPartnerId = useAppSelector<string>(selectCurrentBusinessPartnerId);
  const businessPartner = useAppSelector<IBusinessPartner>(selectCurrentBusinessPartner);
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation()
  // let location = useLocation()

  const history = useHistory();
  
  useEffect(() => {
    const unlisten = history.listen(() => {            
      if(history?.location?.pathname === '/cross-verification')
        fetchData(false)
    });    
    return () => {
      unlisten();
    };
  }, [history]);
  
  useEffect(() => {
    fetchData()    
  }, []);

  const documentsToVerify: unknown[] = [];
  Object.keys(documentConfig).map(documentKey => {
    documentsToVerify.push({
      ...documentConfig[documentKey as keyof IPlatformDocument],
      documentType: Helpers.checkDocumentTypeIsCustomComponent(documentKey) ? documentKey : null
    });
  });

  const groupedDocumentsToVerify: Record<string, Record<string, unknown>[]> = _.toPlainObject(_.groupBy(documentsToVerify, "displayName"));
  

  const fetchData = async (showLoader = true) => {
    if(showLoader)
      setIsLoading(true)
    let apiRes = await getBusinessPartnerPlatformConfig(currentBusinessPartnerId);
    let platformConfigRes = apiRes.data
    let crossValidationApiRes = await getCrossValidations(currentBusinessPartnerId)
    let crossValidation = crossValidationApiRes.data
    let documents = platformConfigRes.config.documents
    setDocumentConfig(documents)
    setCrossValidation(crossValidation)
    if(showLoader)
      setIsLoading(false)
  }

  return (
    <IonPage>
      <Header />

      {
        isLoading && (
          <IonContent fullscreen>
            <IonGrid>
              <IonRow class="ion-text-center">
                <IonCol>
                  <IonSpinner color="success" justify-content-center align-items-center name="crescent"></IonSpinner>
                </IonCol>
              </IonRow>
            </IonGrid>

          </IonContent>
        )}
      {
        !isLoading && (
          <IonContent fullscreen>
            <IonItem lines="none">

              <IonGrid className="pt-11 business-partner-header">
                <IonRow className="">
                  <h4 className="fs-14 fw-700">{t("WELCOME")} {_.get(businessPartner, "businessName", "")},</h4>

                  <p className="fs-12 fw-400 mt-15 mb-13">
                    {t("DOC_VAULT_INSTRUCTIONS")}
                  </p>
                </IonRow>
              </IonGrid>
            </IonItem>

            <Tabs className="custom-tabs">
              {/* Tab header start */}
              <TabList className="">
                <Tab className="fs-16 react-tabs__tab">{t("DOCUMENTS_TAB")}</Tab>
                <Tab className="fs-16 react-tabs__tab">{t("CROSS_VERIFICATION_HEADING")}</Tab>
              </TabList>
              {/* Tab header end */}

              {/* Tab content start */}

              {/* tab 1 start */}
              <TabPanel>

                <DocumentList
                  verificationData={groupedDocumentsToVerify}
                  applicationId={""}
                  status="DOCUMENT_CAPTURE"
                />

              </TabPanel>
              {/* tab 1 end */}

              {/* tab 2 start */}
              <TabPanel>

                <CrossValidationList data={crossValidation} />

              </TabPanel>
              {/* tab 2 end */}

              {/* Tab content start */}
            </Tabs>
          </IonContent>
        )}

    </IonPage>
  );
};

export default CrossVerification;
