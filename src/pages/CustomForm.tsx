import {
  FormRenderer,
  Schema,
  useFormApi
} from "@data-driven-forms/react-form-renderer";
import {
  IonButton,
  IonCard,
  IonCardContent, IonContent,
  IonGrid,
  IonImg,
  IonItem,
  IonPage
} from "@ionic/react";
import { Form } from "antd";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import {
  getCustomComponentMapper,
  getValidationMapper
} from "../components/Form";
import Header from "../components/Header";
import Loader from "../components/Loader";
import { IInitialFormState } from "../utils/interfaces/Form.interface";
import { useAppDispatch, useAppSelector } from "../utils/store/hooks";
import { selectCurrentBusinessPartnerId } from "../utils/store/user.slice";
import {
  fetchFormConfigAsync,
  formatSaveFormData,
  makeGenericPostCallAsync,
  saveFormDataAsync,
  selectFormVerificationState,
  setState
} from "../utils/utils/Form.Utils";
interface RouteParams {
  applicationId: string;
  formKey: string;
  title: string;
  description: string;
}

const CustomForm: React.FC = () => {
  const { i18n, t } = useTranslation();
  const dispatch = useAppDispatch();
  let history = useHistory();
  const [loading, setLoading] = useState(false);

  const { state } = useLocation<RouteParams>();

  const title = _.get(state, "state.title");

  const description = _.get(state, "state.description");

  const formKey = _.get(state, "state.formKey");

  const applicationId = _.get(state, "state.applicationId");
  
  const initialStateValues = useAppSelector<IInitialFormState>(
    selectFormVerificationState
  );  

  const currentBusinessPartnerId = useAppSelector<string>(
    selectCurrentBusinessPartnerId
  );
  

  const {
    formConfig,
    saveFormDataStatus,
    formState,
    verificationLoaderStatus,
    fetchFormConfigStatus
  } = initialStateValues;


  useEffect(() => {
    dispatch(
      fetchFormConfigAsync({
        formKey,
        businessPartnerId: currentBusinessPartnerId,
        applicationId,
      })
    );
  }, [formKey]); //formKey

  const navigateToGoBack = () => {
    history.goBack();
  };

  useEffect(() => {
    if (saveFormDataStatus === "success") {
      dispatch(setState({ key: "saveFormDataStatus", value: "idle" }));
      dispatch(setState({ key: "formState", value: {} }));
      return navigateToGoBack();
    }
  }, [saveFormDataStatus]); ///saveFormDataStatus

  let formSchema: Schema = {
    fields: formConfig,
  };

  const FormTemplate = (props: any) => {
    const { handleSubmit, initialize } = useFormApi();

    useEffect(() => {
      return () => {
        // when form gets updated from external state and trying to re-initialize in form state for rendering
        !_.isEmpty(formState) && initialize(formState);
      };
    }, [formState]); //formState

    return (
      <Form
        id="my-form"
        layout={"vertical"}
        onSubmitCapture={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        {props.formFields}
      </Form>
    );
  };

  const shouldShowLoader = () =>{
    return fetchFormConfigStatus === 'loading' || loading
  }
  const isLoading = (loaderStatus: string) => {

    return loaderStatus === "loading" ? true : false;
  };

  const bankAccountVerifyHandle = (action: any, state: any) => {
    dispatch(makeGenericPostCallAsync({ ...action, state }));
  };

  let getInitialValues = () => {
    let initialValue = {};
    formSchema.fields.map((item) => {
      _.update(initialValue, item.key, () => {
        return item.initialValue
          ? item.initialValue
          : _.get(formState, `${item.key}`, "");
      });
      return initialValue;
    });
    return initialValue;
  };
  
  return (
    <IonPage>
      <Header />

      <IonContent fullscreen>
        
        <IonItem lines="none" className="pl--0 item-transparent mt-10 mb-13">
          <IonButton
            className="mr-6 h-auto"
            slot="start"
            fill="clear"
            onClick={() => history.goBack()}
          >
            <IonImg src="./img/partner-img/back-button.svg"></IonImg>
          </IonButton>
          <div className="">
            <h4 className="fs-20 fw-600">{title}</h4>
            <p className="fs-14 fw-400">{description}</p>
          </div>
        </IonItem>
        <Loader isloading={shouldShowLoader()} />
        {(!shouldShowLoader() && !_.isEmpty(formConfig) && fetchFormConfigStatus === 'success') && (
          <IonCard className="custom-form primary-card no-border br-8">
            <IonCardContent className="card-content">
              <div className="details-section">
                <IonGrid>
                  <FormRenderer
                    schema={formSchema}
                    componentMapper={getCustomComponentMapper({
                      currentBusinessPartnerId,
                      entireConfig: formConfig,
                      verifyButtonProps: {
                        isVerificationLoading: isLoading(
                          verificationLoaderStatus
                        ),
                        bankAccountVerifyHandle,
                        buttonName: t("VERIFY_BANK_ACCOUNT_NUMBER"),
                      },
                      formState: initialStateValues,
                    })}
                    FormTemplate={FormTemplate}
                    onSubmit={async (values) => {
                      setLoading(true);
                      let formattedData = await formatSaveFormData(
                        values,
                        formSchema
                      );
                      await dispatch(
                        saveFormDataAsync({
                          data: formattedData,
                          businessPartnerId: currentBusinessPartnerId,
                          formKey,
                          applicationId,
                        })
                      );
                      setLoading(false);
                    }}
                    initialValues={getInitialValues()}
                    validatorMapper={getValidationMapper()}
                  />
                  
                  <IonButton
                    form="my-form"
                    className="fs-18 fw-600 square-btn"
                    type="submit"
                    disabled={loading}
                  >
                    {t("SAVE_AND_PROCEED")}
                  </IonButton>
                </IonGrid>
              </div>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};
export default CustomForm;
