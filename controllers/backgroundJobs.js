import { Platform, StyleSheet, AppState } from "react-native";
import * as RNFS from "react-native-fs";
import { NetworkInfo } from "react-native-network-info";
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";

import logger from "./logger";
import notificationController from "./notificationController";
import AppStatus from "./appStatus";
import * as utilities from "./utilities";
import {
  USER_SETTINGS_FILE_PATH,
  SURVEY_STATUS,
  INVITATION_CODE_FILE_PATH,
  MAX_SURVEY_PER_DAY,
  LOG_FILE_PATH,
  PROMPT_DURATION,
  SURVEY_ALLOWED_TO_COMPLETE
} from "./constants";
import {
  LOCATION_SHARE_PROMPT,
  NEW_SURVEY_AVAILABLE,
  SURVEY_TIME,
  ONGOING_SURVEY,
  FINAL_SURVEY_AVAILABLE,
  FINAL_SURVEY_TIME
} from "./strings";

const codeFileName = "backgroundJobs.js";

function isInDoNotDisturbTime(settings) {
  if (settings.afterTime === settings.beforeTime) {
    //user did not set time, return false
    logger.info(
      codeFileName,
      "isInDoNotDisturbTime",
      "User did not specify time. After time:" +
        settings.afterTime +
        ". Before time:" +
        settings.beforeTime +
        ". Returning false."
    );
    return false;
  }
  const _date = new Date();
  const _hours =
    _date.getHours() > 9 ? _date.getHours() : "0" + _date.getHours();
  const _min =
    _date.getMinutes() > 9 ? _date.getMinutes() : "0" + _date.getMinutes();
  const _current = _hours + ":" + _min;

  logger.info(
    codeFileName,
    "isInDoNotDisturbTime",
    `Do not disturb afterTime:${settings.afterTime} and beforeTime:${settings.beforeTime}. Current time:${_current}`
  );
  let _doNotDisturb = false;
  if (settings.afterTime < settings.beforeTime) {
    _doNotDisturb =
      _current > settings.afterTime && _current < settings.beforeTime;
  } else {
    _doNotDisturb =
      (_current > settings.afterTime && _current < "23:59") ||
      (_current > "00:00" && _current < settings.beforeTime);
  }

  return _doNotDisturb;
}

function sameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function before(d1, d2) {
  //returns true if d1 is before d2
  return (
    d1.getFullYear() < d2.getFullYear() ||
    d1.getMonth() < d2.getMonth() ||
    d1.getDate() < d2.getDate()
  );
}

async function promptToShareLocation(_appStatus) {
  //Return true if prompted for location sharing
  //else return false

  let _showPrompt = false;
  const _locationSharingEnabled = utilities.isLocationSharingEnabled();

  if (_locationSharingEnabled) {
    _appStatus.LastLocationAccess = new Date();
    await AppStatus.setAppStatus(_appStatus);
    _showPrompt = false;
  } else {
    logger.info(
      codeFileName,
      "promptToShareLocation",
      "_appStatus.LastLocationAccess : " +
        _appStatus.LastLocationAccess +
        ", _appStatus.LastLocationPromptTime : " +
        _appStatus.LastLocationPromptTime +
        "."
    );
    let _hoursSinceAccess = 24;
    let _hoursSincePrompt = 24;
    if (_appStatus.LastLocationAccess != null) {
      _hoursSinceAccess = Math.floor(
        (Date.now() - _appStatus.LastLocationAccess) / (60 * 60000)
      );
    }
    if (_appStatus.LastLocationPromptTime != null) {
      _hoursSincePrompt = Math.floor(
        (Date.now() - _appStatus.LastLocationPromptTime) / (60 * 60000)
      );
    }

    logger.info(
      codeFileName,
      "promptToShareLocation",
      "Last location access was " +
        _hoursSinceAccess +
        " hours ago. Last prompt was shown " +
        _hoursSincePrompt +
        " hours ago."
    );

    if (_hoursSinceAccess >= 24 && _hoursSincePrompt >= 24) {
      _showPrompt = true;
    } else {
      logger.info(
        codeFileName,
        "promptToShareLocation",
        "Not showing prompt to enable location sharing. Returning."
      );
    }

    if (_showPrompt) {
      logger.info(
        codeFileName,
        "promptToShareLocation",
        "Showing prompt to enable location sharing and returning."
      );
      notificationController.cancelNotifications();
      notificationController.showNotification(
        "Location",
        LOCATION_SHARE_PROMPT
      );

      _appStatus.LastLocationPromptTime = new Date();
      await AppStatus.setAppStatus(_appStatus);
    }
  }

  return _showPrompt;
}

function createSurvey(userSettings)
{
    const funcName = 'createSurvey';

    const _currentDate = new Date();
    const _doNotDisturbStartHour = parseInt(userSettings.afterTime.split(":")[0], 10);
    const _doNotDisturbEndHour = parseInt(userSettings.beforeTime.split(":")[0], 10);

    const _doNotDisturbHours = (_doNotDisturbEndHour+24 - _doNotDisturbStartHour)%24;
    const _hoursLeft = (_doNotDisturbStartHour + 24 - _currentDate.getHours())%24;

    const _denominator = _hoursLeft- _doNotDisturbHours;
    const _surveyProb = 1/Math.max(1, _denominator);
    const _rand = Math.random();
    const _createSurvey =  _rand <= _surveyProb;

    logger.info(codeFileName, funcName,
        "Do not disturb window: ("+ userSettings.afterTime+", "+userSettings.beforeTime+"). "+
                "Current hour of day: "+_currentDate.getHours()+ ", do-not-disturb-hours:" +_doNotDisturbHours + ", hours left: "+ _hoursLeft+
                ", denominator: "+_denominator+
                ". Random: "+ _rand+", survey prob: "+_surveyProb+", create survey: "+ _createSurvey+'.'
    );

    return _createSurvey;
}


async function handleSurveyNotAvailableState(_appStatus, userSettings) {
  /*
        Function to handle when currently no survey is available.
        Depending on the status variables, it will (not) create new surveys.
    */

  const funcName = "handleSurveyNotAvailableState";

  logger.info(
    codeFileName,
    "showPrompt",
    "No survey available now" +
      ". Surveys created today: " +
      _appStatus.SurveyCountToday +
      ". Surveys answered today: " +
      _appStatus.SurveysAnsweredToday +
      ". Max survey per day: " +
      MAX_SURVEY_PER_DAY +
      ". Participant eligible for bonus: " +
      _appStatus.EligibleForBonus
  );

  if (_appStatus.SurveyCountToday >= MAX_SURVEY_PER_DAY) {
    //Already max surveys were created, check if this participant is eligible for bonus or not
    if (
      _appStatus.EligibleForBonus &&
      _appStatus.SurveysAnsweredToday < SURVEY_ALLOWED_TO_COMPLETE
    ) {
      logger.info(
        codeFileName,
        "showPrompt",
        "Making this participant ineligible to get bonus."
      );
      _appStatus.EligibleForBonus = false;
      await AppStatus.setAppStatus(_appStatus);
    }
  } else {
    //May be randomly create a new survey
    if (_appStatus.SurveysAnsweredToday < SURVEY_ALLOWED_TO_COMPLETE) {
      //check if any survey was answered in past two hours
      if (_appStatus.LastSurveyAnsweredTime !== null) {
        const _hourPassed = Math.floor(
          (Date.now() - _appStatus.LastSurveyAnsweredTime) / (60 * 60000)
        );
        logger.info(
          codeFileName,
          funcName,
          "Hours passed since last survey answered:" + _hourPassed
        );
        if (_hourPassed < 2) {
          logger.info(
            codeFileName,
            funcName,
            "Last survey was answered less than 2 hours ago. Returning."
          );
          return;
        }
      }

      // Randomly create a new survey
      const _surveyCreated = createSurvey(userSettings);

      if (_surveyCreated) {
        const _remainingTime = PROMPT_DURATION;
        notificationController.cancelNotifications();
        notificationController.showNotification(
          NEW_SURVEY_AVAILABLE,
          SURVEY_TIME(_remainingTime)
        );

        logger.info(
          codeFileName,
          funcName,
          "Created new survey. Updating app status and uploading survey create event."
        );
        const _currentDate = new Date();
        _appStatus.SurveyCountToday += 1;
        _appStatus.SurveyStatus = SURVEY_STATUS.AVAILABLE;
        _appStatus.LastSurveyCreationDate = _currentDate;
        _appStatus.FirstNotificationTime = _currentDate;
        _appStatus.LastNotificationTime = _currentDate;
        await AppStatus.setAppStatus(_appStatus, codeFileName, funcName);

        utilities.uploadData(
          {
            Stage: "BackgroundJobs.",
            SurveyStatus: "Survey created.",
            Time: _currentDate
          },
          _appStatus.UUID,
          "SurveyStatusChanged",
          codeFileName,
          funcName
          //HomeScreen.fileUploadCallBack
        );

        logger.info(
          codeFileName,
          funcName,
          "Notification for new survey is shown with remaining time: " +
            _remainingTime
        );
      }
    } else {
      logger.info(
        codeFileName,
        funcName,
        "Max allowable number of surveys were already completed today."
      );
    }
  }
}

async function handleESMPeriodEnded(_appStatus) {
  const funcName = "handleESMPeriodEnded";
  const _remainingDays = utilities.exitSurveyAvailableDays(_appStatus);
  logger.info(
    codeFileName,
    funcName,
    "ESM period ended. Exit survey done? " +
      _appStatus.ExitSurveyDone +
      ". Exit survey remaining days: " +
      _remainingDays +
      ". Last notification was shown:" +
      _appStatus.LastNotificationTime
  );

  if (_appStatus.ExitSurveyDone || _remainingDays <= 0) {
    return;
  }

  const _hourPassed = Math.floor(
    (Date.now() - _appStatus.LastNotificationTime) / (60 * 60000)
  );
  logger.info(
    codeFileName,
    funcName,
    "Hours passed since last notification:" + _hourPassed
  );
  if (_hourPassed >= 24) {
    logger.info(
      codeFileName,
      funcName,
      "Showing new notification for exit survey and updating app status."
    );
    notificationController.cancelNotifications();
    notificationController.showNotification(
      FINAL_SURVEY_AVAILABLE,
      FINAL_SURVEY_TIME(_remainingDays)
    );

    _appStatus.LastNotificationTime = new Date();
    await AppStatus.setAppStatus(_appStatus);
  }
}

async function resetVariables(_appStatus) {
  const funcName = "resetVariables";
  await logger.info(
    codeFileName,
    funcName,
    "Last survey creation date: " + _appStatus.LastSurveyCreationDate
  );
  if (
    _appStatus.LastSurveyCreationDate === null ||
    before(_appStatus.LastSurveyCreationDate, new Date())
  ) {
    logger.info(
      codeFileName,
      funcName,
      "Last survey was created on a previous day." +
        " Setting SurveyCountToday=0 and survey status to NOT_AVAILABLE."
    );

    _appStatus.SurveyCountToday = 0;
    _appStatus.SurveyStatus = SURVEY_STATUS.NOT_AVAILABLE;
    await AppStatus.setAppStatus(_appStatus);
  }
}

async function handleSurveyAvailableState(_appStatus) {
  //Survey is available, show prompt if there is still time, or make survey expired
  const funcName = "handleSurveyAvailableState";

  logger.info(codeFileName, funcName, "Survey available.");
  const _firstNotificationTime = _appStatus.FirstNotificationTime;
  if (_firstNotificationTime === null) {
    logger.error(
      codeFileName,
      funcName,
      "Fatal error: FirstNotificationTime is null. Returning."
    );
    return;
  }

  const _minPassed = Math.floor((Date.now() - _firstNotificationTime) / 60000);
  logger.info(
    codeFileName,
    funcName,
    _minPassed.toString() +
      " minutes have passed since the first notification time at " +
      _firstNotificationTime
  );

  const _remainingTime = PROMPT_DURATION - _minPassed;
  logger.info(
    codeFileName,
    funcName,
    "Remaining time " + _remainingTime + "."
  );
  if (_remainingTime <= 0) {
    //survey expired, remove all existing notification
    logger.info(
      codeFileName,
      funcName,
      "Cancelling notifications and changing survey status to NOT_AVAILABLE."
    );

    notificationController.cancelNotifications();
    const _newStatus = _appStatus;
    _appStatus.SurveyStatus = SURVEY_STATUS.NOT_AVAILABLE;
    await AppStatus.setAppStatus(_newStatus);
  }
  else if (_remainingTime>=15)
  {
    logger.info(
        codeFileName,
        funcName,
        "Updating survey prompt."
    );

    notificationController.cancelNotifications();
     notificationController.showNotification(
       NEW_SURVEY_AVAILABLE,
       SURVEY_TIME(_remainingTime)
     );

     const _newStatus = _appStatus;
     _appStatus.LastNotificationTime = new Date();
     await AppStatus.setAppStatus(_newStatus);
  }
}

async function handleSurveyOngoingState(_appStatus) {
  const funcName = "handleSurveyOngoingState";

  //if ongoing and app not in 'active' mode, prompt again
  if (AppState.currentState === "background") {
    logger.info(
      codeFileName,
      funcName,
      "Survey is ongoing but app is in " +
        AppState.currentState +
        ". Updating notification."
    );
    const _firstNotificationTime = _appStatus.FirstNotificationTime;
    if (_firstNotificationTime === null) {
      logger.error(
        codeFileName,
        funcName,
        "Fatal error: FirstNotificationTime is null. Returning."
      );
      return;
    }

    const _minPassed = Math.floor(
      (Date.now() - _firstNotificationTime) / 60000
    );
    logger.info(
      codeFileName,
      funcName,
      _minPassed.toString() +
        " minutes have passed since the last notification date at " +
        _firstNotificationTime
    );

    const _remainingTime = PROMPT_DURATION - _minPassed;
    if (_remainingTime > 0) {
      logger.info(
        codeFileName,
        funcName,
        "Remaining time:" + _remainingTime + ". Updating notification."
      );

      notificationController.cancelNotifications();
      notificationController.showNotification(ONGOING_SURVEY, SURVEY_TIME);
      logger.info(
        codeFileName,
        funcName,
        "Showing latest notification at: " + new Date()
      );
      const _newStatus = _appStatus;
      _appStatus.LastNotificationTime = new Date();
      await AppStatus.setAppStatus(_newStatus);
    }
  }
}
export async function showPrompt() {
  const funcName = "showPrompt";
  const _appStatus = await AppStatus.getStatus();
  logger.info(
    codeFileName,
    funcName,
    "Current app status:" + JSON.stringify(_appStatus)
  );

  const _userSettingsData = await utilities.readJSONFile(
    USER_SETTINGS_FILE_PATH,
    codeFileName,
    funcName
  );
  if (_userSettingsData === null) {
    logger.error(
      codeFileName,
      funcName,
      "Fatal error: user settings data is null!"
    );
    return;
  }

  if (await promptToShareLocation(_appStatus)) {
    logger.info(
      codeFileName,
      funcName,
      "promptToShareLocation returned true. Returning."
    );
    return;
  }

  //check if home wifi is set and connected to home wifi
  const _ssid = await NetworkInfo.getSSID();
  logger.info(
    codeFileName,
    funcName,
    "Obtained ssid. null? " +
      (_ssid === null) +
      "_ssid ==<unknown ssid>? " +
      (_ssid === "<unknown ssid>") +
      "len(homeWifi.length)>0? " +
      (_userSettingsData.homeWifi.length > 0)
  );

  if (
    _userSettingsData.homeWifi.length === 0 ||
    _ssid !== _userSettingsData.homeWifi
  ) {
    logger.info(
      codeFileName,
      funcName,
      "Either home wifi is not set or not connected to. Returning."
    );
    notificationController.cancelNotifications();
    return;
  }

  //Check if in "Don't disturb" times (Sunday is 0, Monday is 1)
  const _doNotDisturb = isInDoNotDisturbTime(_userSettingsData);

  if (_doNotDisturb) {
    logger.info(
      codeFileName,
      funcName,
      'Inside "Do not disturb" mode. Canceling all notification and returning.'
    );
    notificationController.cancelNotifications();
  } else {
    logger.info(codeFileName, funcName, 'Not in "Do not disturb" mode.');

    if (utilities.surveyPeriodEnded(_appStatus)) {
      // ESM study period has ended
      handleESMPeriodEnded(_appStatus);
      return;
    }

    //ESM study period has not ended
    logger.info(codeFileName, "showPrompt", "Still in ESM study period.");

    //check if the date of last survey creation was before today, if so, reset variables.
    await resetVariables(_appStatus);

    if (_appStatus.SurveyStatus === SURVEY_STATUS.NOT_AVAILABLE) {
      await handleSurveyNotAvailableState(_appStatus, _userSettingsData);
    } else if (_appStatus.SurveyStatus === SURVEY_STATUS.AVAILABLE) {
      handleSurveyAvailableState(_appStatus);
    } else if (_appStatus.SurveyStatus === SURVEY_STATUS.ONGOING) {
      await handleSurveyOngoingState(_appStatus);
    }
  }
}

async function uploadFilesInDir(dirName, fileNamePattern, _appStatus, key) {
  const _files = await RNFS.readdir(dirName);
  await logger.info(
    codeFileName,
    "uploadFilesInDir",
    "Directory:" + dirName + ". Files:" + _files.toString()
  );
  for (let i = 0; i < _files.length; i++) {
    const _file = _files[i];
    if (_file.startsWith(fileNamePattern)) {
      await logger.info(
        codeFileName,
        "uploadFilesInDir",
        "Uploading file:" + _file
      );
      const _filePath = RNFS.DocumentDirectoryPath + "/" + _file;
      const _fileContent = await RNFS.readFile(_filePath);
      const _uploaded = await utilities.uploadData(
        _fileContent,
        _appStatus.UUID,
        key,
        codeFileName,
        "uploadFiles"
      );
      if (_uploaded) {
        await logger.info(
          codeFileName,
          "uploadFilesInDir",
          "Uploaded file content for:" + _file + ". Removing file."
        );
        await RNFS.unlink(_filePath);
      } else {
        await logger.error(
          codeFileName,
          "uploadFilesInDir",
          "Failed to upload file:" + _file
        );
      }
    }
  }
}

async function _uploadFiles(_appStatus) {
  //send the invitation code file
  const _fileExists = await RNFS.exists(INVITATION_CODE_FILE_PATH);
  if (_fileExists) {
    const _fileContent = await RNFS.readFile(INVITATION_CODE_FILE_PATH);
    const _uploaded = await utilities.uploadData(
      _fileContent,
      _appStatus.UUID,
      "InvitationCode",
      codeFileName,
      "uploadFiles"
    );
    if (_uploaded) {
      await logger.info(
        codeFileName,
        "uploadFiles",
        "Uploaded invitation code file content."
      );
      await RNFS.unlink(INVITATION_CODE_FILE_PATH);
    } else {
      await logger.error(
        codeFileName,
        "uploadFiles",
        "Failed to upload invitation file content:" +
          JSON.stringify(_fileContent)
      );
    }
  }

  //check if there is any survey/partial survey response files, if so, upload them
  await logger.info(
    codeFileName,
    "uploadFiles",
    "Attempting to upload survey response files."
  );
  await uploadFilesInDir(
    RNFS.DocumentDirectoryPath,
    "survey--response--",
    _appStatus,
    "SurveyResponse"
  );
  await logger.info(
    codeFileName,
    "uploadFiles",
    "Attempting to upload partial survey response files."
  );
  await uploadFilesInDir(
    RNFS.DocumentDirectoryPath,
    "partial-survey--response--",
    _appStatus,
    "PartialSurveyResponse"
  );

  //upload survey status change files
  await logger.info(
    codeFileName,
    "uploadFiles",
    "Attempting to upload survey status change files."
  );
  await uploadFilesInDir(
    RNFS.DocumentDirectoryPath,
    "survey--status--changed--",
    _appStatus,
    "SurveyStatusChanged"
  );

  //upload log file
  await logger.info(
    codeFileName,
    "uploadFiles",
    "Attempting to upload log file."
  );
  const _fileContent = await RNFS.readFile(LOG_FILE_PATH);
  const _uploaded = await utilities.uploadData(
    _fileContent,
    _appStatus.UUID,
    "Log",
    codeFileName,
    "uploadFiles"
  );
  if (_uploaded) {
    await RNFS.writeFile(LOG_FILE_PATH, "");
    await logger.info(
      codeFileName,
      "uploadFiles",
      "Uploaded previous log file content. Replaced with empty file."
    );
  } else {
    await logger.error(
      codeFileName,
      "uploadFiles",
      "Failed to upload log file."
    );
  }
}

export async function uploadFiles() {
  //return if any survey is ongoing
  const _appStatus = await AppStatus.getStatus();
  if (_appStatus.SURVEY_STATUS === SURVEY_STATUS.ONGOING) {
    logger.info(codeFileName, "uploadFiles", "A survey is ongoing. Returning.");
    return;
  }
  await logger.info(
    codeFileName,
    "uploadFiles",
    "Current app state is " +
      AppState.currentState +
      ". Attempting to upload files."
  );

  try {
    const _ssid = await NetworkInfo.getSSID();
    logger.info(
      codeFileName,
      "uploadFiles",
      "Obtained ssid. null? " +
        (_ssid === null) +
        "_ssid ==<unknown ssid>? " +
        (_ssid === "<unknown ssid>")
    );
    await logger.info(
      codeFileName,
      "uploadFiles",
      "Attempting to upload files."
    );
    _uploadFiles(_appStatus);
  } catch (error) {
    await logger.error(
      codeFileName,
      "uploadFiles",
      "Failed to upload files: " + error
    );
  }
}
