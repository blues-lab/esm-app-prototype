import * as RNFS from "react-native-fs";
import { Alert } from "react-native";
import logger from "./logger";
import * as utilities from "./utilities";
import * as strings from "./strings";
import { SURVEY_STATUS, APP_STATUS_FILE_PATH } from "./constants";

const codeFileName = "appStatus.js";

class AppStatus {
  constructor() {
    this.status = {
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
      CurrentSurveyID: null,
      ExitSurveyDone: false,
      LastLocationAccess: null, //when was the last time location sharing was enabled.
      LastLocationPromptTime: null, //when was the last time location sharing prompt was shown.
      EligibleForBonus: true // indicates whether this person is eligible to receive bonus for daily survey
    };

    this.state = { saving: false };
  }

  async loadStatus() {
    return this.status;
  }

  async loadStatusFromFile() {
    let _fileContent = null;
    let status = {};
    try {
      const _fileExists = await RNFS.exists(APP_STATUS_FILE_PATH);
      if (_fileExists) {
        _fileContent = await RNFS.readFile(APP_STATUS_FILE_PATH);
        status = JSON.parse(_fileContent);

        Object.keys(this.status).forEach(key => {
          if (key in status) {
            this.status[key] = status[key];
          }
        });

        this.status.InstallationDate = new Date(status.InstallationDate);
        this.status.FirstNotificationTime =
          "FirstNotificationTime" in status
            ? new Date(status.FirstNotificationTime)
            : null;
        this.status.LastNotificationTime =
          "LastNotificationTime" in status
            ? new Date(status.LastNotificationTime)
            : null;
        this.status.LastSurveyCreationDate =
          "LastSurveyCreationDate" in status
            ? new Date(status.LastSurveyCreationDate)
            : null;
        this.status.LastLocationAccess =
          "LastLocationAccess" in status
            ? new Date(status.LastLocationAccess)
            : null;
        this.status.LastLocationPromptTime =
          "LastLocationPromptTime" in status
            ? new Date(status.LastLocationPromptTime)
            : null;
      } else {
        await logger.info(
          codeFileName,
          "loadStatus",
          "App status file does not exist so creating a new one."
        );
        await utilities.writeJSONFile(
          this.status,
          APP_STATUS_FILE_PATH,
          codeFileName,
          "loadStatus"
        );
      }
    } catch (error) {
      logger.error(
        codeFileName,
        "loadStatus",
        "Failed to read app status file:" +
          error.message +
          ". _fileContent:" +
          _fileContent
      );

      await utilities.showErrorDialog(
        codeFileName,
        "loadStatus",
        "Failed to load app status: " + error.message
      );
    }

    return this.status;
  }

  async setAppStatus(status, callerClass, callerFunc) {
    await logger.info(
      codeFileName,
      "setAppStatus",
      "Updating app status by " +
        callerClass +
        "." +
        callerFunc +
        ". Current app status :" +
        JSON.stringify(this.status) +
        ". Next app status:" +
        JSON.stringify(status)
    );

    Object.keys(this.status).forEach(key => {
      if (key in status) {
        this.status[key] = status[key];
      }
    });

    const _saved = await utilities.writeJSONFile(
      this.status,
      APP_STATUS_FILE_PATH,
      codeFileName,
      "saveAppStatus"
    );
  }

  async saveAppStatus() {
    await utilities.writeJSONFile(
      this.status,
      APP_STATUS_FILE_PATH,
      codeFileName,
      "saveAppStatus"
    );
  }

  static getAppStatus() {
    let instance = null;
    if (instance == null) {
      instance = new AppStatus();
      instance.loadStatusFromFile().then(_instance => {
        logger.info(
          codeFileName,
          "getAppStatus",
          "Creating static AppStatus instance. Current status: " +
            JSON.stringify(_instance)
        );
      });
    }
    return instance;
  }
}

const appStatus = AppStatus.getAppStatus();
export default appStatus;
