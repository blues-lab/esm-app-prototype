import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert, AppState} from 'react-native';
import * as RNFS from 'react-native-fs';
import WifiManager from 'react-native-wifi';

import logger from './logger';
import notificationController from './notificationController';

const codeFileName = 'backgroundJobs.js'

import appStatus from '../controllers/appStatus';

import utilities from '../controllers/utilities';
import {USER_SETTINGS_FILE_PATH, SURVEY_STATUS,MAX_SURVEY_PER_DAY, LOG_FILE_PATH} from './constants';


function getFromHour(settings, day)
{
     //return min+hour*60
     time = null;
     switch (day)
     {
       case 0:
         time = settings.sunFrom;
         break;
       case 1:
         time = settings.mondayFrom;
         break;
       case 2:
         time = settings.tuesdayFrom;
         break;
       case 3:
         time = settings.wedFrom;
         break;
       case 4:
         time = settings.thFrom;
         break;
       case 5:
         time = settings.friFrom;
         break;
       case 6:
         time = settings.satFrom;
         break;
     }

     //Alert.alert(time,time.split(':')[0])
     hr = time.split(':')[0]
     min = time.split(':')[1]
     return  Number(min)+Number(hr)*60;
}

function getToHour(settings, day)
{
     //return min+hour*60
     time = null;
     switch (day)
     {
       case 0:
         time = settings.sunTo;
         break;
       case 1:
         time = settings.mondayTo;
         break;
       case 2:
         time = settings.tuesdayTo;
         break;
       case 3:
         time = settings.wedTo;
         break;
       case 4:
         time = settings.thTo;
         break;
       case 5:
         time = settings.friTo;
         break;
       case 6:
         time = settings.satTo;
         break;
     }

     hr = time.split(':')[0]
     min = time.split(':')[1]
     return  Number(min)+Number(hr)*60;
}


function isInDoNotDisturbTime(settings)
{
     logger.info('Global', 'isInDoNotDisturbTime', 'Figuring out if in "Do not disturb" period.');

      _day = new Date().getDay();
      _from = getFromHour(settings, _day);
      _to= getToHour(settings, _day);

      _current = new Date();
      _now = _current.getHours()*60 + _current.getMinutes();
      _doNotDisturb = _now>_from && _now<_to;

      logger.info('Global', "isInDoNotDisturbTime", `day of week:${_day} from:${_from} to:${_to} now:${_now} doNotDisturb:${_doNotDisturb}.`);
      return _doNotDisturb;
}

export async function showPrompt()
{
      const _appStatus = await appStatus.loadStatus();
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

      if(_userSettingsData.homeWifi.length==0)
      {
         logger.info(codeFileName, 'showPrompt', 'Home Wifi not set. Returning.');
         return;
      }

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
                      appStatus.incrementSurveyCountToday();
                      logger.info(codeFileName,"showPrompt", "Created new survey number:"+_appStatus.SurveyCountToday+". Changing status to AVAILABLE.");
                      await appStatus.setSurveyStatus(SURVEY_STATUS.AVAILABLE);

                      _remainingTime = _appStatus.PromptDuration;
                      notificationController.cancelNotifications();
                      notificationController.showNotification("New survey available!",
                           "Complete it within "+_remainingTime+" minutes and get $0.2!!!");

                      _notificationTime = new Date();
                      await appStatus.setFirstNotificationTime(_notificationTime);
                      await appStatus.setLastNotificationTime(_notificationTime);
                      logger.info(codeFileName,"showPrompt", "Notification for new survey is shown and first+last notification time is set at:"+_notificationTime);
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
              logger.info(codeFileName,"showPrompt", _minPassed.toString()+" minutes have passed since the last notification date at "+_firstNotificationTime);

              _remainingTime = _appStatus.PromptDuration - _minPassed;
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
                                                          "Complete it within "+_remainingTime+" minutes and get \u002420!!!");
                  logger.info(codeFileName,"showPrompt", "Showing latest notification at: "+new Date());
                  await appStatus.setLastNotificationTime(new Date());

              }
          }
      }
}



export async function uploadFiles()
{
    //TODO: check if app in background, otherwise return
    if(AppState.currentState=='active')
    {
        logger.info('Global','uploadFiles', 'Current app state is '+AppState.currentState+'. Returning.');
        return;
    }

    logger.info('Global','uploadFiles', 'Current app state is '+AppState.currentState+'. Attempting to upload files.');

    const _appStatus = await appStatus.loadStatus();
    try
    {
        //check if WiFi is connected.
        const _ssid = await WifiManager.getCurrentWifiSSID();
        if((_ssid.length>0)  && (_ssid != '<unknown ssid>'))
        {
            logger.info('Global', 'uploadFiles', 'Obtained  SSID:'+_ssid+'.');

            //check if there is any survey response files, if so, upload them
            const _files = await RNFS.readdir(RNFS.DocumentDirectoryPath);
            logger.info('Global', 'uploadFiles', 'Uploading survey response files. Existing files:'+_files.toString());
            for(i =0; i< _files.length; i++)
            {
                const _file = _files[i];
                if(_file.startsWith('survey--response--'))
                {
                    logger.info('Global','uploadFiles', 'Uploading survey response file:'+_file);
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
            logger.info('Global', 'uploadFiles', 'Attempting to upload log file.');
            const _fileContent = await RNFS.readFile(LOG_FILE_PATH);
            const _uploaded = await utilities.uploadData( _fileContent, _appStatus.UUID,
                                            'Log', codeFileName, 'uploadFiles');
             if(_uploaded)
             {
                await RNFS.writeFile(LOG_FILE_PATH,'');
                logger.info(codeFileName, 'uploadFiles', 'Uploaded previous log file content. Replaced with empty file.');
             }
             else
             {
                logger.error(codeFileName, 'uploadFiles', 'Failed to upload log file.');
             }

        }
        else
        {
            logger.error('Global', 'uploadFiles', 'Obtained empty SSID:'+_ssid+'. Returning');
            return;
        }
    }
    catch(error)
    {
        logger.error('Global', 'uploadFiles', 'Failed to upload files: '+error);
        return;
    }

}