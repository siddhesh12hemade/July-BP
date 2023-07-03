import { useEffect, useState } from 'react';
import _ from 'lodash';
import { Select, Form } from 'antd';
import * as objectMapper from 'object-mapper';
import { useFieldApi, useFormApi } from "@data-driven-forms/react-form-renderer";

import { makeGenericGetCallAsync, selectDropDownState, setState } from './DynamicDropDown.slice';
import { IInitialFormState } from './DynamicDropDown.interface';
import styles from "./DynamicDropDown.module.css"
import { useAppDispatch,useAppSelector } from '../../../utils/store/hooks';

export const DynamicDropDown = (props: any) => {
  const { getState, initialize } = useFormApi();

  const { meta } = useFieldApi(props);

  const dispatch = useAppDispatch();

  const { action, resetValues = {}, entireConfig, defaultValue = "", isDisabled = false, setFormRef = {} } = props;

  const initialStateValues = useAppSelector<IInitialFormState>(selectDropDownState);

  const { formState = {}, optionsState, loaderStatus } = initialStateValues;

  useEffect(() => {
    if (!_.isEmpty(setFormRef?.current)) {
      dispatch(setState({ key: 'formState', value: { ...setFormRef.current } }))
    }
  }, [setFormRef.current])

  useEffect(() => {
    if (_.isEmpty(formState)) {
      let initialState = getState().values;
      dispatch(setState({ key: 'formState', value: _.isEmpty(initialState) ? {} : initialState }))
    }
  }, [action])

  useEffect(() => {
    if (!_.isEmpty(defaultValue) && _.isEmpty(_.get(getState().values, `${props.name}`, ""))) {
      dispatch(setState({ key: `formState.${[props.name]}`, value: defaultValue }))
      initialize({ ...getState().values, [props.name]: defaultValue })
    }
  }, [defaultValue, _.get(optionsState, props.name, []), formState])

  useEffect(() => {

    let componentType = _.get(entireConfig, '[0].component');

    if (!_.isEmpty(_.get(formState, props.name, null)) && componentType === 'custom-DataEntry') {
      let initialState = getState().values;
      dispatch(setState({ key: 'formState', value: _.isEmpty(initialState) ? {} : { ...formState, ...initialState, [props.name]: null } }))
    }
  }, [])

  useEffect(() => {

    if (_.isEmpty(_.get(optionsState, props.name, []))) {

      let dropDownInitialStateValue = _.get(formState, props.name, '');

      let filterMappingInfo = _.get(action, 'urlObjectMapper', {});

      let isReInitiateAPICall = false;

      for (let item in filterMappingInfo) {
        let defaultFilterValue = _.get(filterMappingInfo, `${item}.default`, '');
        if (!_.isEmpty(defaultFilterValue)) isReInitiateAPICall = true
      }

      // making sure dropdown values not exists in store and if drop down need to be filled with default filter initiating API call
      if (
        (_.isEmpty(dropDownInitialStateValue) || isReInitiateAPICall) &&
        !_.includes(_.get(initialStateValues, "ongoingCalls"), props.name)
      ) {
        dispatch(
          makeGenericGetCallAsync({
            ...action,
            name: props.name,
            state: getState().values,
          })
        );
      }
    }
  }, [_.get(optionsState, props.name, []), formState])


  const updateAndResetStateValues = (newStateValue: object) => {    

    let stateValues = { ...formState, ...getState().values };

    let resetProperties = objectMapper.merge({ ...stateValues, ...newStateValue }, resetValues);

    let updatedState = { ...stateValues, ...newStateValue, ...resetProperties };

    dispatch(setState({ key: 'formState', value: { ...formState, ...updatedState } }))

    const resetValueEntries = _.keys(_.get(props, 'resetValues', {}));

    let key = _.get(resetValueEntries, '[0]');

    let formKeyToBeReset = _.get(props, `resetValues.${key}.key`);

    let filteredConfig = _.find(entireConfig, (item) => item.name === formKeyToBeReset);

    if (!_.isEmpty(filteredConfig)) {
      dispatch(makeGenericGetCallAsync({ ...filteredConfig.action, name: filteredConfig.name, state: updatedState }));
    }

    updatedState = _.omitBy(updatedState, _.isNull);

    initialize(updatedState)

    let updatedOptionState = { ...optionsState, ...resetProperties }

    dispatch(setState({ key: "optionsState", value: updatedOptionState }));

  }

  let updatedProps = {
    ...props,
    options: _.get(optionsState, props.name, []),
    initialValue: _.get(getState().values, props.name)
  }

  const isLoading = (loaderStatus: string) => {
    return loaderStatus === "loading"
  };


  let initialValue = _.get(formState, `${props.name}`, null);

  return <Form layout="vertical">
    <Form.Item label={props.label}>
      <Select
        {...updatedProps}
        showSearch
        className={styles.ContainerWidthStyle}
        notFoundContent={null}
        // defaultValue={_.isEmpty(initialValue) ? null : initialValue}
        value={_.isEmpty(initialValue) ? null : initialValue}
        loading={isLoading(_.get(loaderStatus, props.name, 'idle'))}
        onChange={(value: string) => {
          if (!_.isEmpty(setFormRef)) {
            setFormRef.current = { ...setFormRef.current, [props.name]: value }
          }
          updateAndResetStateValues({ [props.name]: value })
        }
        }
        allowClear={true}
        disabled={isDisabled}
      >
      </Select>
      {meta.touched && meta.error && <p className={styles.ErrorLabel}>{meta.error}</p>}
    </Form.Item>
  </Form>
}