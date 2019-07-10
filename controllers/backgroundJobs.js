import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert} from 'react-native';
import * as RNFS from 'react-native-fs';
import wifi from 'react-native-android-wifi';

import logger from './logger';
import notificationController from './notificationController';

const appStatusFileLocal = RNFS.DocumentDirectoryPath+'/appStatus.js';

class BackgroundJobs
{
  geWifiName()
  {
    wifi.isEnabled((isEnabled) => {
    if (isEnabled)
      {
        wifi.connectionStatus((isConnected) => {
          if (isConnected)
          {
              wifi.getSSID((ssid) => {
                return ssid;
              });
          }
        });
      }
    });

    return "";
  }


    showPrompt()
    {
        logger.info("BackgroundJobs","showPrompt", "Getting wifi name");
        _wifiName = this.getWifiName();
        if(this.getWifiName() == "ICSI")
        {
            RNFS.readFile(appStatusFilePath)
                .then( (_fileContent) => {
                    _appStatus = JSON.parse(_fileContent);

                    if(_appStatus.NumberOfTimesNotificationShownToday< _appStatus.MaxNumberNotification &&
                        _appStatus.SurveyStatusToday=="NotStarted") //TODO: check other conditions, e.g., if inside 'no-disturb' time
                    {
                        notificationController.configureNotification();
                        notificationController.showNotification();
                        logger.info("BackgroundJobs","showPrompt", "Scheduling prompt done.");
                    }

                })
                .catch( (error) => {
                  logger.error("BackgroundJobs","showPrompt", "Reading appStatus file failed.");
                })
        }
    }
}


const backgroundJobs = new BackgroundJobs();
export default backgroundJobs;