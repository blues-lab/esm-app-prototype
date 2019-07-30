/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

//might be useful to show status https://www.npmjs.com/package/react-native-flash-message

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, AppState, Alert} from 'react-native';
import * as RNFS from 'react-native-fs';
import { createStackNavigator, createAppContainer } from 'react-navigation';

import appStatus from './controllers/appStatus'
import logger from './controllers/logger';
logger.setup();

//Import UI files
import HomeScreen from './UI/home'
import SurveyStartScreen from './UI/startsurvey'
import ServiceMenuScreen from './UI/servicemenu'
import ServiceDetailsScreen from './UI/servicedetails'
import ServicePermissionScreen from './UI/servicePermission'
import ContextualQuestionScreen from './UI/contextualQuestion'
import UserSettingsScreen from './UI/userSettings'
import AlvaPromptScreen from './UI/alvaPrompt';

import BackgroundJob from 'react-native-background-job';

import backgroundJobs from './controllers/backgroundJobs';
import notificationController from './controllers/notificationController';
import {USER_SETTINGS_FILE_PATH,SURVEY_STATUS, MAX_NOTIFICATION_NUM} from './controllers/constants'
const codeFileName="App.js";


//----- set up job for showing periodic survey prompts --------//

//// define the job
const backgroundJobPrompt = {
    jobKey: "showNotification",
    job: () =>
    {
    }
};

////register the job
BackgroundJob.register(backgroundJobPrompt);

////create schedule for the notification
var notificationSchedulePrompt = {
 jobKey: "showNotification",
 period: 15*60*1000
}

////schedule the 'schedule'
BackgroundJob.schedule(notificationSchedulePrompt)
  .then(() => logger.info(`${codeFileName}`,'Global',"Successfully scheduled background job for prompt"))
  .catch(err => logger.error(`${codeFileName}`,'Global',"Error in scheduling job for prompt:"+err.message));

//----- set up job for showing periodic survey prompts --------//

//----- set up job for periodic file upload  --------//

//// define the job
//    const backgroundJobFU = {
//     jobKey: "fileUpload",
//     job: () => {
//            //notificationController.showNotification("Notification from App.js");
//        }
//    };
//
//    ////register the job
//    BackgroundJob.register(backgroundJobFU);
//
//    ////create schedule for the notification
//    var notificationScheduleFU = {
//     jobKey: "fileUpload",
//     period: 60*60*1000
//    }
//
//    ////schedule the 'schedule'
//    BackgroundJob.schedule(notificationScheduleFU)
//      .then(() => logger.info(`${codeFileName}`,'Global',"Successfully scheduled background job for file upload."))
//      .catch(err => logger.error(`${codeFileName}`,'Global',"Error in scheduling job for file upload:"+err.message));

//----- set up job for periodic file upload --------//


//The main navigation controller
const AppNavigator = createStackNavigator(
  {
    Home: HomeScreen,
    StartSurvey: SurveyStartScreen,
    AlvaPrompt:AlvaPromptScreen,
    ServiceMenu: ServiceMenuScreen,
    ServiceDetails: ServiceDetailsScreen,
    ServicePermission: ServicePermissionScreen,
    ContextualQuestion: ContextualQuestionScreen,
    UserSettings:UserSettingsScreen
  },
  {
    initialRouteName: "Home"
  }
);


const AppContainer = createAppContainer(AppNavigator);

const serviceFileAsset= 'services.js';
const serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';
const appStatusFileAsset= 'appStatus.js';
const appStatusFileLocal = RNFS.DocumentDirectoryPath+'/appStatus.js';


export default class App extends Component<Props> 
{

  state = {};

  async generateInitialFiles(assetFile, localFile)
  {
    if(await RNFS.exists(localFile))
    {
        //do nothing
    }
    else
    {
        RNFS.readFileAssets(assetFile)
            .then((res) =>
            {
                  RNFS.writeFile(localFile, res)
                  .then((success) =>
                  {
                    logger.info(`${codeFileName}`, 'generateInitialFiles', 'Writing '+localFile);
                  })
                  .catch((err) =>
                  {
                    logger.error(`${codeFileName}`, 'generateInitialFiles'
                      ,'Failed to write '+localFile+'. Error code:'+err.code+', Error: '+err.message);

                  })
            })
            .catch((err) => {
              logger.error(`${codeFileName}`, 'generateInitialFiles'
                     ,'Failed to read '+assetFile+'. Error: '+err.message);
            })
    }
  }


  componentDidMount()
  {
    this.generateInitialFiles(serviceFileAsset, serviceFileLocal);
    this.testPrompt();
    //setTimeout(this.testPrompt, 70*1000);
    //setTimeout(notificationController.cancelNotifications, 90*1000)
  }

  testPrompt()
  {
          logger.info(codeFileName, "showPrompt", "Getting app status.");
          const _appStatus = appStatus.getStatus();

          logger.info(codeFileName, "showPrompt", "Loading user settings.");
          _userSettingsData = null;

          RNFS.exists(USER_SETTINGS_FILE_PATH)
              .then( (exists) =>
              {
                  if (exists)
                  {
                      RNFS.readFile(USER_SETTINGS_FILE_PATH)
                          .then((_fileContent) =>
                          {
                              logger.info(codeFileName, 'showPrompt', 'Successfully read user settings file.');
                              _userSettingsData = JSON.parse(_fileContent);
                          })
                          .catch( (error)=>
                          {
                              logger.error(codeFileName, 'showPrompt', 'Failed to read User settings file.'+error.message);
                          })
                  }
                  else
                  {
                      logger.info(codeFileName,'showPrompt','User settings file does not exist.')
                  }
              });

          //Check if in "Don't disturb" times (Sunday is 0, Monday is 1)
          doNotDisturb = false;
          if(_userSettingsData)
          {
              day = new Date().getDay();
              from = userSettings.getFromHour(day)
              to= userSettings.getToHour(day)

              current = new Date();
              now = current.getHours()*60 + current.getMinutes();
              doNotDisturb = now>from && now<to;
              if(doNotDisturb)
              {
                logger.info(codeFileName, 'showPrompt', 'Inside "Do not disturb" mode. Canceling all notification.');
                notificationController.cancelNotifications();
              }

              logger.info(codeFileName, 'showPrompt', 'Not in "Do not disturb" mode.');
          }

          if( !doNotDisturb && (_appStatus.SurveyStatus == SURVEY_STATUS.NOT_AVAILABLE))
          {//if no survey is available, randomly create one

              logger.info(codeFileName,"showPrompt", "No survey available; randomly creating one.");
              _createSurvey = (Math.floor(Math.random() * 100) + 1)%2==0;
              logger.info(codeFileName,"showPrompt", "No survey available; randomly creating one; _createSurvey:"+_createSurvey);

              if(_createSurvey)
              {
                  logger.info(codeFileName,"showPrompt", "Creating new survey and changing status to AVAILABLE.");
                  appStatus.setSurveyStatus(SURVEY_STATUS.AVAILABLE);
                  _remainingTime = _appStatus.PromptDuration;
                  notificationController.cancelNotifications();
                  notificationController.showNotification("New survey available!",
                       "Complete it within "+_remainingTime+" minutes and get $0.2!!!");
                  appStatus.setLastNotificationTime(new Date());
              }
          }
          else if( !doNotDisturb && (_appStatus.SurveyStatus == SURVEY_STATUS.AVAILABLE))
          {//Survey is available, show prompt if there is still time, or make survey expired

              logger.info(codeFileName,"showPrompt", "Survey available.");
              const _lastNotificationTime = Date.parse(_appStatus.LastNotificationTime);
              _minPassed = Math.floor((Date.now() - _lastNotificationTime)/60000);
              logger.info(codeFileName,"showPrompt", _minPassed.toString()+" minutes have passed since the last notification date at "+_lastNotificationTime);

              _remainingTime = _appStatus.PromptDuration - _minPassed;
              if(_remainingTime==0) //survey expired, remove all existing notification
              {
                  logger.info(codeFileName,"showPrompt", "Remaining time "+_remainingTime+", cancelling notifications.");
                  notificationController.cancelNotifications();
                  logger.info(codeFileName,"showPrompt", "Changing survey status to NOT_AVAILABLE.");
                  appStatus.setSurveyStatus(SURVEY_STATUS.NOT_AVAILABLE);
              }
              else
              {
                  logger.info(codeFileName, 'showPrompt','Remaining time:'+_remainingTime+
                              ', survey status:'+_appStatus.SurveyStatus+', notification count:'+_appStatus.NotificationCountToday)
                  if(
                      _remainingTime>0 &&
                      _appStatus.SurveyStatus == SURVEY_STATUS.AVAILABLE &&
                      _appStatus.NotificationCountToday < MAX_NOTIFICATION_NUM
                    )
                  {
                      notificationController.cancelNotifications();
                      notificationController.showNotification("New survey available!",
                                  "Complete it within "+_remainingTime+" minutes and get $0.2!!!");
                      logger.info(codeFileName,"showPrompt", "Showing latest notification at: "+new Date());
                      appStatus.setLastNotificationTime(new Date());
                  }
              }
          }
      }

  render() {

    return <AppContainer />;
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
