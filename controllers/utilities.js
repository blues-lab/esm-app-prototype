import React from "react";
import { Text } from "react-native";
import Mailer from "react-native-mail";
import * as RNFS from "react-native-fs";
import VersionNumber from "react-native-version-number";
import logger from "./logger";
import { STUDY_PERIOD, EXIT_SURVEY_PERIOD } from "./constants";

const fetch = require("node-fetch");

const codeFileName = "utilities.js";

const serviceFileLocal = RNFS.DocumentDirectoryPath + "/services.js";

async function fileExists(path, fileName, callerClass, callerFunc) {
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

export async function writeJSONFile(
  contentToWrite,
  fileName,
  callerClass,
  callerFunc
) {
  try {
    let content = contentToWrite;
    if (typeof content === "object") {
      content = JSON.stringify(content);
    }

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
          "Failed to write content in new file:" +
            error.message +
            ". Restoring backup file."
        );
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

export async function readJSONFile(filePath, callerClass, callerFunc) {
  let result = null;
  try {
    const _fileExists = await RNFS.exists(filePath);
    if (_fileExists) {
      const _fileContent = await RNFS.readFile(filePath);
      logger.info(
        callerClass,
        callerFunc + "-->readJSONFile",
        "Successfully read file. Content:" + _fileContent
      );
      result = JSON.parse(_fileContent);
    } else {
      logger.info(
        callerClass,
        callerFunc + "-->readJSONFile",
        filePath + " does not exist."
      );
    }
  } catch (error) {
    logger.error(
      callerClass,
      callerFunc + "-->readJSONFile",
      "Reading file " + filePath + " failed:" + error.message
    );
  }
  return result;
}

export function sendEmail(recipients, subject, body) {
  try {
    Mailer.mail(
      {
        subject,
        recipients,
        body: `<b>${body}</b>`,
        isHTML: true
      },
      error => {
        logger.error(
          codeFileName,
          "sendEmail",
          "Error sending email:" + error.message
        );
      }
    );
  } catch (error) {
    logger.error(
      codeFileName,
      "sendEmail",
      "Error sending email:" + error.message
    );
  }
}

export async function uploadData(
  data,
  uuid,
  type,
  callerClass,
  callerFunc,
  callBackFunc = null
) {
  let _uploaded = false;
  let _error = "";

  logger.info(
    callerClass,
    callerFunc + "-->uploadData",
    "Uploading data. UUID:" + uuid
  );

  const timestamp = new Date().toISOString();

  let _body = {};
  try {
    _body = JSON.stringify({
      uid: uuid,
      client: VersionNumber.appVersion,
      sent: timestamp,
      key: type,
      value: data
    });
    const response = await fetch("https://mimi.research.icsi.institute/save/", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: _body
    });

    _uploaded = response.ok;
    logger.info(
      callerClass,
      callerFunc + "-->uploadData",
      "Server response:" + JSON.stringify(response)
    );
  } catch (error) {
    _error = error.message;
    logger.error(
      callerClass,
      callerFunc + "-->uploadData",
      "Exception in uploading data:" + error
    );
  }

  if (callBackFunc !== null) {
    callBackFunc(_uploaded, _error, _body);
  }

  return _uploaded;
}

export function surveyPeriodEnded(appStatus) {
  let result = false;
  const _installationDate = appStatus.InstallationDate;
  logger.info(
    codeFileName,
    "surveyPeriodEnded",
    "Checking if study period has ended. _installationDate:" + _installationDate
  );
  if (_installationDate == null) {
    logger.error(
      codeFileName,
      "surveyPeriodEnded",
      "Fatal error: installation date is null!!!"
    );
    result = true;
  } else {
    const _oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const _currDate = new Date();
    const _daysPassed = Math.round(
      Math.abs((_currDate.getTime() - _installationDate.getTime()) / _oneDay)
    );
    if (_daysPassed >= STUDY_PERIOD) {
      result = true;
    }
  }
  return result;
}

export function exitSurveyAvailableDays(appStatus) {
  //returns how many days are available until exit survey period ends
  const _installationDate = appStatus.InstallationDate;
  let _remainingDays = 0;
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
  } else {
    const _oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const _currDate = new Date();
    const _daysPassed = Math.round(
      Math.abs((_currDate.getTime() - _installationDate.getTime()) / _oneDay)
    );

    _remainingDays = STUDY_PERIOD + EXIT_SURVEY_PERIOD - _daysPassed;
  }

  return _remainingDays;
}

export function getDateTime() {
  const date = new Date();
  const day = date.getDate();
  const m = date.getMonth() + 1; //Month from 0 to 11
  const y = date.getFullYear();

  const time =
    date.getHours() +
    ":" +
    date.getMinutes() +
    ":" +
    date.getSeconds() +
    ":" +
    date.getMilliseconds();

  return y + "-" + m + "-" + day + " " + time;
}

export function isNumeric(num) {
  const _num = "" + num; //coerce num to be a string
  return !Number.isNaN(_num) && !Number.isNaN(parseFloat(_num));
}

export function shuffleArray(array) {
  const a = array;
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const BOLD_MARKER = "**";
/**
 * The goal of this function is to construct a list of Text segments,
 * with any **bolded** text replaced with Text styled to bold.
 */
export const format = string => {
  const texts = [];

  /** A helper function that saves the defined substring to our list of Text objects */
  const addSubstring = (from, to, bold) => {
    const rawText = string.substring(from, to);
    const fontWeight = bold ? "bold" : "normal";
    const text = (
      <Text style={{ fontWeight }} key={texts.length}>
        {rawText}
      </Text>
    );
    texts.push(text);
  };

  let isBold = false;
  let segmentStart = 0;
  let segmentEnd = string.indexOf(BOLD_MARKER);

  while (segmentEnd >= 0) {
    // Add everything up to the current marker as a separate Text object
    addSubstring(segmentStart, segmentEnd, isBold);

    // If we saw a marker, then the following text will be the opposite of the previous one:
    // bold if it was normal, and normal if it was bold.
    isBold = !isBold;

    // Look for the next marker
    segmentStart = segmentEnd + BOLD_MARKER.length;
    segmentEnd = string.indexOf(BOLD_MARKER, segmentStart);
  }

  // Add whatever remains left of the string
  addSubstring(segmentStart, string.length, isBold);

  return texts;
};
