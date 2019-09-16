import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  AsyncStorage,
  Alert
} from "react-native";
import * as RNFS from "react-native-fs";
import logger from "./logger";
import { VERSION_NUMBER, STUDY_PERIOD, EXIT_SURVEY_PERIOD } from "./constants";

const codeFileName = "utilities.js";

class Utilities extends Component {
  serviceFileLocal = RNFS.DocumentDirectoryPath + "/services.js";

  async fileExists(path, fileName, callerClass, callerFunc) {
    logger.info(
      `${callerClass}`,
      `${callerFunc}-->fileExists`,
      "Checking if file exists:" + fileName
    );
    if (await RNFS.exists(path)) {
      return true;
    }
    return false;
  }

  async writeJSONFile(content, fileName, callerClass, callerFunc) {
    try {
      //content = data;
      if (typeof content == "object") {
        //logger.info(callerClass, `${callerFunc}-->writeJSONFile`, 'Converting content.');
        content = JSON.stringify(content);
      }

      //logger.info(callerClass, `${callerFunc}-->writeJSONFile`, 'content:'+content);
      const _fileExists = await RNFS.exists(fileName); //if there is an existing file, create a backup first
      if (_fileExists) {
        logger.info(
          callerClass,
          `${callerFunc}-->writeJSONFile`,
          fileName + " already exists. Creating backup."
        );
        const _backupFileName = fileName + ".backup_" + Date.now().toString();
        await RNFS.copyFile(fileName, _backupFileName);

        try {
          logger.info(
            callerClass,
            `${callerFunc}-->writeJSONFile`,
            "Creating new file with content."
          );
          await RNFS.writeFile(fileName, content);
          logger.info(
            callerClass,
            `${callerFunc}-->writeJSONFile`,
            "Deleting backup file."
          );
          await RNFS.unlink(_backupFileName);
        } catch (error) {
          logger.error(
            codeFileName,
            `${callerFunc}-->writeJSONFile`,
            "Failed to write content in new file:" + error.message
          ) + ". Restoring backup file.";
          await RNFS.copyFile(_backupFileName, fileName);
          return false;
        }
      } else {
        logger.info(
          callerClass,
          `${callerFunc}-->writeJSONFile`,
          fileName + " does not exist. Writing content in new file."
        );
        await RNFS.writeFile(fileName, content);
      }
    } catch (error) {
      logger.error(
        codeFileName,
        `${callerFunc}-->writeJSONFile`,
        "Failed to write file:" + error.message
      );
      return false;
    }
    return true;
  }

  async readJSONFile(filePath, callerClass, callerFunc) {
    try {
      const _fileExists = await RNFS.exists(filePath);
      if (_fileExists) {
        const _fileContent = await RNFS.readFile(filePath);
        logger.info(
          callerClass,
          callerFunc + "-->readJSONFile",
          "Successfully read file. Content:" + _fileContent
        );
        return JSON.parse(_fileContent);
      } else {
        logger.info(
          callerClass,
          callerFunc + "-->readJSONFile",
          filePath + " does not exist."
        );
        return null;
      }
    } catch (error) {
      logger.error(
        callerClass,
        callerFunc + "-->readJSONFile",
        "Reading file " + filePath + " failed:" + error.message
      );
      return null;
    }
  }

  readServiceFile() {
    _serviceCategories = [];

    RNFS.readFile(this.serviceFileLocal)
      .then(_fileContent => {
        logger.info(
          `${callerClass}`,
          "ReadServiceFile",
          "Successfully read:" + this.serviceFileLocal
        );

        _serviceCategoriesJS = JSON.parse(_fileContent).serviceCategories;
        for (var i = 0; i < _serviceCategoriesJS.length; i++) {
          _servicesJS = _serviceCategoriesJS[i].services;
          _services = [];
          for (var j = 0; j < _servicesJS.length; j++) {
            _services.push({
              id: _servicesJS[j].serviceName,
              name: _servicesJS[j].serviceName,
              selected: false
            });
          }
          _serviceCategories.push({
            id: _serviceCategoriesJS[i].categoryName,
            name: _serviceCategoriesJS[i].categoryName,
            services: _services
          });
        }

        logger.info(
          `${callerClass}`,
          "ReadServiceFile",
          "Number of categories found:" + _serviceCategories.length
        );

        return _serviceCategories;
      })
      .catch(err => {
        logger.info(
          `${callerClass}`,
          "ReadServiceFile",
          "Failed to read:" + this.serviceFileLocal + ". Err:" + err.message
        );
        return _serviceCategories;
      });
  }

  async uploadData(
    data,
    uuid,
    type,
    callerClass,
    callerFunc,
    callBackFunc = null
  ) {
    logger.info(
      callerClass,
      callerFunc + "-->uploadData",
      "Uploading data. UUID:" + uuid
    );
    _body = {};
    try {
      _body = JSON.stringify({
        uid: uuid,
        client: VERSION_NUMBER,
        key: type,
        value: data
      });
      let response = await fetch("https://mimi.research.icsi.institute/save/", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: _body
      });

      logger.info(
        callerClass,
        callerFunc + "-->uploadData",
        "Server response:" + JSON.stringify(response)
      );

      if (!response.ok) {
        logger.error(
          callerClass,
          callerFunc + "-->uploadData",
          "Error uploading data:" + response.statusText
        );
        if (callBackFunc != null) {
          callBackFunc(true);
        } else {
          return true;
        }
      }
    } catch (error) {
      logger.error(
        callerClass,
        callerFunc + "-->uploadData",
        "Error uploading data:" + error.message
      );
      if (callBackFunc != null) {
        callBackFunc(false, error, _body);
      } else {
        return false;
      }
    }

    if (callBackFunc != null) {
      callBackFunc(true);
    } else {
      return true;
    }
  }

  surveyPeriodEnded(appStatus) {
    _installationDate = appStatus.InstallationDate;
    logger.info(
      codeFileName,
      "surveyPeriodEnded",
      "Checking if study period has ended. _installationDate:" +
        _installationDate
    );
    if (_installationDate == null) {
      logger.error(
        codeFileName,
        "surveyPeriodEnded",
        "Fatal error: installation date is null!!!"
      );
      return true;
    } else {
      _oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
      _currDate = new Date();
      _daysPassed = Math.round(
        Math.abs((_currDate.getTime() - _installationDate.getTime()) / _oneDay)
      );
      if (_daysPassed >= STUDY_PERIOD) {
        return true;
      }
    }
    return false;
  }

  exitSurveyAvailableDays(appStatus) {
    //returns how many days are available until exit survey period ends
    const _installationDate = appStatus.InstallationDate;
    logger.info(
      codeFileName,
      "exitSurveyAvailableDays",
      "Checking if exit survey period has ended. _installationDate:" +
        _installationDate
    );
    if (_installationDate == null) {
      logger.error(
        codeFileName,
        "exitSurveyAvailableDays",
        "Fatal error: installation date is null!!!"
      );
      return 0;
    } else {
      _oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
      _currDate = new Date();
      _daysPassed = Math.round(
        Math.abs((_currDate.getTime() - _installationDate.getTime()) / _oneDay)
      );

      const _remainingDays = STUDY_PERIOD + EXIT_SURVEY_PERIOD - _daysPassed;
      return _remainingDays;
    }
  }

  getDateTime() {
    date = new Date();
    var day = date.getDate();
    var m = date.getMonth() + 1; //Month from 0 to 11
    var y = date.getFullYear();

    var time =
      date.getHours() +
      ":" +
      date.getMinutes() +
      ":" +
      date.getSeconds() +
      ":" +
      date.getMilliseconds();

    return y + "-" + m + "-" + day + " " + time;
  }
}
const utilities = new Utilities();
export default utilities;
