import { ITAndC } from "./BPSelfSignUp.interface";

export interface ISidebarState {
  isSidebarCollapsed: boolean;
  activeMenuIndex: number;
  menuItems: ILeftNavMenuItem[];
}

export interface ILeftNavMenuItem {
  name: string;
  path: string;
  service: string;
  icon: string;
}


export interface IUserContextResponse {
  __id: string;
  email: string;
  phone: string;
  fname: string;
  lname: string;
  userName: string;
  type: string[];
  roles: Role[];
  leftNavItems: ILeftNavMenuItem[];
  businessPartnerIds: string[];
  logo: string;
  enterpriseId: string;
  bankId: string;
}

export interface ISignupSlider {
  imageUrl: string;
  order: number;
}

export interface IUrlResponse {
  logo: string;
  userType: "business-partner" | "enterprise" | "bank";
  signupSlider: ISignupSlider[];
  tnc: ITAndC;
}

export interface Role {
  name: string;
  permissions: Permission[];
  roleId: string;
}

export interface Permission {
  name: string;
  action: string;
  subject: string;
  conditions: string;
  service: string;
}

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roles: Role[];
  userType: string[];
  userName: string;
  businessPartnerIds: string[];
  currentBusinessPartnerId: string;
  businessPartner: IBusinessPartner;
  logo: string;
  enterprise: IEnterprise;  
  accessToken: string;
  sliderImages: ISignupSlider[];
  tnc: ITAndC | {}
}

export interface IBusinessPartner {
  readonly _id: string;
  readonly gstin: string;
  readonly businessName: string;
}

export interface IEnterprise {
  readonly _id: string;
  readonly name: string;
  readonly key: string;
  readonly theme: Object;
  readonly eSignTenant: Object;
  readonly eSignReturnURL: string;
}

export interface IPrevalidatedUser {
  readonly fname: string;
  readonly lname: string;
  readonly email: string;
  readonly phone: string;
}


export interface IDropDown {
  value: string;
  label: string;
  disabled: boolean;
}

export interface ApiConfig{
	api_url: string,		
	method: 'post' | 'get',
	data?:any,	
	headers?: any,
	param_data?: any,

}

export interface ApiResult<T>{
	data?: T,		
	status: string,
	message?: string,
	error?: any
  code?:string
}