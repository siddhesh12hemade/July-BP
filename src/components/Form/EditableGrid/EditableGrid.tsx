import "./override.css";
import styles from './EditableGrid.module.css'

import { useFieldApi, UseFieldApiConfig, useFormApi } from '@data-driven-forms/react-form-renderer';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import { Button, Form, Modal, Popconfirm, Space, Table, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { IEditableGridField, IEditableRowAdd } from "./EditableGrid.interface";
import { formatInitialValueWithoutKey } from "./EditableGrid.utils";
import { openNotificationWithIcon } from "../../../utils/utils/Form.Utils"; 
import i18n from "../../../utils/translations";
import { EditableCell } from "./EditableCell";
import { useAppDispatch,useAppSelector } from "../../../utils/store/hooks"; 
import { selectFormVerificationState,setState } from "../../../utils/utils/Form.Utils";
import { IInitialFormState } from "../../../utils/interfaces/Form.interface"; 

export const EditableGrid = (props: UseFieldApiConfig) => {

  const { fields, name, initialValue, addEntry, pickValue, label = "" } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modelFileViewOpen, setModelFileViewOpen] = useState<boolean>(false);
  const [fileInfo, setFileInfo] = useState<object>({});

  const { input } = useFieldApi(fields);
  const { getFieldState, change, renderForm, resumeValidation, blur } = useFormApi();
  const initialStateValues = useAppSelector<IInitialFormState>(selectFormVerificationState);

  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [data, setData] = useState<object[]>(_.get(initialStateValues, `editableGrid.${pickValue}`, []));
  const [editingKey, setEditingKey] = useState('');
	const dispatch = useAppDispatch();


  const columnsFromConfig = _.map(fields, (field) => {
    if (field.component === "custom-fileUpload") {
      let render = (entry: any, record: any) => {
        return (
          <Space size="middle">
            <a
              onClick={() => {
                setModelFileViewOpen(true);
                setFileInfo(_.get(record, field.key));
              }}
            >
              {t("VIEW")}
            </a>
          </Space>
        );
      }
      return {
        editable: field.editable,
        dataIndex: field.name,
        title: field.label,
        field,
        render
      }
    }
    return {
      editable: field.editable,
      dataIndex: field.name,
      title: field.label,
      field
    }
  })

  const editableGridKeys = _.map(fields, ({ key }) => {
    return key
  })

  useEffect(() => {
    const formatinitialValue = formatInitialValueWithoutKey(initialValue);
    if (!_.isEmpty(initialValue) && _.isEmpty(initialStateValues.editableGrid)) {
      dispatch(setState({ key: `editableGrid.${pickValue}`, value: formatinitialValue }))
    }
    else {
      setData(_.get(initialStateValues, `editableGrid.${pickValue}`, []));
    }
  }, [initialValue]);

  useEffect(() => {
    change(name, data)
  }, [data]);


  const isEditing = ({ key }: { key: string }) => key === editingKey;

  const edit = (record: any) => {
    setEditingKey(record.key);
    _.forEach(fields, ({ name }) => {
      change(name, _.get(record, name));
    });
  };

  const cancel = () => {
    setEditingKey('');
  };

  const onSave = (key: string) => {
    let formValues = _.pick(input.value, editableGridKeys);
    let valid: boolean | undefined = true;
    _.forEach(fields, ({ name, editable = false }) => {
      if (editable) valid = valid && getFieldState(name)?.valid;
    });

    if (!valid) {
      _.forEach(fields, ({ name }) => {
        blur(name)
      });

      openNotificationWithIcon({
        type: t("WARNING"),
        context: i18n.t("INVALID_FORM_SUBMISSION")
      });

      return;
    }

    let newData = [...data];
    if (_.find(newData, { key })) {
      let index = _.findIndex(newData, { key });
      newData.splice(index, 1, { key, ...formValues })
      setData(newData);
    } else {
      newData.push({ key, ...formValues });
      setData(newData);
    }
    setEditingKey('');
    dispatch(setState({ key: `editableGrid.${pickValue}`, value: newData }))
  };

  const editableRowAdd = ({ closeModal, addEntryToTable, fields }: IEditableRowAdd) => {
    return (
      <div className={styles.ModalContainer}>
        <div className={styles.ModalHeaderContainer}>
       
        </div>
        <div className="custom-form-modal-wrapper">
          {_.map(fields, (field) => renderForm([field]))}
        </div>

        <div className={styles.ModalAddCloseButtonWrapper}>
          <div className={styles.CancelButton} onClick={closeModal}>
            {t("CANCEL")}
          </div>
          <Button
            className={styles.VerifyButton}
            onClick={addEntryToTable}
          >
            {t("ADD")}
          </Button>
        </div>
      </div>

    )
  }

  const columns = [
    ...columnsFromConfig,
    {
      title: 'operation',
      dataIndex: 'operation',
      render: (att: any, record: any) => {
        const editable = isEditing(record);
        return _.size(data) >= 1 ? (
          editable ? (
            <span className='save-cancel'>
              <Typography.Link onClick={() => onSave(record.key)} style={{ marginRight: 8 }}>
                {t("SAVE")}
              </Typography.Link>
              <Popconfirm title= {t("SURE_TO_CANCEL")} onConfirm={cancel}>
                <a>{t('CANCEL')}</a>
              </Popconfirm>
            </span>
          ) : (
            <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
              {t('EDIT_CAMEL_CASE')}
            </Typography.Link>
          )
        ) : null
      },
    },
  ];

  const mergedColumns = columns.map(col => {
    if (!_.get(col, "editable")) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => ({
        ...record,
        editing: isEditing(record),
        ...col
      }),
    };
  });

  const showModal = (fields: IEditableGridField[]) => {
    resumeValidation();
    setIsModalOpen(false);
    _.forEach(fields, ({ name, initialValue }) => {
      change(name, initialValue);
    });
    setIsModalOpen(true);
  };

  const addEntryToTable = () => {
    let valid: boolean = true;

    _.forEach(fields, ({ name }) => {
      valid = valid && _.get(getFieldState(name),"valid",false);
    });

    if (!valid) {
      _.forEach(fields, ({ name }) => {
        blur(name)
      });
      return;
    }
    onSave(_.size(data) + "-" + name);
    setIsModalOpen(false);
  };

  const closeModal = () => {

    setIsModalOpen(false);
    _.forEach(fields, ({ name }) => {
      change(name, null);
    });

  };

  return (
    <Form form={form} component={false}>
      <div className="application-list">
        <div className={styles.Maincontainer}>
          
          {
            <div className={styles.AddButtonAndLableContainer}>
              {
                !_.isEmpty(label) ?
                  <div className={styles.LabelForGrid}>{label}</div>
                  :
                  <div className={styles.LabelForGrid}></div>
              }
              {addEntry ?
            <Button type="primary" onClick={() => showModal(fields)} className={styles.UploadButton}>
              {t("ADD_ENTRY")}
            </Button>
            :
            <></>
              }
            </div>
          }
          {isModalOpen ?
            <Modal
              forceRender={false}
              closable={false}
              centered={true}
              visible={isModalOpen}
              footer={null}
            >
              {editableRowAdd({ closeModal, addEntryToTable, fields })}
            </Modal> : <></>
          }
          <div style={{ height: 20 }}></div>
          <div className={styles.EditableTable}>
            <Table
              components={_.isEmpty(data) ? {} : {
                body: {
                  cell: EditableCell
                }
              }}
              dataSource={data}
              columns={mergedColumns}
              pagination={{
                onChange: cancel,
              }}
              scroll={{ x: true }}
            />
          </div>
        </div>
      </div>
    </Form>
  );
};

