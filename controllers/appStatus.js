import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert} from 'react-native';
import * as RNFS from 'react-native-fs';
import wifi from 'react-native-android-wifi';

import logger from './logger';
const codeFileName = 'appStatus.js'

import utilities from './utilities';
import {SURVEY_STATUS} from './constants';


class AppStatus
{
    appStatusFilePath = RNFS.DocumentDirectoryPath+'/appStatus.js';
    status = {
                 NotificationCountToday: 0,
                 SurveyStatus: SURVEY_STATUS.NOT_AVAILABLE,
                 LastNotificationTime: new Date(),
                 MaxNumberNotification: 5,
                 PromptDuration:60,
                 CompletedSurveys:0,
                 SurveyProgress:0,
                 InstallationDate: null,
                 StudyDuration: 1,
             }


    async loadStatus()
    {

        if(await RNFS.exists(this.appStatusFilePath))
        {
            RNFS.readFile(this.appStatusFilePath)
                .then((_fileContent) => {

                    logger.info(`${codeFileName}`, 'loadStatus', 'Successfully read app status file.');
                    this.status = JSON.parse(_fileContent);
                })
                .catch((error)=>
                {
                    logger.error(callerClass, "loadStatus", 'Failed to read status file:'+error.message);
                })
        }
        else
        {
            logger.info(codeFileName, 'loadStatus', 'Status file does not exist so creating a new one.');
            utilities.writeJSONFile(this.status, this.appStatusFilePath,
                                       codeFileName, 'loadStatus')
        }

    }

    getStatus()
    {
        _status = this.status;
        return _status;
    }


    saveAppStatus()
    {
        utilities.writeJSONFile(this.status, this.appStatusFilePath, codeFileName, "saveAppStatus")
    }

    setMaxNumberNotification(value)
    {
        this.status.MaxNumberNotification = value;
        logger.info(`${codeFileName}`, 'incrementNotificationCount',
            'Setting max notification number to '+this.status.MaxNumberNotification.toString());
        this.saveAppStatus();
    }

    incrementNotificationCount()
    {
        this.status.NotificationCountToday +=1;
        logger.info(`${codeFileName}`, 'incrementNotificationCount',
            'Incrementing notification count to '+this.status.NotificationCountToday);
        this.saveAppStatus();
    }

    setLastNotificationTime(value)
    {
        this.status.LastNotificationTime = value;
        logger.info(`${codeFileName}`, 'setLastNotificationTime',
                    'Setting last notification time to '+this.status.LastNotificationTime.toString());
        this.saveAppStatus();
    }

    setSurveyStatus(value)
    {
        this.status.SurveyStatus = value;
        logger.info(codeFileName, 'setSurveyStatus',
                    'Setting Survey Status to '+this.status.SurveyStatus.toString());
        this.saveAppStatus();
    }

    increaseCompletedSurveys()
    {
        this.status.CompletedSurveys+=1;
        logger.info(codeFileName, 'increaseCompletedSurveys',
                   'Increasing completed surveys to '+this.status.CompletedSurveys.toString());
        this.saveAppStatus();
    }
    setInstallationDate(date)
    {
        this.status.InstallationDate = date;
        logger.info(codeFileName, 'setInstallationDate',
                   'Setting installation date to '+this.status.InstallationDate.toString());
        this.saveAppStatus();
    }
}

appStatus = new AppStatus();
appStatus.loadStatus();
export default appStatus;