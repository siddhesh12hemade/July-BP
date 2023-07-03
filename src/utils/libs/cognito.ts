import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession
} from "amazon-cognito-identity-js";

import _ from "lodash";

import Amplify, { Auth } from "aws-amplify";
import { systemException } from "../sentry/common.service";

Amplify.configure({
  Auth: {
    // REQUIRED - Amazon Cognito Region
    region: process.env.REACT_APP_COGNITO_APP_REGION,
    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: process.env.REACT_APP_COGNITO_APP_USERPOOL_ID,
    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: process.env.REACT_APP_COGNITO_APP_CLIENT_ID,
    // OPTIONAL - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
    authenticationFlowType: process.env.REACT_APP_COGNITO_APP_USER_FLOW_TYPE
  },
  // OPTIONAL - Hosted UI configuration
  oauth: {
    domain: process.env.REACT_APP_COGNITO_APP_OAUTH_DOMAIN,
    scope: process.env.REACT_APP_COGNITO_APP_OAUTH_SCOPE.split(','),
    redirectSignIn: `${window.location.origin}/app/application-list`,
    redirectSignOut: `${window.location.origin}/login`,
    responseType: process.env.REACT_APP_COGNITO_APP_OAUTH_RESPONSETYPE, // or 'token', note that REFRESH token will only be generated when the responseType is code
  },
});

Auth.configure();
const userPoolId = process.env.REACT_APP_COGNITO_APP_USERPOOL_ID
const clientId = process.env.REACT_APP_COGNITO_APP_CLIENT_ID

const poolData = {
  UserPoolId: `${userPoolId}`,
  ClientId: `${clientId}`,
};

const userPool: CognitoUserPool = new CognitoUserPool(poolData);

let currentUser = userPool.getCurrentUser();

export function getCurrentUser(): CognitoUser | null {
  if (!currentUser) {
    currentUser = userPool.getCurrentUser();
  }
  return currentUser;
}

function getCognitoUser(username: string): CognitoUser {
  const userData = {
    Username: username,
    Pool: userPool,
  };
  const cognitoUser = new CognitoUser(userData);

  return cognitoUser;
}

export async function getSession(): Promise<CognitoUserSession> {
  if (!currentUser) {
    currentUser = userPool.getCurrentUser();
  }

  return new Promise(function (resolve, reject) {
    if (!currentUser) {
      reject();
    }
    currentUser?.getSession(function (err: any, session: CognitoUserSession) {
      if (err) {
        reject(err);
      } else {
        resolve(session);
      }
    });
  });
}

export async function verifyCode(username: string, code: string) {
  return new Promise(function (resolve, reject) {
    const cognitoUser = getCognitoUser(username);

    cognitoUser.confirmRegistration(code, true, function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  }).catch(err => {
    let obj = {
      fileName: 'cognito.ts',
      functionName: 'verifyCode()',
      error: err,
    };
    systemException(obj);
    throw err;
  });
}

export async function signInWithEmail(
  username: string,
  password: string
): Promise<CognitoUserSession> {
  return new Promise(function (resolve, reject) {
    const authenticationData = {
      Username: username,
      Password: password,
    };

    Auth.signIn(username, password)
      .then(user => {
        resolve(_.get(user, 'signInUserSession'))
      })
      .catch(err => { 
        reject(err) });
  });
}

let mobileFlowCognitoUser: CognitoUser | null
export async function generateMobileLoginOTP(phone: string) {
  return new Promise(function (resolve, reject) {
    const formattedPhoneNumber = _.startsWith(phone, "+91")
      ? phone
      : `+91${phone}`;
    mobileFlowCognitoUser = getCognitoUser(formattedPhoneNumber);
    mobileFlowCognitoUser.initiateAuth(
      new AuthenticationDetails({ Username: formattedPhoneNumber }),
      {
        onSuccess: function (res) {
          resolve(res);
        },
        onFailure: function (err) {
          reject(err);
        },
        customChallenge: function (res) {
          resolve(res);
        },
      }
    );
  });
}

export async function verifyMobileLoginOTP(
  phone: string,
  otp: string
): Promise<CognitoUserSession> {
  return new Promise(function (resolve, reject) {
    mobileFlowCognitoUser?.sendCustomChallengeAnswer(otp, {
      onSuccess: function (res) {
        resolve(res);
      },
      onFailure: function (err) {
        reject(err);
      },
    });
  });
}

export function signOut(cb: any) {
  if (currentUser) {
    currentUser.signOut(cb);
  }
}

export async function getAttributes() {
  return new Promise(function (resolve, reject) {
    currentUser?.getUserAttributes(function (err: any, attributes: any) {
      if (err) {
        reject(err)
      } else {
        resolve(attributes)
      }
    })
  }).catch((err) => {
    let obj = {
      fileName: 'cognito.ts',
      functionName: 'getAttributes()',
      error: err,
    };
    systemException(obj);
    throw err
  })
}

export async function sendCode(username: string) {
  return new Promise(function (resolve, reject) {
    const cognitoUser = getCognitoUser(username)

    if (!cognitoUser) {
      reject(`could not find ${username}`)
      return
    }

    cognitoUser.forgotPassword({
      onSuccess: function (res) {
        resolve(res)
      },
      onFailure: function (err) {
        reject(err)
      },
    })
  }).catch((err) => {
    let obj = {
      fileName: 'cognito.ts',
      functionName: 'sendCode()',
      error: err,
    };
    systemException(obj);
    throw err
  })
}

