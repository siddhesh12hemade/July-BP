import {
  IonButton,
  IonCol, IonGrid,
  IonRow
} from "@ionic/react";
import { Input, Radio, RadioChangeEvent, Space } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Constants } from "../utils/constants/constants";
import { answerBureauQuestion } from "../utils/services/Bureau.Service";
import './CaptchaComponent.css';

const BureauQuestionnaireModal = ({
  onDismiss,
  defaultOptionsList,
  defaultQuestion,
  defaultAnswerType,
  orderId,
  reportId

}: {
  onDismiss: (data?: string | null | undefined | number, role?: string) => void;
  defaultOptionsList: string[];
  defaultQuestion: string,
  defaultAnswerType: "R" | "T",
  orderId: string,
  reportId:string,  
}) => {  
  const [answerText, setAnswerText] = useState("");
  const [question, setQuestion] = useState(defaultQuestion);
  const [answerType, setAnswerType] = useState(defaultAnswerType);
  const [optionsList, setOptionsList] = useState<string[]>(defaultOptionsList);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { t } = useTranslation();

  const onSubmit = async () => {
    setSubmitLoading(true)
       
      let apiRes = await answerBureauQuestion({
        orderId: orderId,
        reportId : reportId,
        userAns: answerText
      });

      if(apiRes.status === Constants.API_SUCCESS){
        const { errors, statusCode, message, data } = apiRes.data;
        switch (statusCode) {          
          case "SUCCESS": {
            const { question, optionsList, buttonbehaviour, status } = data;
            
            if (status && status === "S01") {
              onDismiss("success")              
            } else if (status && status === "S02") {              
              toast.error(t("ERROR_CRIF_REPORT_INCORRECT_ANS"))
              onDismiss("error")
            } else {
              setQuestion(question)
              setOptionsList(optionsList)
              setAnswerType(buttonbehaviour === "R" ? "R" : "T")              
              if(!question)
                onDismiss("fail")              
            }
            break;
          }          
        } 
      }
    
    setSubmitLoading(false)
  } 

  return (
    <div className="captcha-container">
      <IonGrid>
        <IonRow>
          <IonCol>
            <div>
              <span>{`${t("QUESTION")}: `}</span>
              <span>{question}</span>
            </div>
          </IonCol>
        </IonRow>

        <IonRow>
          <IonCol>
            <div>
              <span>{`${t("ANSWER")}: `}</span>
            </div>
          </IonCol>
        </IonRow>
        <IonCol>
          <div>
            {
              answerType === "R" &&
              <>
                <Radio.Group onChange={(e: RadioChangeEvent) => {
                  setAnswerText(e.target.value)
                }} value={answerText}>
                  <Space direction="vertical">
                    {
                      optionsList.map((answerString, index) => {
                        return (
                          <Radio key={index} value={answerString}>{answerString}</Radio>
                        )
                      })
                    }
                  </Space>
                </Radio.Group>
              </>
            }
            {
              answerType !== "R" &&
              <Input
                placeholder={""}
                onChange={e => setAnswerText(e.target.value)}
                value={answerText}
                defaultValue={answerText}
              />
            }
          </div>
        </IonCol>
      </IonGrid>

      <IonGrid>
        <IonRow className="">
          <IonCol size="6" className="ion-text-center">
            <IonButton
              disabled={!answerText}
              onClick={() => onSubmit}
              shape="round"
              className="fs-18 fw-600 medium-round-btn"
            >
              {t("NEXT")}
            </IonButton>
          </IonCol>
          <IonCol size="6" className="ion-text-center">
            <IonButton
              className="clear-btn-gray"
              fill="clear"
              onClick={() => onDismiss(null, "cancel")}
            >
              {t("CANCEL_CAP")}
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>
  );
};

export default BureauQuestionnaireModal;
