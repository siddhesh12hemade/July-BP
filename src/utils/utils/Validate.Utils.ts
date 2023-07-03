import _ from "lodash";

export class ValidateUtils {
  static readonly PAN_REGEX = new RegExp(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
  static readonly UDYAM_REGEX = new RegExp(/^[a-zA-Z]{7}[0-9]{9}$/)
  static readonly CIN_REGEX = new RegExp(/^([L|U]{1})([0-9]{5})([A-Za-z]{2})([0-9]{4})([A-Za-z]{3})([0-9]{6})$/)
  static readonly EMAIL_REGEX_PATTERN = /^[\w+]+([\-\+\.]?\w+)*@\w+([\-]?\w+)*(\.\w{2,3})+$/
  static isPanValid = (value: any): boolean => {

    let validationResult = !RegExp("^[A-Z]{5}[0-9]{4}[A-Z]{1}$").test(`${value}`);
    return validationResult;
  };

  static isEmailForSignUpValid = (value: string): boolean => {
    let validationResult = `${value}`.match(this.EMAIL_REGEX_PATTERN)
    return !_.isEmpty(validationResult)
  };
}