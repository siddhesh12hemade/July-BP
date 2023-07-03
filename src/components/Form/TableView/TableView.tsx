import { Space, Table } from "antd";
import _ from "lodash";
import "./override.css";
import { ITableViewProp } from "./TableView.interface";
import styles from "./TableView.module.css";
//import ModalPdfAndImageViewer from "../ModalPdfAndImageViewer/ModalPdfAndImageViewer";
import { useState } from "react";
import { useTranslation } from "react-i18next";


export const TableView = (props: ITableViewProp) => {
 
 const { t } = useTranslation();
  const { initialValue, label = "" } = props;
  const [modelOpen, setModelOpen] = useState<boolean>(false);
  const [fileInfo, setFileInfo] = useState<object>({});

  let tableData = _.isEmpty(initialValue) ? [] : initialValue;


  tableData = _.map(tableData, (tableRow) => _.mapValues(tableRow, (value: any, key) => {
    if (_.isObject(value) && _.get(value, "fileId")) {
      return (
        <Space size="middle">
          <a onClick={() => {
            setModelOpen(true);
            setFileInfo(value)
          }}>
            {t("VIEW")}
          </a>
        </Space>
      );
    }
    if (_.isObject(value) || _.isArray(value)) {
      return JSON.stringify(value);
    }
    return value
  }))
  const columnsObj = _.keys(_.get(tableData, [0], {}));

  const tableColumns = _.map(columnsObj, (column) => {
    return {
      dataIndex: column,
      title: _.startCase(column),
      key: column,
    }
  });

  return (
    <div className="TableView">
      <div className={styles.TableContainer}>
        {!_.isEmpty(label) && <div className={styles.LabelForGrid}>{label}</div>}
        <Table
          columns={tableColumns}
          dataSource={tableData}
          scroll={{x:true}}
        />
      </div>
      
    </div>
  )

}
