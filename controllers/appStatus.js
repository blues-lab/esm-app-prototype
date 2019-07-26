import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert} from 'react-native';
import * as RNFS from 'react-native-fs';
import wifi from 'react-native-android-wifi';

import logger from './logger';
const codeFileName = 'appStatus.js'

import utilities from './utilities'


class AppStatus
{
    appStatusFilePath = RNFS.DocumentDirectoryPath+'/appStatus.js';
    status = {
                 NotificationCountToday: 0,
                 SurveyStatus: "NotStarted",
                 LastNotificationTime: new Date(),
                 MaxNumberNotification: 5,
                 PromptDuration:60,
                 CompletedSurveys:0,
                 SurveyProgress:0,
                 FirstLaunch:1,
             }


    async loadStatus()
    {

        if(await RNFS.exists(this.appStatusFilePath))
        {
            RNFS.readFile(this.appStatusFilePath)
                .then((_fileContent) => {

                    logger.info(`${codeFileName}`, 'loadStatus', 'Successfully read status file:'+_fileContent);
                    this.status = JSON.parse(_fileContent);
                })
                .catch((error)=>
                {
                    logger.error(callerClass, "loadStatus", 'Failed to read status file:'+error.message);
                })
        }
        else
        {
            logger.info(codeFileName, 'loadStatus', 'Status file does not exist, creating one.');
            utilities.writeJSONFile(this.status, this.appStatusFilePath,
                                       codeFileName, 'loadStatus')
        }

    }

    getStatus()
    {
        _status = this.status;
        return _status;
    }


    saveState()
    {
        utilities.writeJSONFile(this.status, this.appStatusFilePath, codeFileName, "saveState")
    }

    setMaxNumberNotification(value)
    {
        logger.info(`${codeFileName}`, 'incrementNotificationCount',
            'Setting max notification number to '+value);
        this.status.MaxNumberNotification = value;
        this.saveState();
    }

    incrementNotificationCount()
    {
        logger.info(`${codeFileName}`, 'incrementNotificationCount',
            'Incrementing notification count to '+this.status.incrementNotificationCount+1)
        this.status.NotificationCountToday +=1;
        this.saveState();
    }

    setLastNotificationTime(value)
    {
        logger.info(`${codeFileName}`, 'setLastNotificationTime',
                    'Setting last notification time to '+value.toString());
        this.status.setLastNotificationTime = value;
        this.saveState();
    }

    setSurveyStatus(value)
    {
        logger.info(`${codeFileName}`, 'setSurveyStatus',
                    'Setting Survey Status to '+value.toString());
        this.status.SurveyStatus = value;
        this.saveState();
    }

    setFirstLaunch(value)
    {
        logger.info(`${codeFileName}`, 'setFirstLaunch',
                     'Setting First Launch to '+value.toString());
        this.status.FirstLaunch = value;
        this.saveState();
    }

    surveyAvailable()
    {
        mins = (Date.now() - this.status.LastNotificationTime)/60000;
        return mins ;
    }
}

appStatus = new AppStatus();
appStatus.loadStatus();
export default appStatus;