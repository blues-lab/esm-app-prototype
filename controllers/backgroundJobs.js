import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  AppState
} from "react-native";
import * as RNFS from "react-native-fs";
import { NetworkInfo } from "react-native-network-info";
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";

import logger from "./logger";
import notificationController from "./notificationController";
import appStatus from "./appStatus";
import utilities from "./utilities";
import {
  USER_SETTINGS_FILE_PATH,
  SURVEY_STATUS,
  INVITATION_CODE_FILE_PATH,
  MAX_SURVEY_PER_DAY,
  LOG_FILE_PATH,
  PROMPT_DURATION
} from "./constants";
import { LOCATION_SHARE_PROMPT } from "./strings";

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
  const _ssid = await NetworkInfo.getSSID();
  if (_ssid === null || _ssid.length === 0 || _ssid === "<unknown ssid>") {
    logger.info(
      codeFileName,
      "promptToShareLocation",
      "Obtained ssid: " + _ssid + ". Checking if location sharing is enabled."
    );

    let _locationSharingEnabled = false;
    try {
      const _locationEnabled = await LocationServicesDialogBox.checkLocationServicesIsEnabled(
        {
          showDialog: false, // false => Opens the Location access page directly
          openLocationServices: false // false => Directly catch method is called if location services are turned off
        }
      );
      logger.info(
        codeFileName,
        "promptToShareLocation",
        JSON.stringify(_locationEnabled)
      );

      _locationSharingEnabled = _locationEnabled.status === "enabled";
    } catch (error) {
      logger.error(
        codeFileName,
        "promptToShareLocation",
        "Error in getting location. May not be enabled."
      );
    }

    if (_locationSharingEnabled) {
      _appStatus.LastLocationAccess = new Date();
      await appStatus.setAppStatus(_appStatus);
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
        await appStatus.setAppStatus(_appStatus);
      }
    }
  }

  return _showPrompt;
}

export async function showPrompt() {
  const _appStatus = await appStatus.loadStatus();
  logger.info(
    codeFileName,
    "showPrompt",
    "Current app status:" + JSON.stringify(_appStatus)
  );

  let _userSettingsData = null;
  try {
    const _fileExists = await RNFS.exists(USER_SETTINGS_FILE_PATH);
    if (_fileExists) {
      const _fileContent = await RNFS.readFile(USER_SETTINGS_FILE_PATH);
      logger.info(
        codeFileName,
        "showPrompt",
        "Read user settings file:" + _fileContent
      );
      _userSettingsData = JSON.parse(_fileContent);
    }
  } catch (error) {
    logger.error(
      codeFileName,
      "showPrompt",
      "Failed to read user settings file:" + error.message
    );
  }

  if (_userSettingsData === null) {
    logger.error(
      codeFileName,
      "showPrompt",
      "Fatal error: user settings data is null!"
    );
    return;
  }

  if (await promptToShareLocation(_appStatus)) {
    logger.info(
      codeFileName,
      "showPrompt",
      "promptToShareLocation returned true. Returning."
    );
    return;
  }

  //check if home wifi is set and connected to home wifi
  const _ssid = await NetworkInfo.getSSID();
  if (
    _userSettingsData.homeWifi.length === 0 ||
    _ssid !== _userSettingsData.homeWifi
  ) {
    logger.info(
      codeFileName,
      "showPrompt",
      `Current SSID: ${_ssid}. Home Wifi: ${_userSettingsData.homeWifi} . Returning.`
    );
    notificationController.cancelNotifications();
    return;
  }
  logger.info(codeFileName, "showPrompt", "Obtained wifi:" + _ssid + ".");

  //Check if in "Don't disturb" times (Sunday is 0, Monday is 1)
  const _doNotDisturb = isInDoNotDisturbTime(_userSettingsData);

  if (_doNotDisturb) {
    logger.info(
      codeFileName,
      "showPrompt",
      'Inside "Do not disturb" mode. Canceling all notification and returning.'
    );
    notificationController.cancelNotifications();
  } else {
    logger.info(codeFileName, "showPrompt", 'Not in "Do not disturb" mode.');

    //Check if study period has ended
    if (utilities.surveyPeriodEnded(_appStatus)) {
      const _remainingDays = utilities.exitSurveyAvailableDays(_appStatus);
      logger.info(
        codeFileName,
        "initApp",
        "ESM period ended. Exit survey done? " +
          _appStatus.ExitSurveyDone +
          ". Exit survey remaining days: " +
          _remainingDays
      );

      if (_appStatus.ExitSurveyDone || _remainingDays <= 0) {
        return;
      } else {
        logger.info(
          codeFileName,
          "showPrompt",
          "Remaining days for exit survey:" +
            _remainingDays +
            ". Last notification was shown:" +
            _appStatus.LastNotificationTime
        );
        const _hourPassed = Math.floor(
          (Date.now() - _appStatus.LastNotificationTime) / (60 * 60000)
        );
        logger.info(
          codeFileName,
          "showPrompt",
          "Hours passed since last notification:" + _hourPassed
        );
        if (true || _hourPassed >= 24) {
          logger.info(
            codeFileName,
            "showPrompt",
            "Showing new notification for exit survey updating app status."
          );
          notificationController.cancelNotifications();
          notificationController.showNotification(
            "Final survey available!",
            "Complete it within " + _remainingDays + " days to get $1"
          );

          _appStatus.LastNotificationTime = new Date();
          await appStatus.setAppStatus(_appStatus);
        }

        return;
      }
    }

    logger.info(codeFileName, "showPrompt", "Still in ESM study period.");

    //check if the date of last survey creation was before today, if so, reset variables.
    await logger.info(
      codeFileName,
      "showPrompt",
      "_appStatus.LastSurveyCreationDate:" +
        _appStatus.LastSurveyCreationDate +
        " type:" +
        typeof _appStatus.LastSurveyCreationDate
    );
    if (
      _appStatus.LastSurveyCreationDate === null ||
      before(_appStatus.LastSurveyCreationDate, new Date())
    ) {
      logger.info(
        codeFileName,
        "showPrompt",
        "Last survey was created at a previous day:" +
          _appStatus.setLastNotificationTime +
          ". Resetting appStatus.SurveyCountToday and setting survey status to NOT_AVAILABLE."
      );

      _appStatus.SurveyCountToday = 0;
      _appStatus.SurveyStatus = SURVEY_STATUS.NOT_AVAILABLE;
      await appStatus.setAppStatus(_appStatus);
    }

    if (_appStatus.SurveyStatus === SURVEY_STATUS.NOT_AVAILABLE) {
      //if no survey is available, randomly create one
      logger.info(
        codeFileName,
        "showPrompt",
        "No survey available; checking if already completed survey today."
      );
      if (_appStatus.SurveyStatus !== SURVEY_STATUS.COMPLETED) {
        if (_appStatus.SurveyCountToday >= MAX_SURVEY_PER_DAY) {
          logger.info(
            codeFileName,
            "showPrompt",
            "Survey not completed today. Already " +
              _appStatus.SurveyCountToday +
              " surveys were created. Returning"
          );
          return;
        }
        const _createSurvey = (Math.floor(Math.random() * 100) + 1) % 2 === 0;
        logger.info(
          codeFileName,
          "showPrompt",
          "Randomly creating survey:" + _createSurvey
        );

        if (_createSurvey) {
          const _remainingTime = PROMPT_DURATION;
          notificationController.cancelNotifications();
          notificationController.showNotification(
            "New survey available!",
            "Complete within " + _remainingTime + " minutes to get $1!!!"
          );

          logger.info(
            codeFileName,
            "showPrompt",
            "Created new survey. Updating app status."
          );
          const _currentDate = new Date();
          _appStatus.SurveyCountToday += 1;
          _appStatus.SurveyStatus = SURVEY_STATUS.AVAILABLE;
          _appStatus.LastSurveyCreationDate = _currentDate;
          _appStatus.FirstNotificationTime = _currentDate;
          _appStatus.LastNotificationTime = _currentDate;
          await appStatus.setAppStatus(_appStatus);

          logger.info(
            codeFileName,
            "showPrompt",
            "Notification for new survey is shown."
          );
        }
      } else {
        logger.info(
          codeFileName,
          "showPrompt",
          "Survey already completed today."
        );
      }
    } else if (_appStatus.SurveyStatus === SURVEY_STATUS.AVAILABLE) {
      //Survey is available, show prompt if there is still time, or make survey expired

      logger.info(codeFileName, "showPrompt", "Survey available.");
      const _firstNotificationTime = _appStatus.FirstNotificationTime;
      if (_firstNotificationTime === null) {
        logger.error(
          codeFileName,
          "showPrompt",
          "Fatal error: FirstNotificationTime is null. Returning."
        );
        return;
      }

      const _minPassed = Math.floor(
        (Date.now() - _firstNotificationTime) / 60000
      );
      logger.info(
        codeFileName,
        "showPrompt",
        _minPassed.toString() +
          " minutes have passed since the first notification date at " +
          _firstNotificationTime
      );

      const _remainingTime = PROMPT_DURATION - _minPassed;
      if (_remainingTime <= 0) {
        //survey expired, remove all existing notification
        logger.info(
          codeFileName,
          "showPrompt",
          "Remaining time " + _remainingTime + ", cancelling notifications."
        );
        notificationController.cancelNotifications();
        logger.info(
          codeFileName,
          "showPrompt",
          "Changing survey status to NOT_AVAILABLE."
        );
        await appStatus.setSurveyStatus(SURVEY_STATUS.NOT_AVAILABLE);
      } else if (_remainingTime >= 15) {
        logger.info(
          codeFileName,
          "showPrompt",
          "Remaining time:" + _remainingTime + ". Updating notification."
        );

        notificationController.cancelNotifications();
        notificationController.showNotification(
          "New survey available!",
          "Complete within " + _remainingTime + " minutes to get $1!!!"
        );
        logger.info(
          codeFileName,
          "showPrompt",
          "Showing latest notification at: " + new Date()
        );
        await appStatus.setLastNotificationTime(new Date());
      } else {
        logger.info(
          codeFileName,
          "showPrompt",
          "Remaining time:" +
            _remainingTime +
            ". Not showing any new notification."
        );
      }
    } else if (_appStatus.SurveyStatus === SURVEY_STATUS.ONGOING) {
      //if ongoing and app not in 'active' mode, prompt again
      if (AppState.currentState === "background") {
        logger.info(
          codeFileName,
          "showPrompt",
          "Survey is ongoing but app is in " +
            AppState.currentState +
            ". Updating notification."
        );
        const _firstNotificationTime = _appStatus.FirstNotificationTime;
        if (_firstNotificationTime === null) {
          logger.error(
            codeFileName,
            "showPrompt",
            "Fatal error: FirstNotificationTime is null. Returning."
          );
          return;
        }

        const _minPassed = Math.floor(
          (Date.now() - _firstNotificationTime) / 60000
        );
        logger.info(
          codeFileName,
          "showPrompt",
          _minPassed.toString() +
            " minutes have passed since the last notification date at " +
            _firstNotificationTime
        );

        const _remainingTime = PROMPT_DURATION - _minPassed;
        if (_remainingTime > 0) {
          logger.info(
            codeFileName,
            "showPrompt",
            "Remaining time:" + _remainingTime + ". Updating notification."
          );

          notificationController.cancelNotifications();
          notificationController.showNotification(
            "Survey is still available!",
            "Complete within " + _remainingTime + " minutes to get $1!!!"
          );
          logger.info(
            codeFileName,
            "showPrompt",
            "Showing latest notification at: " + new Date()
          );
          await appStatus.setLastNotificationTime(new Date());
        }
      }
    }
  }
}

async function uploadFilesInDir(dirName, fileNamePattern, _appStatus) {
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
        "Uploading survey response file:" + _file
      );
      const _filePath = RNFS.DocumentDirectoryPath + "/" + _file;
      const _fileContent = await RNFS.readFile(_filePath);
      const _uploaded = await utilities.uploadData(
        _fileContent,
        _appStatus.UUID,
        "SurveyResponse",
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
    _appStatus
  );
  await logger.info(
    codeFileName,
    "uploadFiles",
    "Attempting to upload partial survey response files."
  );
  await uploadFilesInDir(
    RNFS.DocumentDirectoryPath,
    "partial-survey--response--",
    _appStatus
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
  const _appStatus = await appStatus.loadStatus();
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
    await logger.info(
      codeFileName,
      "uploadFiles",
      "SSID:" + _ssid + ". Attempting to upload files."
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
