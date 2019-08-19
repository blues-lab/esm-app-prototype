import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert, AppState} from 'react-native';
import * as RNFS from 'react-native-fs';

import logger from './logger';
import notificationController from './notificationController';
const codeFileName = 'backgroundJobs.js';
import appStatus from '../controllers/appStatus';

import utilities from '../controllers/utilities';
import {USER_SETTINGS_FILE_PATH, SURVEY_STATUS,
    INVITATION_CODE_FILE_PATH, MAX_SURVEY_PER_DAY, LOG_FILE_PATH,
    PROMPT_DURATION} from './constants';

import { NetworkInfo } from "react-native-network-info";

//if (Platform.OS == 'android') {
//    wifi = require('react-native-android-wifi');
//}

function isInDoNotDisturbTime(settings)
{
      if(settings.afterTime === settings.beforeTime)//user did not set time, return false
      {
        logger.info(codeFileName, 'isInDoNotDisturbTime',
            'User did not specify time. After time:'+settings.afterTime+'. Before time:'+settings.beforeTime+'. Returning false.');
        return false;
      }
      const _date = new Date();
      const _hours = _date.getHours()>9?_date.getHours():'0'+_date.getHours();
      const _min = _date.getMinutes()>9?_date.getMinutes():'0'+_date.getMinutes();
      const _current =  _hours +':'+ _min;


      logger.info(codeFileName, 'isInDoNotDisturbTime',
      `Do not disturb afterTime:${settings.afterTime} and beforeTime:${settings.beforeTime}. Current time:${_current}`);
;
      _doNotDisturb = false;
      if(settings.afterTime<settings.beforeTime)
      {
        _doNotDisturb = _current>settings.afterTime &&  _current<settings.beforeTime;
      }
      else
      {
        _doNotDisturb = (_current>settings.afterTime && _current<"23:59") ||
                        (_current>"00:00" && _current<settings.beforeTime);
      }


      return _doNotDisturb;
}

function sameDay(d1, d2)
{
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function before(d1, d2)
{
    //returns true if d1 is before d2
  return d1.getFullYear() < d2.getFullYear() ||
    d1.getMonth() < d2.getMonth() ||
    d1.getDate() < d2.getDate();
}

export async function showPrompt()
{
      _appStatus = await appStatus.loadStatus();
      logger.info(codeFileName, "showPrompt", "Current app status:"+JSON.stringify(_appStatus));

      _userSettingsData = null;
      try
      {
        const _fileExists = await RNFS.exists(USER_SETTINGS_FILE_PATH);
        if(_fileExists)
        {
            const _fileContent = await RNFS.readFile(USER_SETTINGS_FILE_PATH);
            logger.info(codeFileName, 'showPrompt', 'Read user settings file:'+_fileContent);
            _userSettingsData = JSON.parse(_fileContent);
        }
      }
      catch(error)
      {
         logger.error(codeFileName, 'showPrompt', 'Failed to read user settings file:'+error.message);
      }

      if(_userSettingsData==null)
      {
         logger.error(codeFileName, 'showPrompt', 'Fatal error: user settings data is null!');
         return;
      }

      //check if home wifi is set and connected to home wifi
      const _ssid = await NetworkInfo.getSSID();
      if(_userSettingsData.homeWifi.length==0 || _ssid != _userSettingsData.homeWifi)
      {
        logger.info(codeFileName, 'showPrompt', `Current SSID: ${_ssid}. Home Wifi: ${_userSettingsData.homeWifi} . Returning.`);
        notificationController.cancelNotifications();
        return;
      }
      logger.info(codeFileName, 'showPrompt', 'Obtained wifi:'+_ssid+'.');

      //Check if in "Don't disturb" times (Sunday is 0, Monday is 1)
      _doNotDisturb = isInDoNotDisturbTime(_userSettingsData);

      if(_doNotDisturb)
      {
        logger.info(codeFileName, 'showPrompt', 'Inside "Do not disturb" mode. Canceling all notification and returning.');
        notificationController.cancelNotifications();
        return;
      }
      else
      {
          logger.info(codeFileName, 'showPrompt', 'Not in "Do not disturb" mode.');

          //check if the date of last survey creation was before today, if so, reset variables.
          await logger.info(codeFileName,'showPrompt', '_appStatus.LastSurveyCreationDate:'+_appStatus.LastSurveyCreationDate+' type:'+typeof(_appStatus.LastSurveyCreationDate));
          if(_appStatus.LastSurveyCreationDate==null || before(_appStatus.LastSurveyCreationDate, new Date))
          {
            logger.info(codeFileName, 'showPrompt', 'Last survey was created at a previous day:'+_appStatus.setLastNotificationTime+'. Resetting appStatus.SurveyCountToday and setting survey status to NOT_AVAILABLE.')

            _appStatus.SurveyCountToday=0;
            _appStatus.SurveyStatus=SURVEY_STATUS.NOT_AVAILABLE;
            await appStatus.setAppStatus(_appStatus);
          }

          if(_appStatus.SurveyStatus == SURVEY_STATUS.NOT_AVAILABLE)
          {
              //if no survey is available, randomly create one
              logger.info(codeFileName,"showPrompt", "No survey available; checking if already completed survey today.");
              if(_appStatus.SurveyStatus != SURVEY_STATUS.COMPLETED)
              {

                  if(_appStatus.SurveyCountToday>=MAX_SURVEY_PER_DAY)
                  {
                    logger.info(codeFileName,"showPrompt", "Survey not completed today. Already "+_appStatus.SurveyCountToday+' surveys were created. Returning');
                    return;
                  }
                  _createSurvey = true;//(Math.floor(Math.random() * 100) + 1)%2==0;
                  logger.info(codeFileName,"showPrompt", "Randomly creating survey:"+_createSurvey);

                  if(_createSurvey)
                  {
                      _remainingTime = PROMPT_DURATION;
                      notificationController.cancelNotifications();
                      notificationController.showNotification("New survey available!",
                        "Complete within "+_remainingTime+" minutes to get \u00A220!!!");

                      logger.info(codeFileName,"showPrompt", "Created new survey. Updating app status.");
                      const _currentDate = new Date();
                      _appStatus.SurveyCountToday +=1;
                      _appStatus.SurveyStatus = SURVEY_STATUS.AVAILABLE;
                      _appStatus.LastSurveyCreationDate = _currentDate;
                      _appStatus.FirstNotificationTime = _currentDate;
                      _appStatus.LastNotificationTime = _currentDate;
                      await appStatus.setAppStatus(_appStatus);

                      logger.info(codeFileName,"showPrompt", "Notification for new survey is shown.");
                  }
              }
              else
              {
                logger.info(codeFileName,"showPrompt", "Survey already completed today.");
              }
          }
          else if(_appStatus.SurveyStatus == SURVEY_STATUS.AVAILABLE)
          {
              //Survey is available, show prompt if there is still time, or make survey expired

              logger.info(codeFileName,"showPrompt", "Survey available.");
              const _firstNotificationTime = _appStatus.FirstNotificationTime;
              if(_firstNotificationTime==null)
              {
                logger.error(codeFileName, "showPrompt", "Fatal error: FirstNotificationTime is null. Returning.");
                return;
              }

              _minPassed = Math.floor((Date.now() - _firstNotificationTime)/60000);
              logger.info(codeFileName,"showPrompt", _minPassed.toString()+" minutes have passed since the first notification date at "+_firstNotificationTime);

              _remainingTime = PROMPT_DURATION - _minPassed;
              if(_remainingTime<=0) //survey expired, remove all existing notification
              {
                  logger.info(codeFileName,"showPrompt", "Remaining time "+_remainingTime+", cancelling notifications.");
                  notificationController.cancelNotifications();
                  logger.info(codeFileName,"showPrompt", "Changing survey status to NOT_AVAILABLE.");
                  await appStatus.setSurveyStatus(SURVEY_STATUS.NOT_AVAILABLE);
              }
              else
              {
                  logger.info(codeFileName, 'showPrompt','Remaining time:'+_remainingTime+ '. Updating notification.');

                  notificationController.cancelNotifications();
                  notificationController.showNotification("New survey available!",
                                                          "Complete within "+_remainingTime+" minutes to get \u00A220!!!");
                  logger.info(codeFileName,"showPrompt", "Showing latest notification at: "+new Date());
                  await appStatus.setLastNotificationTime(new Date());

              }
          }
          else if(_appStatus.SurveyStatus == SURVEY_STATUS.ONGOING)
          {
            //if ongoing and app not in 'active' mode, prompt again
            if(AppState.currentState == 'background')
            {
                  logger.info(codeFileName,"showPrompt", "Survey is ongoing but app is in "+AppState.currentState+'. Updating notification.');
                  const _firstNotificationTime = _appStatus.FirstNotificationTime;
                  if(_firstNotificationTime==null)
                  {
                    logger.error(codeFileName, "showPrompt", "Fatal error: FirstNotificationTime is null. Returning.");
                    return;
                  }

                  _minPassed = Math.floor((Date.now() - _firstNotificationTime)/60000);
                  logger.info(codeFileName,"showPrompt", _minPassed.toString()+" minutes have passed since the last notification date at "+_firstNotificationTime);

                  _remainingTime = PROMPT_DURATION - _minPassed;
                  if(_remainingTime>0)
                  {
                    logger.info(codeFileName, 'showPrompt','Remaining time:'+_remainingTime+ '. Updating notification.');

                    notificationController.cancelNotifications();
                    notificationController.showNotification("Survey is still available!",
                                                            "Complete within "+_remainingTime+" minutes to get \u00A220!!!");
                    logger.info(codeFileName,"showPrompt", "Showing latest notification at: "+new Date());
                    await appStatus.setLastNotificationTime(new Date());
                  }

            }
          }
      }
}


async function _uploadFiles()
{
    //send the invitation code file
    const _fileExists = await RNFS.exists(INVITATION_CODE_FILE_PATH);
    if(_fileExists)
    {
        const _fileContent = await RNFS.readFile(INVITATION_CODE_FILE_PATH);
        const _uploaded = await utilities.uploadData( _fileContent, _appStatus.UUID,
                                        'InvitationCode', codeFileName, 'uploadFiles');
         if(_uploaded)
         {
            logger.info(codeFileName, 'uploadFiles', 'Uploaded invitation code file content.');
            await RNFS.unlink(INVITATION_CODE_FILE_PATH);
         }
         else
         {
            logger.error(codeFileName, 'uploadFiles', 'Failed to upload invitation file content:'+JSON.stringify(_fileContent));
         }
    }

    //check if there is any survey response files, if so, upload them
    const _files = await RNFS.readdir(RNFS.DocumentDirectoryPath);
    logger.info(codeFileName, 'uploadFiles', 'Uploading survey response files. Existing files:'+_files.toString());
    for(i =0; i< _files.length; i++)
    {
        const _file = _files[i];
        if(_file.startsWith('survey--response--'))
        {
            logger.info(codeFileName,'uploadFiles', 'Uploading survey response file:'+_file);
            const _filePath = RNFS.DocumentDirectoryPath+'/'+_file;
            const _fileContent = await RNFS.readFile(_filePath);
            const _uploaded = await utilities.uploadData( _fileContent, _appStatus.UUID,
                                            'SurveyResponse', codeFileName, 'uploadFiles');
             if(_uploaded)
             {
                logger.info(codeFileName, 'uploadFiles', 'Uploaded file content for:'+_file+'. Removing file.');
                await RNFS.unlink(_filePath);
             }
             else
             {
                logger.error(codeFileName, 'uploadFiles', 'Failed to upload file:'+_file);
             }
        }
    }

    //upload log file
    logger.info(codeFileName, 'uploadFiles', 'Attempting to upload log file.');
    const _fileContent = await RNFS.readFile(LOG_FILE_PATH);
    const _uploaded = await utilities.uploadData( _fileContent, _appStatus.UUID,
                                    'Log', codeFileName, 'uploadFiles');
     if(_uploaded)
     {
       // await RNFS.writeFile(LOG_FILE_PATH,'');
        logger.info(codeFileName, 'uploadFiles', 'Uploaded previous log file content. Replaced with empty file.');
     }
     else
     {
        logger.error(codeFileName, 'uploadFiles', 'Failed to upload log file.');
     }
}

async function uploadFilesAndroid()
{
    try
    {
        const _ssid = await NetworkInfo.getSSID();

        if( (_ssid!=null) &&  (_ssid.length>0)  && (_ssid != '<unknown ssid>'))
        {
            logger.info(codeFileName, 'uploadFiles', 'Obtained  SSID:'+ssid+'. Starting to upload files.');
            _uploadFiles();
        }
        else
        {
            logger.error(codeFileName, 'uploadFiles', 'Invalid SSID:'+ssid+'.');
            return;
        }
    }
    catch(error)
    {
        logger.error(codeFileName, 'uploadFiles', 'Failed to upload files: '+error);
        return;
    }
}

export async function uploadFiles()
{
    // check if app in background, otherwise return
    if(AppState.currentState=='active')
    {
        logger.info(codeFileName,'uploadFiles', 'Current app state is '+AppState.currentState+'. Returning.');
        return;
    }

    logger.info(codeFileName,'uploadFiles', 'Current app state is '+AppState.currentState+'. Attempting to upload files.');

    const _appStatus = await appStatus.loadStatus();
    if(Platform.OS=='android')
    {
        await uploadFilesAndroid();
    }
}