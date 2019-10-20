import * as RNFS from "react-native-fs";
import AsyncStorage from "@react-native-community/async-storage";
import * as Sentry from "@sentry/react-native";

import logger from "./logger";
import * as utilities from "./utilities";
import { SURVEY_STATUS, APP_STATUS_FILE_PATH } from "./constants";

const codeFileName = "appStatus.js";

export default class AppStatus {
  static status = {
    SurveyCountToday: 0, //how many surveys were created today
    SurveyStatus: SURVEY_STATUS.NOT_AVAILABLE,
    FirstNotificationTime: null,
    LastNotificationTime: null,
    CompletedSurveys: 0,
    SurveysAnsweredToday: 0,
    InstallationDate: null,
    UUID: null,
    InvitationCode: null,
    Debug: false,
    LastSurveyCreationDate: null, //date when the last survey was created. Needed to reset counts.
    LastSurveyAnsweredTime: null, //when was the last time a survey was completed?
    CurrentSurveyID: null,
    ExitSurveyDone: false,
    LastLocationAccess: null, //when was the last time location sharing was enabled.
    LastLocationPromptTime: null, //when was the last time location sharing prompt was shown.
    EligibleForBonus: true // indicates whether this person is eligible to receive bonus for daily survey
  };

  static typeCast(status) {
    const funcName = "typeCast";
    try {
      if (status.InstallationDate !== null) {
        status.InstallationDate = new Date(status.InstallationDate);
      }
      status.FirstNotificationTime =
        "FirstNotificationTime" in status
          ? new Date(status.FirstNotificationTime)
          : null;
      status.LastNotificationTime =
        "LastNotificationTime" in status
          ? new Date(status.LastNotificationTime)
          : null;
      status.LastSurveyCreationDate =
        "LastSurveyCreationDate" in status
          ? new Date(status.LastSurveyCreationDate)
          : null;
      status.LastLocationAccess =
        "LastLocationAccess" in status
          ? new Date(status.LastLocationAccess)
          : null;
      status.LastLocationPromptTime =
        "LastLocationPromptTime" in status
          ? new Date(status.LastLocationPromptTime)
          : null;
      status.LastSurveyAnsweredTime =
        "LastSurveyAnsweredTime" in status
          ? new Date(status.LastSurveyAnsweredTime)
          : null;
    } catch (error) {
      logger.error(
        codeFileName,
        funcName,
        "Error in typecasting: " + error.message
      );
    }

    return status;
  }

  static async getStatus() {
    return AppStatus.status;
  }

  static async initAppStatus() {
    const funcName = "initAppStatus";
    try {
      const _value = await AsyncStorage.getItem("@AppStatus");
      if (_value !== null) {
        AppStatus.status = AppStatus.typeCast(JSON.parse(_value));
        logger.info(
          codeFileName,
          funcName,
          "Current status: " + JSON.stringify(AppStatus.status)
        );
      } else {
        logger.info(
          codeFileName,
          funcName,
          "AppStatus does not exist in the storage. Storing current status: " +
            JSON.stringify(AppStatus.status)
        );

        try {
          await AsyncStorage.setItem(
            "@AppStatus",
            JSON.stringify(AppStatus.status)
          );
        } catch (error) {
          logger.error(
            codeFileName,
            funcName,
            "Failed to store app status in async storage: " + error.message
          );
          await utilities.showErrorDialog(
            codeFileName,
            funcName,
            "Failed to store app status in async storage."
          );
        }
      }
    } catch (error) {
      logger.error(
        codeFileName,
        funcName,
        "Failed to get app status in async storage: " + error.message
      );
    }
  }

  static async setAppStatus(newStatus, callerClass, callerFunc) {
    const funcName = "setAppStatus";
    let _currentStatus = null;
    try {
      const _value = await AsyncStorage.getItem("@AppStatus");
      if (_value !== null) {
        _currentStatus = AppStatus.typeCast(JSON.parse(_value));
      } else {
        logger.error(codeFileName, funcName, "Got null for app status.");
        await utilities.showErrorDialog(
          codeFileName,
          funcName,
          "Got null for app status."
        );
      }
    } catch (error) {
      logger.error(codeFileName, funcName, "Failed to load app status.");
      await utilities.showErrorDialog(
        codeFileName,
        funcName,
        "Failed to load app status."
      );
    }

    await logger.info(
      codeFileName,
      "setAppStatus",
      "Updating app status by " +
        callerClass +
        "." +
        callerFunc +
        ". Current app status :" +
        JSON.stringify(_currentStatus) +
        ". New app status:" +
        JSON.stringify(AppStatus.status)
    );

    if (newStatus.SurveyStatus !== _currentStatus.SurveyStatus) {
      await logger.info(
        codeFileName,
        funcName,
        "Survey status changed. Current: " +
          _currentStatus.SurveyStatus +
          ". New: " +
          newStatus.SurveyStatus +
          ". Uploading this event."
      );

      utilities.uploadData(
        {
          CurrentSurveyStatus: _currentStatus.SurveyStatus,
          NewSurveyStatus: newStatus.SurveyStatus,
          CurrentSurveyId: _currentStatus.CurrentSurveyID,
          NewSurveyId: newStatus.CurrentSurveyID,
          Time: new Date()
        },
        _currentStatus.UUID,
        "SurveyStatusChanged",
        codeFileName,
        funcName,
        AppStatus.fileUploadCallBack
      );
    }

    Object.keys(AppStatus.status).forEach(key => {
      if (key in newStatus) {
        AppStatus.status[key] = newStatus[key];
      }
    });

    AppStatus.status = AppStatus.typeCast(AppStatus.status);

    try {
      await AsyncStorage.setItem(
        "@AppStatus",
        JSON.stringify(AppStatus.status)
      );
    } catch (error) {
      logger.error(
        codeFileName,
        funcName,
        "Failed to store app status in async storage: " + error.message
      );
      await utilities.showErrorDialog(
        codeFileName,
        funcName,
        "Failed to store app status in async storage."
      );
      await utilities.showErrorDialog(
        codeFileName,
        funcName,
        "Failed to save app status."
      );
    }
  }

  static fileUploadCallBack(success, error = null, data = null) {
    //need to move this function in utility
    if (!success) {
      logger.error(
        codeFileName,
        "fileUploadCallBack",
        `Failed to upload file, error: ${error}.  Saving in file: ${data !=
          null}`
      );
      if (data != null) {
        utilities.writeJSONFile(
          data,
          RNFS.DocumentDirectoryPath +
            "/survey--status--changed--" +
            Date.now().toString() +
            ".js",
          codeFileName,
          "fileUploadCallBack"
        );
      }
    }
  }
}
