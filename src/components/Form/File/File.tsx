import styles from "./File.module.css";

import _ from "lodash";

import { useState } from "react";
import i18n from "../../../utils/translations";
import { useTranslation } from "react-i18next"; 

import { useFormApi, useFieldApi, UseFieldApiConfig } from "@data-driven-forms/react-form-renderer";
import {selectAccessToken,selectCurrentBusinessPartnerId} from "../../../utils/store/user.slice";

import { useAppSelector } from "../../../utils/store/hooks"; 
import { message, Upload, Button } from "antd";
import { Constants } from "../../../utils/constants/constants";

import { getHeadersForFileUpload,isUploadSizeValid } from "../../../utils/utils/Form.Utils"; 
import { RcFile } from "antd/lib/upload";

const { Dragger } = Upload;

export function fileSizeValidator(props: UseFieldApiConfig) {
  return (value: any) => {
    const path = `${props.path}.files[0]`
    if (!_.isEmpty(value.path) && _.get(value, `${path}.fileSize`) > _.get(props, "maxSize")) {
      return `${i18n.t("FILE_TOO_LARGE_MAXIMUM_ALLOWED_SIZE")}
      ${_.get(props, "maxSize") / Constants.MB_CONVERTER} ${i18n.t("MB")}. ${i18n.t("CURRENT_FILE_SIZE")} ${_.get(value, `${path}.fileSize`) / Constants.MB_CONVERTER} ${i18n.t("MB")}`
    }
  };
}

export default function FileUploadComponent(props: UseFieldApiConfig) {

  const { t } = useTranslation();

  const { meta } = useFieldApi(props);

  const { getState, initialize } = useFormApi();

  const currentBusinessPartnerId = useAppSelector<string>(selectCurrentBusinessPartnerId);

  const [preFill, setpreFill] = useState({ key: "", fileType: "" });

  const documentData = _.get(getState().values, props.name)

  const maxUploadSize = _.get(props.validate, [1, 'maxSize']);

  const accessToken = useAppSelector<string>(selectAccessToken);

  const isFileSizeValid = (file: RcFile) => isUploadSizeValid(file, maxUploadSize, t("MAXIMUM_FILE_UPLOAD_SIZE"))

  const getUploadProps = (currentBusinessPartnerId: string, props: any) => {

    return {
      name: "file",
      multiple: false,
      accept: `${props.fileType}`,
      action: `${props.url}`,
      data: {
        filename: `${props.name}`,
        businessPartnerId: currentBusinessPartnerId,
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        ...getHeadersForFileUpload()
      },
      onChange(info: any) {
        const { status } = info.file;
        if (status === "done") {
          const { response, type } = info.file;
          if (response.Key && response.Key !== "") {
            setpreFill({ key: response.Key, fileType: type });
            let updatedState = _.update(getState().values, props.name, () => {
              return {
                documentType: props.documentType,
                files: [
                  {
                    type: "SELF",
                    label: info.file.name,
                    key: response.Key,
                    fileType: info.file.type,
                    fileId: response.Key,
                    fileSize: info.file.size,
                  },
                ],
              };
            });
            initialize(updatedState);
          }
          message.success(`${info.file.name} file uploaded successfully.`);
        } else if (status === "error") {
          message.error(`${info.file.name} file upload failed.`);
        }
      },
    };
  };

  return (
    <>
      <div className={styles.FileUploader}>
        <div className={styles.FileDivider} />
        <div className={styles.FileUploadSelectLabel}>
          <span>{t("UPLOAD_CHEQUE")}</span>
        </div>
      </div>
      <Dragger
        className={styles.FileUploadDragger}
        {...getUploadProps(currentBusinessPartnerId, props)}
        showUploadList={false}
        beforeUpload={isFileSizeValid}
      >
        <div className={styles.FileUploadDraggerContainer}>
          <p className="ant-upload-drag-icon">
            <img src={Constants.FOLDER_ICON} alt=""/>
          </p>
          <p className={styles.FileUploadDraggerText}>
            {t("DRAGGER_UPLOAD_TEXT")}
          </p>
          <p className="ant-upload-hint">
            {t("DRAGGER_UPLOAD_NOTE").replace(
              "{supported_files}",
              `${t("IMAGE_FILE_TYPE")} ${t("AND")} ${t("PDF_FILE_TYPE")}`
            )}
          </p>
          <div className={styles.ChooseFileButtonContainer}>
            <div className={styles.ChooseFileButtonText}>
              <Button className={styles.ChooseFileButton}>
                {t("CHOOSE_FILE")}
              </Button>
            </div>
          </div>
          <div className={styles.MaxFileLimitText}>{t("MAX_FILE_LIMIT")}</div>
        </div>
      </Dragger>
      {meta.touched && meta.error && (
        <p className={styles.ErrorStyle}>{meta.error}</p>
      )}
      <div className={styles.gap}></div>
      
    </>
  );
}
