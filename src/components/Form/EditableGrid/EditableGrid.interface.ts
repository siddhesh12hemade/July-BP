export interface IEditableGridConfig {
    component: string;
    fieldKey: string;
    name: string;
    initialValue: Array<any>
    fields: IEditableGridField[];
  }
  
  export interface IEditableGridField {
    component: string;
    name: string;
    key: string;
    dataIndex: string;
    placeholder: string;
    helperText: string;
    label: string;
    title: string;
    render?: any;
    initialValue: any;
    editable?: boolean | string;
    fields?: any
  }
  
  export interface IEditableRowAdd {
    closeModal: () => void;
    addEntryToTable: () => void;
    fields: IEditableGridField[];
  }