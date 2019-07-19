import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert} from 'react-native';
import * as RNFS from 'react-native-fs';
import wifi from 'react-native-android-wifi';

import logger from './logger';
const codeFileName = 'appStatus.js'



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
             }

    loadStatus()
    {
           RNFS.exists(this.appStatusFilePath)
               .then( (exists) =>{
                    RNFS.readFile(this.appStatusFilePath)
                          .then( (_fileContent) =>
                          {
                              this.status =  JSON.parse(_fileContent);
                          })
                          .catch( (error) =>
                          {
                              logger.error("AppStatus","loadStatus", "Reading appStatus file failed.");
                          })
                    return this.status;
               })


           RNFS.writeFile(this.appStatusFilePath, JSON.stringify(this.status))
               .then( (success) => {
                logger.info(`${codeFileName}`, 'loadState', 'Saved initial app status in file.');
               })
               .catch( (error)=>{
                    logger.error(`${codeFileName}`, 'loadState', 'Error in saving initial status file:'+error.message);
               })

           return this.status;
    }

    getStatus()
    {
        _status = this.status;
        return _status;
    }

    saveState()
    {
        RNFS.copyFile(this.appStatusFilePath, this.appStatusFilePath+'.backup')
            .then( (success) => {
                logger.info(`${codeFileName}`, 'saveState', 'Backed up status file.');

                RNFS.writeFile(this.appStatusFilePath, JSON.stringify(this.status))
                    .then( (success) => {
                        logger.info(`${codeFileName}`, 'saveState', 'Saved status in file.');
                          RNFS.unlink(this.appStatusFilePath+'.backup')
                              .then(() => {
                                logger.info(`${codeFileName}`, 'saveState', 'Deleted backup file.');
                              })
                              // `unlink` will throw an error, if the item to unlink does not exist
                              .catch((err) => {
                                logger.error(`${codeFileName}`, 'saveState', 'Error in deleting backup file:'+error.message);
                              });
                    })
                    .catch( (error)=>{
                        logger.error(`${codeFileName}`, 'saveState', 'Error in saving status file:'+error.message+'. Restoring backup file');
                        RNFS.copyFile(this.appStatusFilePath+'.backup', this.appStatusFilePath)
                            .then( (success)=> {
                                logger.info(`${codeFileName}`, 'saveState', 'Restored backup file.');
                            })
                            .catch( (error)=>{
                                logger.error(`${codeFileName}`, 'saveState', 'Failed to Restore backup file:'+error.message);
                            })

                    })
            })
            .catch( (error) => {
                logger.error(`${codeFileName}`, 'saveState',
                    'Error backing up status file:'+error.message);
            })

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
}

appStatus = new AppStatus();
appStatus.loadStatus();
export default appStatus;