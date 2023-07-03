import styles from "./DataEntry.module.css";
import "./override.css";

import {
  useFieldApi,
  UseFieldApiConfig,
  useFormApi,
} from "@data-driven-forms/react-form-renderer";
import { Button, Col, Modal, Row, Table } from "antd";
import { useEffect, useState } from "react";
import { IDataEntrFormValues, IDataEntryField } from "./DataEntry.interface";

import {
  IonAccordion,
  IonAccordionGroup,
  IonCard,
  IonItem,
  IonLabel,
} from "@ionic/react";
import _ from "lodash";
import React from "react";
import { useTranslation } from "react-i18next";
import { Constants } from "../../../utils/constants/constants";
import { CommonService } from "../../../utils/services/Common.Service";
import { useAppDispatch } from "../../../utils/store/hooks";
import { openNotificationWithIcon } from "../../../utils/utils/Form.Utils";
import { reset } from "../DynamicDropDown/DynamicDropDown.slice";
//import ModalPdfAndImageViewer from "../ModalPdfAndImageViewer/ModalPdfAndImageViewer";

export const CustomDataEntry = ({
  fields,
  name,
  initialValue,
}: UseFieldApiConfig) => {
  const { t } = useTranslation();

  const [data, setData] = useState<IDataEntrFormValues[]>([]);
  const [modelOpen, setModelOpen] = useState<boolean>(false);
  const [fileInfo, setFileInfo] = useState<object>({});

  const dispatch = useAppDispatch();

  const {
    renderForm,
    restart,
    pauseValidation,
    initialize,
    resumeValidation,
    getFieldState,
    blur,
  }: any = useFormApi();

  const { input } = useFieldApi(fields);

  useEffect(() => {
    initialize({ [name]: data });    
  }, [data]);

  useEffect(() => {
    setData([...initialValue]);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      let element = document.getElementsByClassName("ant-table-tbody")[0];
      element.classList.remove("ant-table-tbody");
    }, 500);
  }, []);

  const readDocument = async (file: any) => {
    let obj = {
      fileId: file.fileId,
    };

    let res = await CommonService.fetchApplicationDocumentRead(obj);
    if (res.status === Constants.API_SUCCESS) {
      CommonService.readFilesPDF(res.data, file.fileType, file.fileId);
    }
  };

  const addEntryToTable = () => {
    const formValues = _.omit(input.value, [name]);
    if (_.isEmpty(formValues)) {
      openNotificationWithIcon({
        type: "error",
        context: t("SUBMITTING_EMPTY_FORM"),
      });
      return;
    }
    resumeValidation();
    let valid = true;
    _.forEach(fields, ({ name }) => {
      valid = valid && getFieldState(name).valid;
    });
    if (valid) {
      setData([...data, formValues]);
      pauseValidation(true);
      restart();
      dispatch(reset());
    } else {
      _.forEach(fields, ({ name }) => {
        blur(name);
      });
      openNotificationWithIcon({
        type: "error",
        context: t("ENTER_ALL_THE_REQUIRED_INFORMATION"),
      });
    }
  };

  const resetValidation = () => {
    restart();
    pauseValidation();
  };

  const renderTable = (
    data: IDataEntrFormValues[],
    fields: IDataEntryField[]
  ) => {
    let arr = [];
    _.map(fields, (field) => {
      arr[field.key] = { component: field.component, label: field.label };
    });

    const fieldsa: any = [
      {
        title: "",
        render: (record) => {
          return (
            <React.Fragment>
              <IonAccordionGroup>
                <IonCard className="mx-0 acc-card no-shadow border-1">
                  <IonAccordion value="details">
                    <IonItem className="" slot="header" lines="none">
                      <div>
                        <IonLabel className="fw-600 fs-14">{ t("DETAILS_TEXT") }</IonLabel>
                      </div>
                    </IonItem>
                    <div
                      className="d-inline-block w-100 p-relative content-acc"
                      slot="content"
                    ></div>

                    <div className="ion-padding" slot="content">
                      {_.map(record, (item, index) => {
                        if (typeof item === "object")
                          return (
                            <>
                              {arr[index]?.component ===
                                "custom-fileUpload" && (
                                <>
                                  <strong>{arr[index]?.label}</strong>:{" "}
                                  <span className="link" onClick={() => readDocument(item)}>
                                    { t("VIEW") }
                                  </span>
                                  <br />
                                </>
                              )}
                            </>
                          );
                        else if (arr[index]?.label === undefined) return;
                        return (
                          <>
                            <strong>{arr[index]?.label}</strong>: {item}
                            <br />
                          </>
                        );
                      })}
                    </div>
                  </IonAccordion>
                </IonCard>
              </IonAccordionGroup>
            </React.Fragment>
          );
        },
        responsive: ["xs", "sm"],
      },
    ];

    return (
      <>
        <Table
          columns={fieldsa}
          dataSource={data}
          pagination={false}
          scroll={{ x: true }}
        />
      </>
    );
  };

  return (
    <>
      <Row>
        <Col span={24}>{renderForm(fields)}</Col>
      </Row>
      <Modal
        forceRender={false}
        closable={false}
        centered={true}
        visible={modelOpen}
        footer={null}
        width={"55%"}
      >
        
      </Modal>
      <div className={styles.AddResetBtnContainer}>
        <Button className="mr-6" type="primary" onClick={addEntryToTable}>
          {t("ADD")}
        </Button>
        {!_.isEmpty(_.omit(input.value, [name])) && (
          <Button type="primary" onClick={resetValidation}>
            {t("RESET")}
          </Button>
        )}
      </div>
      {_.isEmpty(data) ? <></> : renderTable(data, fields)}
    </>
  );
};