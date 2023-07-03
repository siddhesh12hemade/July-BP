import i18n from "../translations";
import _ from "lodash";
import moment from "moment";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as objectMapper from "object-mapper";
import { RootState } from "../store/store";
import { Field, Schema } from "@data-driven-forms/react-form-renderer";
import { store } from "../store/store";
//import { openNotificationWithIcon } from "../AadhaarVerification/AadhaarVerification";
import {
  fetchFormConfig,
  makeGenericPostCall,
  saveFormData,
} from "../services/Form.Service";

import {
  IInitialFormState,
  INotificationProps,
} from "../interfaces/Form.interface";
import { IUser } from "../interfaces/App.interface";
import { Constants } from "../constants/constants";
import { RcFile } from "antd/es/upload";
import { toast } from "react-toastify";
import dayjs from "dayjs";
export const initialState: IInitialFormState = {
  verificationLoaderStatus: "idle",
  formConfig: [],
  fetchFormConfigStatus: "idle",
  formState: {},
  saveFormDataStatus: "idle",
  formKey: "",
  editableGrid: {},
};
export const openNotificationWithIcon = ({
  type,
  context,
}: INotificationProps) => {
  if (type === "success") {
    toast.success(context);
  }
  if (type === "info") {
    toast.info(context);
  }
  if (type === "warning") {
    toast.warning(context);
  }
  if (type === "error") {
    toast.error(context);
  }
};

export const formatSaveFormData = (formData: object, formSchema: Schema) => {
  let formattedInfo = [];
  let editableGrids = _.filter(formSchema?.fields, ({ component }) => {
    return component === "editable-grid";
  });

  let valuesToOmit: string[] = [];
  _.map(editableGrids, (individualGrid) => {
    return _.forEach(_.get(individualGrid, "fields", []), (field) =>
      valuesToOmit.push(_.get(field, "key", ""))
    );
  });
  let newformData = _.omit(formData, valuesToOmit);

  for (let key in newformData) {
    const inputFieldConfig = formSchema.fields.find((item) => item.name == key);
    const componentName = _.get(
      _.find(formSchema.fields, { key }),
      "component"
    );
    switch (componentName) {
      case "editable-grid":
        formattedInfo.push({
          key,
          value: _.map(_.get(newformData, key), (data) => _.omit(data, "key")),
          scope: _.get(inputFieldConfig, "scope"),
        });
        break;
      default:
        formattedInfo.push({
          key,
          value: _.get(newformData, key),
          scope: _.get(inputFieldConfig, "scope"),
        });
    }
  }

  return formattedInfo;
};

export const formatInputFieldPayloadWithMoment = (payload: Field) => {
  const { initialValue } = payload;
  return {
    ...payload,
    initialValue: initialValue ? dayjs(initialValue) : null,
  };
};
export const formatInputFieldPayloadForCustomArray = (payload: Field) => {
  const { initialValue, maxItems } = payload;

  if (!initialValue) {
    let initialValueArray = [];
    for (
      let maxItemIterator = 0;
      maxItemIterator < maxItems;
      maxItemIterator++
    ) {
      initialValueArray.push(null);
    }
    return {
      ...payload,
      initialValue: initialValueArray,
    };
  } else {
    if (_.size(initialValue) === maxItems) {
      return {
        ...payload,
        initialValue: initialValue,
      };
    } else {
      let initialValueLengthDifference = _.size(initialValue);
      let initialValueArray = [];
      for (
        let maxItemIterator = 0;
        maxItemIterator < maxItems;
        maxItemIterator++
      ) {
        if (initialValueLengthDifference) {
          initialValueArray.push(initialValue[maxItemIterator]);
          initialValueLengthDifference--;
        } else {
          initialValueArray.push(null);
        }
      }
      return {
        ...payload,
        initialValue: initialValueArray,
      };
    }
  }
};
export const formatFormPayload = (payload: Field): Field => {
  const { component = "", initialValue } = payload;

  let result: Field;

  switch (component) {
    case "date-picker":
      result = formatInputFieldPayloadWithMoment(payload);
      break;

    case "time-picker":
      result = formatInputFieldPayloadWithMoment(payload);
      break;

    case "custom-array":
      result = formatInputFieldPayloadForCustomArray(payload);
      break;

    default:
      result = { ...payload, initialValue };
      break;
  }

  return result;
};

export const validateIsSuccessAPIResponse = ({
  validatorMapper,
  response,
}: {
  validatorMapper: object;
  response: object;
}) => {
  let validatorKeys = Object.keys(validatorMapper);

  return validatorKeys.every(
    (item) => _.get(validatorMapper, item) === _.get(response, item)
  );
};

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
export const fetchFormConfigAsync = createAsyncThunk(
  "form/config",
  async ({
    formKey,
    businessPartnerId,
    applicationId,
  }: {
    formKey: string;
    businessPartnerId: string;
    applicationId: string;
  }) => {
    return fetchFormConfig(formKey, businessPartnerId, applicationId);
  }
);

export const saveFormDataAsync = createAsyncThunk(
  "save/formData",
  async (document: object) => {
    return saveFormData(document);
  }
);

export const makeGenericPostCallAsync = createAsyncThunk(
  "post/genericPostCall",
  async (payload: any) => {
    const {
      url,
      state,
      requestObjectMap,
      responseObjectMapper,
      responseValidator,
      successObjectMapper,
      updateState,
    } = payload;

    let requestPayload = objectMapper.merge(state, requestObjectMap);

    let response = await makeGenericPostCall(url, requestPayload);

    let formattedResponse: any = objectMapper.merge(
      response,
      responseObjectMapper
    );

    const { message = "" } = formattedResponse;

    const validationStatus = validateIsSuccessAPIResponse({
      validatorMapper: responseValidator,
      response: formattedResponse,
    });

    if (validationStatus) {
      formattedResponse = objectMapper.merge(
        formattedResponse,
        successObjectMapper
      );
    }

    return {
      status: validationStatus,
      message,
      response: { ...state, ...formattedResponse },
    };
  }
);

export const formVerificationSlice = createSlice({
  name: "form",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setState: (state, payload) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      const { key, value } = payload.payload;
      _.update(state, `${key}`, () => value);
    },
    resetCustomForm: (state, payload) => {
      state= initialState
    }
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder
      .addCase(fetchFormConfigAsync.pending, (state) => {
        state.fetchFormConfigStatus = "loading";
      })
      .addCase(fetchFormConfigAsync.fulfilled, (state, action) => {
        if (action.payload.status === Constants.API_SUCCESS) {
          const { statusCode, enterpriseId, formKey, config } =
            action.payload.data;
          state.fetchFormConfigStatus = "success";
          state.formConfig = config.map((item) => formatFormPayload(item));
        } else {
          state.fetchFormConfigStatus = "failed";
        }
      })
      .addCase(fetchFormConfigAsync.rejected, (state) => {
        state.fetchFormConfigStatus = "failed";
      })
      .addCase(saveFormDataAsync.pending, (state) => {
        state.saveFormDataStatus = "loading";
      })
      .addCase(saveFormDataAsync.fulfilled, (state, action) => {
        if (action.payload.status === Constants.API_SUCCESS) {
          const { statusCode, message } = action.payload.data;
          if (statusCode != "200" && statusCode != "201") {
            openNotificationWithIcon({
              type: "error",
              context: i18n.t("ISSUE_WHILE_SAVING_FORM"),
            });
            state.saveFormDataStatus = "idle";
          } else {
            openNotificationWithIcon({
              type: "success",
              context: i18n.t("APPLICATION_FORM_SUCCESSFULLY_SAVED"),
            });
            state.saveFormDataStatus = "success";
          }
        }
        else{
          openNotificationWithIcon({
            type: "error",
            context: i18n.t("ISSUE_WHILE_SAVING_FORM"),
          });
          state.saveFormDataStatus = "failed";
        }
      })
      .addCase(saveFormDataAsync.rejected, (state) => {
        openNotificationWithIcon({
          type: "error",
          context: i18n.t("ISSUE_WHILE_SAVING_FORM"),
        });
        state.saveFormDataStatus = "failed";
      })
      .addCase(makeGenericPostCallAsync.pending, (state) => {
        state.verificationLoaderStatus = "loading";
      })
      .addCase(makeGenericPostCallAsync.fulfilled, (state, action) => {
        const { status, message, response } = action.payload;

        if (status) {
          state.formState = response;
          openNotificationWithIcon({ type: "success", context: message });
        } else {
          openNotificationWithIcon({ type: "error", context: message });
        }

        state.verificationLoaderStatus = "success";
      })
      .addCase(makeGenericPostCallAsync.rejected, (state) => {
        state.verificationLoaderStatus = "failed";
      });
  },
});
export const getHeadersForFileUpload = () => {
  const loggedInUserState: IUser = store.getState().user;
  return {
    enterpriseid: `${loggedInUserState.enterprise._id}`,
    businesspartnerid: `${loggedInUserState.currentBusinessPartnerId}`,
    //  "bankid": `${loggedInUserState.bank._id}`
  };
};

export const isUploadSizeValid = (
  file: RcFile,
  maxSize: number,
  maxSizeMessage: string
) => {
  const valid = file.size < maxSize * Constants.MB_CONVERTER;
  if (!valid) {
    toast.error(maxSizeMessage + maxSize + "MB!");
  }
  return valid;
};
export const { setState, resetCustomForm } = formVerificationSlice.actions;

export const selectFormVerificationState = (
  state: RootState
): IInitialFormState => state.form;

export const selectFormSubmitStatus = (state: RootState): string =>
  state.form.saveFormDataStatus;

export default formVerificationSlice.reducer;
