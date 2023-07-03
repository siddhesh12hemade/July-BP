import componentMapper from "@data-driven-forms/ant-component-mapper/component-mapper";
import { UseFieldApiConfig } from "@data-driven-forms/react-form-renderer";
import _ from "lodash";
import { t } from "i18next";
import { isValid } from "./Validation";

import { Constants } from "../../utils/constants/constants";
import i18n from "../../utils/translations";
import { CustomVerifyButton } from "./CustomVerifyButton/CustomVerifyButton";
import { DynamicDropDown } from "./DynamicDropDown/DynamicDropDown";
import { CustomDataEntry } from "./DataEntry/DataEntry";
import FileUploadComponent from "./File/File";
import FilesUpload from "./FilesUpload/FilesUpload";
import CustomInputText from "./TextField/TextField";
import { EditableGrid } from "./EditableGrid/EditableGrid";
import { TableView } from "./TableView/TableView";
export const getCustomComponentMapper = ({
  currentBusinessPartnerId,
  entireConfig,
  verifyButtonProps,
  formState,
}: {
  currentBusinessPartnerId?: string;
  entireConfig?: any;
  verifyButtonProps?: any;
  formState?: any;
}) => {
  return {
    ...componentMapper,
    "custom-DataEntry": CustomDataEntry,
    //  "custom-array": FieldArrayCustom,
      "custom-input": (props: any) => <CustomInputText {...props} entireConfig={entireConfig} />,
    "file-upload": FileUploadComponent,
    "custom-button": (props: any) => (
      <CustomVerifyButton
        {...props}
        customVerifyButtonProps={{ ...verifyButtonProps }}
      />
    ),
    'custom-fileUpload': (props: any) => <FilesUpload {...props} businessPartnerId={currentBusinessPartnerId} />,
    "custom-drop-down": (props: any) => (
      <DynamicDropDown {...props} entireConfig={entireConfig} />
    ),
      'data-table-view': (props: any) => <TableView {...props} entireConfig={entireConfig} formState={formState} />,
      'editable-grid': (props: any) => <EditableGrid {...props} entireConfig={entireConfig} formState={formState} />
  };
};

export const getValidationMapper = () => {
  // custom validation
  return {
    "file-size": (props: any) => fileSizeValidator(props),
    isValidMobileNumber: () => (value: string) =>
      isValid("mobileNumber", value) ? t("MOBILE_NO_ERROR_1") : undefined,
  };
};
export function fileSizeValidator(props: UseFieldApiConfig) {
  return (value: any) => {
    const path = `${props.path}.files[0]`;
    if (
      !_.isEmpty(value.path) &&
      _.get(value, `${path}.fileSize`) > _.get(props, "maxSize")
    ) {
      return `${i18n.t("FILE_TOO_LARGE_MAXIMUM_ALLOWED_SIZE")}
      ${_.get(props, "maxSize") / Constants.MB_CONVERTER} ${i18n.t(
        "MB"
      )}. ${i18n.t("CURRENT_FILE_SIZE")} ${
        _.get(value, `${path}.fileSize`) / Constants.MB_CONVERTER
      } ${i18n.t("MB")}`;
    }
  };
}
