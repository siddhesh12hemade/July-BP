
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