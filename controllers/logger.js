import { Component } from "react";
import { Alert } from "react-native";
import * as RNFS from "react-native-fs";

import { LOG_FILE_PATH } from "./constants";

class Logger extends Component {
  async setup() {
    try {
      if (await !RNFS.exists(LOG_FILE_PATH)) {
        await RNFS.writeFile(LOG_FILE_PATH, "\n");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  }

  getDateTime() {
    const date = new Date();
    const day = date.getDate();
    const m = date.getMonth() + 1; //Month from 0 to 11
    const y = date.getFullYear();

    const _hour = date.getHours() > 9 ? date.getHours() : "0" + date.getHours();
    const _min =
      date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes();
    const _sec =
      date.getSeconds() > 9 ? date.getSeconds() : "0" + date.getSeconds();
    const time = _hour + ":" + _min + ":" + _sec + ":" + date.getMilliseconds();

    return { UTCTime: date, LocalTime: y + "-" + m + "-" + day + " " + time };
  }

  async writeLog(type, className, funcName, message) {
    const dates = this.getDateTime();
    try {
      const _log = {
        Type: type,
        File: className,
        Function: funcName,
        Message: message,
        Time: dates.LocalTime,
        UTCTime: dates.UTCTime
      };
      await RNFS.appendFile(LOG_FILE_PATH, JSON.stringify(_log) + "\n");
    } catch (error) {
      Alert.alert("Error writing in log file", error.message);
    }
  }

  async info(className, funcName, message) {
    await this.writeLog("Info", className, funcName, message);
  }

  async warn(className, funcName, message) {
    await this.writeLog("Warning", className, funcName, message);
  }

  async error(className, funcName, message) {
    await this.writeLog("Error", className, funcName, message);
  }

  debug(className, funcName, message) {
    this.writeLog("Debug", className, funcName, message);
  }

  //  static getLogger() {
  //      let instance = null;
  //      if (instance == null) {
  //        instance = new Logger();
  //
  //        try
  //        {
  //            RNFS.exists(LOG_FILE_PATH)
  //            .then( (exists) =>{
  //                if(!exists)
  //                {
  //                    RNFS.writeFile(LOG_FILE_PATH, '\n');
  //                }
  //            });
  //        }catch (error)
  //        {
  //             Alert.alert("Error", error.message);
  //        }
  //
  //      return instance;
  //    }
  //}
}

const logger = new Logger();
logger.setup();
export default logger;
