import * as RNFS from "react-native-fs";
import AsyncStorage from "@react-native-community/async-storage";
import * as Sentry from "@sentry/react-native";
import UUIDGenerator from "react-native-uuid-generator";

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

  static safeToAccessStatus = true;

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

  static async getStatus(callerClass, callerFunc) {
    const funcName = "getStatus";

    while(!AppStatus.safeToAccessStatus)
    {
        //wait until it is safe to access status
    }
    AppStatus.safeToAccessStatus = false;

    const _status = AppStatus.status;
    if (_status.UUID === null || _status.InstallationDate === null) {
      logger.error(
        codeFileName,
        "getStatus",
        "UUID or InstallationDate is null!" +
          "UUID: " +
          _status.UUID +
          ", InstallationDate: " +
          _status.InstallationDate +
          ", caller: " +
          callerClass +
          ":" +
          callerFunc +
          "."
      );

      await utilities.uploadData(
        {
          UUID: _status.UUID,
          InstallationDate: _status.InstallationDate,
          Caller: callerClass + ":" + callerFunc,
          Time: new Date()
        },
        "DummyUUID",
        "ErrorEvent",
        codeFileName,
        funcName,
        AppStatus.fileUploadCallBack
      );

      await utilities.showErrorDialog(
        codeFileName,
        funcName,
        "Failed to load app status."
      );
    }

    AppStatus.safeToAccessStatus = true;

    return _status;
  }

   static async reloadStatus(callerClass, callerFunc)
    {
      const funcName = "reloadStatus";

      while(!AppStatus.safeToAccessStatus)
      {
          //wait until it is safe to access status
      }
      AppStatus.safeToAccessStatus = false;

      try
      {
          const _value = await AsyncStorage.getItem("@AppStatus");
          if(_value===null)
          {
              logger.error(codeFileName, funcName, "AppStatus is null! Caller: "+callerClass+":"+callerFunc+".");

               await utilities.uploadData(
                  {
                    Message: "AppStatus is null",
                    Caller: callerClass+":"+callerFunc,
                    Time: new Date(),
                  },
                  "DummyUUID",
                  "ErrorEvent",
                  codeFileName,
                  funcName,
                  AppStatus.fileUploadCallBack
                );
          }
          AppStatus.status = AppStatus.typeCast(JSON.parse(_value));
          if(AppStatus.status.InstallationDate===null || AppStatus.status.UUID===null)
          {
              logger.error(codeFileName, "getStatus", 'UUID or InstallationDate is null!'+
                  'UUID: '+ AppStatus.status.UUID+', InstallationDate: '+ AppStatus.status.InstallationDate+
                  ', caller: '+callerClass+":"+callerFunc+".");

               await utilities.uploadData(
                  {
                    UUID: AppStatus.status.UUID,
                    InstallationDate: AppStatus.status.InstallationDate,
                    Caller: callerClass+":"+callerFunc,
                    Time: new Date(),
                  },
                  "DummyUUID",
                  "ErrorEvent",
                  codeFileName,
                  funcName,
                  AppStatus.fileUploadCallBack
                );
          }
      }
      catch(error)
      {
          logger.error(codeFileName, funcName, "Failed to reload AppStatus! Caller: "+callerClass+":"+callerFunc+".");
          await utilities.uploadData(
              {
                Message: "Failed to reload AppStatus.",
                Caller: callerClass+":"+callerFunc,
                Time: new Date(),
              },
              "DummyUUID",
              "ErrorEvent",
              codeFileName,
              funcName,
              AppStatus.fileUploadCallBack
            );
      }

      AppStatus.safeToAccessStatus=true;
      return AppStatus.status;
    }

  static async initAppStatus() {
    const funcName = "initAppStatus";

    while(!AppStatus.safeToAccessStatus)
    {
        //wait until it is safe to access status
    }
    AppStatus.safeToAccessStatus=false;

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
          "AppStatus does not exist in the storage. Initializing it for the first time."
        );

        const _uuid = await UUIDGenerator.getRandomUUID();
        const _installationDate = new Date();
        AppStatus.status.InstallationDate = _installationDate;
        AppStatus.status.LastSurveyCreationDate = _installationDate; //this should not be a problem, since survey count is still zero.
        AppStatus.status.UUID = _uuid;

        logger.info(
          codeFileName,
          funcName,
          "Current status: " + JSON.stringify(AppStatus.status)
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

    AppStatus.safeToAccessStatus=true;
  }

  static async setAppStatus(newStatus, callerClass, callerFunc) {
    const funcName = "setAppStatus";

    while(!AppStatus.safeToAccessStatus)
    {
        //wait until it is safe to access status
    }
    AppStatus.safeToAccessStatus=false;

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
    }

    AppStatus.safeToAccessStatus=true;
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
