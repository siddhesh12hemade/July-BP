import { useFormApi } from "@data-driven-forms/react-form-renderer";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import styles from "./FilesViewer.module.css";

import { Constants } from "../../../utils/constants/constants";

export const getFormattedURL = (baseURL: string, endPoint: string): string => {
  return new URL(`${endPoint}`, `${baseURL}`).toString();
};

const FilesViewer = ({ fileData, filePath, documentType }: any) => {
  const { getState, initialize } = useFormApi();
  const { t } = useTranslation();
  
  const onCrossClick = () => {
    const updatedFormData = _.omit(getState().values, filePath);
    initialize(updatedFormData)
  };

  return (
    <>
      {!_.isEmpty(fileData?.fileId) && !_.isEmpty(fileData?.fileType) &&
        <div className={styles.FileViewerContainer} >
          <div className={styles.FileViewerDocumentType}> {documentType} </div>
          <div onClick={() => onCrossClick()} className={styles.FileViewerCross}>
            <img className={styles.FileViewerCrossImg} src={Constants.CROSS_ICON} />
          </div>
          {fileData?.fileType == "application/pdf" ? (
            <div className={styles.FileViewerDocumentPdf}>              
            </div>
          ) : (fileData.fileType === "image/jpeg") || (fileData.fileType === "image/png") ? (
            <img
              className={styles.FileViewerDocumentImage}
              src={getFormattedURL(
                `${process.env.REACT_APP_ACTYV_GO_SVC_URL}`,
                `api/file/read/${fileData?.fileId}`
              )}
            />
          ) : (
            <div className={styles.FileViewerInvalidFileType}>
              <strong>{t("INVALID_FILE_TYPE")}</strong>
            </div>
          )}</div>}
    </>
  )
}

export default FilesViewer;
