import { useFieldApi, useFormApi } from "@data-driven-forms/react-form-renderer";
import { Button } from "antd";
import styles from "./CustomVerifyButton.module.css"

export const CustomVerifyButton = (props: any) => {
  const { customVerifyButtonProps } = props
  const { getState } = useFormApi();
  
  const {
    label,
    input,
    isRequired,
    meta: { error, touched },
    action,
    ...rest
  } = useFieldApi(props);

  const state = getState().values;

  return <>
    <Button
      loading={customVerifyButtonProps.isVerificationLoading}
      type="primary"
      className={styles.UploadButton}
      onClick={() => customVerifyButtonProps.bankAccountVerifyHandle(action, state)
      }
    >
      {customVerifyButtonProps.buttonName}
    </Button>
    {touched && error && <p className={styles.ErrorLabel}>{error}</p>
    }
  </>
}