import React, { Component } from "react";
import { Platform, StyleSheet, Text, View, Button, Alert } from "react-native";
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
    date = new Date();
    var day = date.getDate();
    var m = date.getMonth() + 1; //Month from 0 to 11
    var y = date.getFullYear();

    const _hour = date.getHours() > 9 ? date.getHours() : "0" + date.getHours();
    const _min =
      date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes();
    const _sec =
      date.getSeconds() > 9 ? date.getSeconds() : "0" + date.getSeconds();
    var time = _hour + ":" + _min + ":" + _sec + ":" + date.getMilliseconds();

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

  showLog() {
    RNFS.readFile(LOG_FILE_PATH)
      .then(res => {
        Alert.alert("Log", res);
      })
      .catch(err => {
        Alert.alert("Error showing log file", err.message);
      });
  }

  emailLog() {
    const to = ["rakhasan@u.edu"]; // string or array of email addresses
    email(to, {
      // Optional additional arguments
      //cc: ['bazzy@moo.com', 'doooo@daaa.com'], // string or array of email addresses
      //bcc: 'mee@mee.com', // string or array of email addresses
      subject: "Show how to use",
      body: "Some body right here"
    }).catch(err => Alert.alert("Er", err.message));
  }

  uploadLog() {
    RNFS.readFile(logFilePath)
      .then(res => {
        this.uploadLogText(res);
      })
      .catch(err => {
        Alert.alert("Error showing log file", err.message);
      });
  }

  uploadLogText(text) {
    fetch("https://postb.in/1562720582685-9259188782889", {
      // Your POST endpoint
      method: "POST",
      headers: {
        // Content-Type may need to be completely **omitted**
        // or you may need something
        "Content-Type": "application/csv"
      },
      body: text // This is your file object
    })
      .then(
        response => Alert.alert("Respone", response.toString()) // if the response is a JSON object
      )
      .then(
        success => Alert.alert("Log file uploaded") // Handle the success response object
      )
      .catch(
        err => Alert.alert(err.code, err.message) // Handle the error response object
      )
      .catch(err => Alert.alert(err.code, err.message));
  }
}

const logger = new Logger();
logger.setup();
export default logger;
