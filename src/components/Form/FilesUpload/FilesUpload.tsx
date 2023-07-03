
import styles from "./FilesUpload.module.css"
import { Constants } from "../../../utils/constants/constants";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { useFieldApi, useFormApi } from "@data-driven-forms/react-form-renderer";
import { UploadProps, Upload, Button, message } from "antd";
import { useState } from "react";

import { RcFile } from "antd/lib/upload";
import { getHeadersForFileUpload, isUploadSizeValid } from "../../../utils/utils/Form.Utils";

import { useAppSelector } from "../../../utils/store/hooks";
import { selectAccessToken } from "../../../utils/store/user.slice"; 
import FilesViewer from "../FilesViewer/FilesViewer";

const { Dragger } = Upload;

const FilesUpload = (props: any) => {
  const { getState, initialize } = useFormApi();
  const { meta } = useFieldApi(props);
  const accessToken = useAppSelector<string>(selectAccessToken);
  const [isFileUploading, setIsFileUploading] = useState<boolean>(false)
  const { t } = useTranslation();
  const { maxSize } = props;

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    accept: props.acceptFileType,
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
      ...getHeadersForFileUpload()
    },
    action: props.uploadPath,
    data: { filename: props.documentType, businessPartnerId: props.businessPartnerId },
    onChange(info) {
      
      const { status } = info.file;
      if (status === "done") {
        setIsFileUploading(false);
        const { response, type } = info.file;
        if (response.Key && response.Key !== "") {
          initialize({ ...getState().values, [props.name]: { fileId: `${response.Key}`, fileType: type } })
          message.success(`${info.file.name} file uploaded successfully.`);
        } else {
          message.error(`${info.file.name} file upload failed.`);
        }
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
        setIsFileUploading(false);
      } else if (status === "uploading") {
        setIsFileUploading(true);
      }
    },
  };

  const isFileSizeValid = (file: RcFile) => isUploadSizeValid(file, maxSize, t("MAXIMUM_FILE_UPLOAD_SIZE"))

  return (
    <>
      <div className={styles.FileUploader}>
        <div className={styles.FileUploadSelectLabel}>
          <span>{t("UPLOAD_YOUR")} {props.label}</span>
        </div>
      </div>
      <div className={styles.FileUploadDraggerBox}>
        <Dragger
          className={styles.FileUploadDragger}
          {...uploadProps}
          showUploadList={false}
          beforeUpload={isFileSizeValid}
        >
          <div className={styles.FileUploadDraggerContainer}>
            <p className="ant-upload-drag-icon">
              <img src={Constants.FOLDER_ICON} />
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
                <Button loading={isFileUploading} className={styles.ChooseFileButton}>
                  {t("CHOOSE_FILE")}
                </Button>
              </div>
            </div>
            <div className={styles.MaxFileLimitText}>{t("MAX_FILE_LIMIT")}</div>
          </div>
        </Dragger>
         <FilesViewer fileData={_.get(getState().values, props.name)} filePath={props.name} documentType={props.label} />
        {meta.touched && meta.error && <p className={styles.ErrorLabel}>{meta.error}</p>}
        <div style={{ height: 20 }} />
      </div>
    </>
  )
}

export default FilesUpload
