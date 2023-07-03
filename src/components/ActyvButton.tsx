import { IonButton, IonSpinner } from "@ionic/react";
import React from "react";

const ActyvButton: React.FC<{
  isLoading?: boolean
  disabled: boolean
  text: string
  onClick?:any
}> = ({
  isLoading,
  disabled = false,
  text,
  onClick
}) => {
    return (

      <>
        <IonButton
          type="submit"
          shape="round"
          className="fs-14 fw-500 medium-round-btn"
          disabled={disabled}
          onClick={onClick}
        >
          {text}
          {isLoading && (
            <IonSpinner style={{
              'width': '16px',
              'height': '16px',
              'color': '#E17350',
              'margin-left': '4px'
            }} justify-content-center align-items-center name="crescent"></IonSpinner>

          )}
        </IonButton>
      </>

    );
  };

export default ActyvButton;
