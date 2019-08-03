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
                 SurveyCountToday: 0, //how many surveys were created today
                 SurveyStatus: SURVEY_STATUS.NOT_AVAILABLE,
                 FirstNotificationTime: null,
                 LastNotificationTime: null,
                 MaxNumberNotification: 5,
                 PromptDuration:60,
                 CompletedSurveys:0,
                 SurveyProgress:0,
                 InstallationDate: null,
                 StudyDuration: 1,
             }


    constructor(props)
    {
        //super(props);
        this.loadStatus();
    }


    async loadStatus()
    {

        if(await RNFS.exists(this.appStatusFilePath))
        {
            RNFS.readFile(this.appStatusFilePath)
                .then((_fileContent) => {
                    this.status = JSON.parse(_fileContent);
                    this.status.InstallationDate =  new Date(this.status.InstallationDate);
                    if(this.status.FirstNotificationTime!=null)
                    {
                        this.status.FirstNotificationTime = new Date(this.status.FirstNotificationTime);
                    }
                    if(this.status.LastNotificationTime!=null)
                    {
                        this.status.LastNotificationTime = new Date(this.status.LastNotificationTime);
                    }


                    logger.info(`${codeFileName}`, 'loadStatus', 'Successfully read app status file:'+JSON.stringify(this.status));
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
            'Setting max notification number to '+this.status.MaxNumberNotification);
        this.saveAppStatus();
    }

    incrementSurveyCountToday()
    {
        this.status.SurveyCountToday +=1;
        logger.info(`${codeFileName}`, 'incrementSurveyCountToday',
            'Incrementing survey count to '+this.status.SurveyCountToday);
        this.saveAppStatus();
    }

    setLastNotificationTime(value)
    {
        this.status.LastNotificationTime = value;
        logger.info(`${codeFileName}`, 'setLastNotificationTime',
                    'Setting last notification time to '+this.status.LastNotificationTime);
        this.saveAppStatus();
    }

    setFirstNotificationTime(value)
    {
        this.status.FirstNotificationTime = value;
        logger.info(`${codeFileName}`, 'setFirstNotificationTime',
                    'Setting first notification time to '+this.status.FirstNotificationTime);
        this.saveAppStatus();
    }

    setSurveyStatus(value)
    {
        this.status.SurveyStatus = value;
        logger.info(codeFileName, 'setSurveyStatus',
                    'Setting Survey Status to '+this.status.SurveyStatus);
        this.saveAppStatus();
    }

    increaseCompletedSurveys()
    {
        this.status.CompletedSurveys+=1;
        logger.info(codeFileName, 'increaseCompletedSurveys',
                   'Increasing completed surveys to '+this.status.CompletedSurveys);
        this.saveAppStatus();
    }
    setInstallationDate(value)
    {
        this.status.InstallationDate = value;
        logger.info(codeFileName, 'setInstallationDate',
                   'Setting installation date to '+this.status.InstallationDate);
        this.saveAppStatus();
    }
    setSurveyProgress(value)
    {
        this.status.SurveyProgress= date;
        logger.info(codeFileName, 'setSurveyProgress',
                   'Setting survey progress to '+this.status.SurveyProgress);
        this.saveAppStatus();
    }
}

appStatus = new AppStatus();
appStatus.loadStatus();
export default appStatus;