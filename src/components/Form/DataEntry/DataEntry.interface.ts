export type IDataEntryNotification = 'success' | 'info' | 'warning' | 'error';


export interface IDataEntryField {
    component: string;
    name: string;
    key: string;
    dataIndex: string;
    placeholder: string;
    helperText: string;
    label: string;
    title: string;
    validate: object;
    render?: any;
}

export interface IDataEntryConfig {
    component: string;
    fieldKey: string;
    name: string;
    fields: IDataEntryField[];
}

export interface IDataEntrFormValues {
    address?: string;
    city?: string;
    contactName?: string;
    customerName?: string;
    district?: string;
    mobileNumber?: string;
    pinCode?: string;
    salesState?: string;
    street2?: string;
    street3?: string
}