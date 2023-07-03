// import dayjs from "dayjs";
// var customParseFormat = require("dayjs/plugin/customParseFormat");
// dayjs.extend(customParseFormat);

import moment from "moment";
import { systemException } from "../sentry/common.service";
export class DateTimeUtils {

  static YEAR_FORMAT = "YYYY"
  static MONTH_YEAR_FORMAT = "MMM YY"
  static FULL_MONTH_YEAR_FORMAT = "MMMM YY"


  static getDiff = (start, end,duration) => {
    return start.diff(end, duration, false)
  }

  static convertFormat = (dateTimeStr:string, format:string) => {
    return moment(dateTimeStr).format(format); 
  }

  static parseAndGetIso = (dateTimeStr:string, format:string) => {
    try{
      return moment(dateTimeStr, format).toISOString()
    }
    catch(e){
      let obj = {
        fileName: 'DateTime.Utils.ts',
        functionName: 'parseAndGetIso()',
        error: e,
      };
      systemException(obj);
      return "";
    }
    
  }

  static parseCustom = (dateTimeStr:string,inputFormatString, outputFormat:string) => {
    try{
      return moment(dateTimeStr, inputFormatString).format(outputFormat); 
    }
    catch(e){
      let obj = {
        fileName: 'DateTime.Utils.ts',
        functionName: 'parseCustom()',
        error: e,
      };
      systemException(obj);
      return "";
    }
    
  }

  static displayDate=(datetime)=> {
    return moment(datetime).format("D MMM YYYY");
  }
  
  static displayDateV2=(datetime) =>{
    return moment(datetime).format("DD MMM YYYY | hh:mm A");
  }
  
  static displayDateV3=(datetime) =>{
    return moment(datetime).format("YYYY/MM/DD");
  }
  
  
  static isoDateStr=(datetime) =>{
    return moment(datetime).format("YYYY-MM-DD");
  } 
  
  static getYear=(datetime) =>{
    return moment(datetime).format("YYYY");
  }
  static convertToIsoDate=(datetime,format) =>{
    return moment(datetime, format).format("YYYY-MM-DD");
  }

  static now=()=>{
    return moment()
  }
}


