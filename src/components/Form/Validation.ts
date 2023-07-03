import validator from "validator";
import moment from "moment";
export const isValid = (type: string, value: any): boolean => {
  let validationResult;

  switch (type) {
    case "panNumber":
      validationResult = !RegExp("^[A-Z]{5}[0-9]{4}[A-Z]{1}$").test(`${value}`);
      break;

    case "name":
      validationResult = validator.isEmpty(`${value}`.trim());
      break;

    case "dob":
      const formattedDate = moment(value, "DD/MM/YYYY").format("YYYY-MM-DD");
      validationResult = moment(formattedDate).isAfter(
        moment().format("YYYY-MM-DD")
      );
      break;

    case "pinCode":
      validationResult = !validator.isPostalCode(`${value}`, "IN");
      break;

    case "state":
      validationResult = !(
        validator.isAscii(`${value}`) &&
        validator.isLength(`${value}`, { min: 1, max: 100 })
      );
      break;

    case "address":
      validationResult = !(
        validator.isAscii(`${value}`) &&
        validator.isLength(`${value}`, { min: 3, max: 250 })
      );
      break;

    case "captchaCode":
      validationResult = !(
        validator.isAscii(`${value}`) &&
        validator.isLength(`${value}`, { min: 1, max: 100 })
      );
      break;

    case "aadhaarNumber":
      validationResult = !(
        validator.isNumeric(`${value}`) &&
        validator.isLength(`${value}`, { min: 12, max: 12 })
      );
      break;

    case "otp":
      validationResult = !(
        validator.isNumeric(`${value}`) &&
        validator.isLength(`${value}`, { min: 6, max: 6 })
      );
      break;

    case "careOf":
      validationResult = !(
        validator.isAscii(`${value}`) &&
        validator.isLength(`${value}`, { min: 1, max: 150 })
      );
      break;

    case "country":
      validationResult = !(
        validator.isAscii(`${value}`) &&
        validator.isLength(`${value}`, { min: 1, max: 150 })
      );
      break;

    case "subDistrict":
      validationResult = !(
        validator.isAscii(`${value}`) &&
        validator.isLength(`${value}`, { min: 1, max: 150 })
      );
      break;

    case "district":
      validationResult = !(
        validator.isAscii(`${value}`) &&
        validator.isLength(`${value}`, { min: 1, max: 150 })
      );
      break;

    case "gender":
      validationResult = !(
        validator.isAscii(`${value}`) &&
        validator.isLength(`${value}`, { min: 1, max: 150 })
      );
      break;

    case "cinNumber":
      validationResult = !RegExp("^([L|U]{1})([0-9]{5})([A-Za-z]{2})([0-9]{4})([A-Za-z]{3})([0-9]{6})$").test(`${value}`);
      break;

    case "udyamNumber":
        validationResult = !RegExp("^[a-zA-Z]{7}[0-9]{9}$").test(`${value}`);
        break;

    case "mobileNumber":
      validationResult = !validator.isMobilePhone(`${value}`.trim(), ["en-IN"])
      break;

    default:
      validationResult = false;
  }

  return validationResult;
};