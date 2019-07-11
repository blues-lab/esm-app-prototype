import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert} from 'react-native';
import * as RNFS from 'react-native-fs';
import wifi from 'react-native-android-wifi';

import logger from './logger';
import notificationController from './notificationController';

const codeFileName = 'backgroundJobs.js'

import appStatus from '../controllers/appStatus';

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
        _appStatus = appStatus.getStatus();

        if(this.getWifiName() == "ICSI") //TODO: change to userSettings
        {
            _lastNotificationDate = Date.parse(_appStatus.LastNotificationTime).setHours(0,0,0,0);
            logger.info(`${codeFileName}`,"showPrompt", "Last notification date:"+_lastNotificationDate.toString());


            if( (_lastNotificationDate < new Date()) ||
                (_appStatus.SurveyStatusToday == "NotStarted" &&
                _appStatus.NotificationCountToday < _appStatus.MaxNumberNotification))
            {
                notificationController.showNotification();
                logger.info(`${codeFileName}`,"showPrompt", "Scheduling prompt done.");
                appStatus.setLastNotificationTime(new Date());
            }
        }
    }
}


const backgroundJobs = new BackgroundJobs();
export default backgroundJobs;