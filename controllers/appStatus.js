import * as RNFS from "react-native-fs";
import logger from "./logger";
import utilities from "./utilities";
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
      InstallationDate: null,
      UUID: null,
      Debug: false,
      LastSurveyCreationDate: null, //date when the last survey was created. Needed to reset counts.
      CurrentSurveyID: null,
      ExitSurveyDone: false,
      LastLocationAccess: null, //when was the last time location sharing was enabled.
      LastLocationPromptTime: null, //when was the last time location sharing prompt was shown.
      EligibleForBonus: true // indicates whether this person is eligible to receive bonus for daily survey
    };
  }

  async loadStatus() {
    let _fileContent = null;
    try {
      const _fileExists = await RNFS.exists(APP_STATUS_FILE_PATH);
      if (_fileExists) {
        _fileContent = await RNFS.readFile(APP_STATUS_FILE_PATH);
        this.status = JSON.parse(_fileContent);
        this.status.InstallationDate = new Date(this.status.InstallationDate);
        if (this.status.FirstNotificationTime != null) {
          this.status.FirstNotificationTime = new Date(
            this.status.FirstNotificationTime
          );
        }
        if (this.status.LastNotificationTime != null) {
          this.status.LastNotificationTime = new Date(
            this.status.LastNotificationTime
          );
        }
        if (this.setLastSurveyCreationDate != null) {
          this.status.LastSurveyCreationDate = new Date(
            this.status.LastSurveyCreationDate
          );
        }

        if (this.status.LastLocationAccess != null) {
          this.status.LastLocationAccess = new Date(
            this.status.LastLocationAccess
          );
        }

        if (this.status.LastLocationPromptTime != null) {
          this.status.LastLocationPromptTime = new Date(
            this.status.LastLocationPromptTime
          );
        }
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
    }

    return this.status;
  }

  async setAppStatus(status) {
    Object.keys(status).forEach(key => {
      this.status[key] = status[key];
    });

    await logger.info(
      codeFileName,
      "setAppStatus",
      "Current app status :" + JSON.stringify(this.status)
    );
    await utilities.writeJSONFile(
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

  async incrementSurveyCountToday() {
    this.status.SurveyCountToday += 1;
    logger.info(
      `${codeFileName}`,
      "incrementSurveyCountToday",
      "Incrementing survey count to " + this.status.SurveyCountToday
    );
    await this.saveAppStatus();
  }

  async resetSurveyCountToday() {
    this.status.SurveyCountToday = 0;
    logger.info(
      `${codeFileName}`,
      "resetSurveyCountToday",
      "Resetting survey count to " + this.status.SurveyCountToday
    );
    await this.saveAppStatus();
  }

  async setLastNotificationTime(value) {
    this.status.LastNotificationTime = value;
    logger.info(
      `${codeFileName}`,
      "setLastNotificationTime",
      "Setting last notification time to " + this.status.LastNotificationTime
    );
    await this.saveAppStatus();
  }

  async setFirstNotificationTime(value) {
    this.status.FirstNotificationTime = value;
    logger.info(
      `${codeFileName}`,
      "setFirstNotificationTime",
      "Setting first notification time to " + this.status.FirstNotificationTime
    );
    await this.saveAppStatus();
  }

  async setSurveyStatus(value) {
    this.status.SurveyStatus = value;
    logger.info(
      codeFileName,
      "setSurveyStatus",
      "Setting Survey Status to " + this.status.SurveyStatus
    );
    await this.saveAppStatus();
  }

  async increaseCompletedSurveys() {
    this.status.CompletedSurveys += 1;
    logger.info(
      codeFileName,
      "increaseCompletedSurveys",
      "Increasing completed surveys to " + this.status.CompletedSurveys
    );
    await this.saveAppStatus();
  }

  async setInstallationDate(value) {
    this.status.InstallationDate = value;
    logger.info(
      codeFileName,
      "setInstallationDate",
      "Setting installation date to " + this.status.InstallationDate
    );
    await this.saveAppStatus();
  }

  async setUUID(value) {
    this.status.UUID = value;
    logger.info(codeFileName, "setUUID", "Setting UUID to " + this.status.UUID);
    await this.saveAppStatus();
  }

  async setLastSurveyCreationDate(value) {
    this.status.LastSurveyCreationDate = value;
    logger.info(
      codeFileName,
      "setLastSurveyCreationDate",
      "Setting LastSurveyCreationDate to " + this.status.LastSurveyCreationDate
    );
    await this.saveAppStatus();
  }

  async setCurrentSurveyID(value) {
    this.status.CurrentSurveyID = value;
    logger.info(
      codeFileName,
      "setCurrentSurveyID",
      "Setting CurrentSurveyID to " + this.status.CurrentSurveyID
    );
    await this.saveAppStatus();
  }

  static getAppStatus() {
    let instance = null;
    if (instance == null) {
      instance = new AppStatus();
      instance.loadStatus().then(_instance => {
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
