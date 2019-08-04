import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert} from 'react-native';
import * as RNFS from 'react-native-fs';
import wifi from 'react-native-android-wifi';

import logger from './logger';
import notificationController from './notificationController';

const codeFileName = 'backgroundJobs.js'

import appStatus from '../controllers/appStatus';

import utilities from '../controllers/utilities';
import {SURVEY_STATUS,MAX_NOTIFICATION_NUM} from './constants';



class BackgroundJobs
{
    async showPrompt()
    {
        logger.info(codeFileName, "showPrompt", "Getting app status.");
        //logger.info("BackgroundJobs","showPrompt", "Getting wifi name");
        //_wifiName = utilities.getWifiName();
        _appStatus = await appStatus.loadStatus();

        if(_appStatus.SurveyStatusToday == SURVEY_STATUS.AVAILABLE)//if no survey is available

        if(true) //check conditions
        {

            const _lastNotificationTime = Date.parse(_appStatus.LastNotificationTime);
            _minPassed = Math.floor((Date.now() - _lastNotificationTime)/60000);
            logger.info(`${codeFileName}`,"showPrompt", _minPassed.toString()+" minutes have passed since the last notification date at "+_lastNotificationTime);


            //Get day of week and then check "Don't disturb" times (Sunday is 0, Monday is 1)

            RNFS.exists(userSettingsFile)
                .then((exists) =>
                {
                    RNFS.readFile(userSettingsFile)
                        .then((_fileContent) =>
                        {
                            logger.info(codeFileName, 'showPrompt', 'Successfully read user settings file.');
                            _userSettingsData = JSON.parse(_fileContent);
                        })
                        .catch( (error)=>
                        {
                            logger.error(codeFileName, 'showPrompt', 'Failed to read for User settings file.'+error.message);
                        })

                })
                .catch((error) =>
                {
                    logger.error(codeFileName, 'showPrompt', 'Failed to check for User settings file.'+error.message);
                })




            _remainingTime = 60 - _minPassed;
            logger.info(codeFileName, 'showPrompt','Remaining time:'+_remainingTime+
                        ', survey status:'+_appStatus.SurveyStatusToday+', notification count:'+_appStatus.NotificationCountToday)
            if(
                _remainingTime>0 &&
                _appStatus.SurveyStatusToday == SURVEY_STATUS.AVAILABLE &&
                _appStatus.NotificationCountToday < MAX_NOTIFICATION_NUM
              )
            {

                notificationController.showNotification("New survey available!",
                            "Complete it within "+_remainingTime+" minutes and get $0.2!!!");
                logger.info(codeFileName,"showPrompt", "Scheduling prompt done.");
                appStatus.setLastNotificationTime(new Date());
            }
        }
    }
}


const backgroundJobs = new BackgroundJobs();
export default backgroundJobs;
