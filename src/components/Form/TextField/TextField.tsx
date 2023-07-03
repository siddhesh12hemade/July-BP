import { useFormApi, useFieldApi, UseFieldApiConfig } from "@data-driven-forms/react-form-renderer";
import {useState,useEffect} from "react"
import styles from "./TextField.module.css";
import { Input } from "antd";
import _ from "lodash";
import mathEval from 'math-expression-evaluator';

export default function CustomInputText(props: UseFieldApiConfig) {
  const { getState, initialize } = useFormApi();
  const { meta } = useFieldApi(props);
  const [preFill, setPreFill] = useState();

  let storeInfo = getState().values;

  useEffect(() => {
    setPreFill(_.get(props, `initialValue.${props.path}`));
  }, []);

  let getListOfEvaluationScript = (propName: string): any => {

    let objectParams = { ...storeInfo };

    let entireConfig: any = _.get(props, 'entireConfig', []);

    let filteredConfig = entireConfig.filter((item: any) => _.get(item, 'evaluateExpression'));

    let filteredFieldConfigName = entireConfig.map((item: any) => _.get(item, 'key'));

    if (_.isEmpty(filteredConfig)) return false;

    filteredConfig.forEach((item: any) => {

      let isPatternExists = `${item.evaluateExpression}`.includes(propName);

      if (isPatternExists) {

        let expression = `${item.evaluateExpression}`;

        filteredFieldConfigName.map((item: any) => {

          let value = _.get(objectParams, item, `0`);

          expression = `${expression}`.replaceAll(`{${item}}`, _.isEmpty(value) ? '0' : value);

        })

        let response = mathEval.eval(`${expression}`);

        _.update(objectParams, `${item.key}`, () => _.isFinite(response) ? `${response}` : `0`);

        return true;
      }

    })

    return objectParams;
  }

  return (
    <>
      <div className={styles.FileUploadSelectLabel}>
        <span>{props.label}</span>
      </div>
      <Input
        {...props}
        disabled={_.get(props, 'isDisabled', false)}
        value={_.get(storeInfo, `${props.name}`) ? _.get(storeInfo, `${props.name}`) : preFill}
        onChange={(e: any) => {
          let updatedState = _.update(
            getState().values,
            props.name,
            () => e.target.value
          );

          setPreFill(e.target.value);

         if(getListOfEvaluationScript(props.name)){

           let values = getListOfEvaluationScript(props.name);

           initialize({ ...updatedState, ...values });

         }

        }}
      />
      {meta.touched && meta.error && (
        <p className={styles.ErrorStyle}>{meta.error}</p>
      )}
    </>
  );
  
}
