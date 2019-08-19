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

//Import UI files
import HomeScreen from './UI/home'
import SurveyStartScreen from './UI/startsurvey'
import ServiceMenuScreen from './UI/servicemenu'
import ServiceDetailsScreen from './UI/servicedetails'
import ServicePermissionScreen from './UI/servicePermission'
import ContextualQuestionScreen from './UI/contextualQuestion'
import UserSettingsScreen from './UI/userSettings';
import {UserSettingsEntity}from './UI/userSettings';
import AlvaPromptScreen from './UI/alvaPrompt';
import utilities from './controllers/utilities';
import BackgroundFetch from "react-native-background-fetch";
import backgroundJobs from './controllers/backgroundJobs';
import notificationController from './controllers/notificationController';
import {USER_SETTINGS_FILE_PATH,SURVEY_STATUS,
        MAX_NOTIFICATION_NUM, SERVICE_FILE_ASSET,
        SERVICE_FILE_LOCAL, SERVICES} from './controllers/constants'
import {showPrompt, uploadFiles} from './controllers/backgroundJobs';
import Permissions from 'react-native-permissions';



const codeFileName="App.js";

if(Platform.OS=='android')
{
BackgroundJob = require('react-native-background-job');
//----- set up job for showing periodic survey prompts --------//
//// define the job
const backgroundJobPrompt = {
    jobKey: "showNotification",
    job: () => {showPrompt();}

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
    const backgroundJobFU = {
     jobKey: "fileUpload",
     job: () =>
     {
        uploadFiles();
     }
    };

    ////register the job
    BackgroundJob.register(backgroundJobFU);

    ////create schedule for the notification
    var notificationScheduleFU = {
     jobKey: "fileUpload",
     period: 30*60*1000
    }

    ////schedule the 'schedule'
    BackgroundJob.schedule(notificationScheduleFU)
      .then(() => logger.info(`${codeFileName}`,'Global',"Successfully scheduled background job for file upload."))
      .catch(err => logger.error(`${codeFileName}`,'Global',"Error in scheduling job for file upload:"+err.message));

//----- set up job for periodic file upload --------//
}

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

export default class App extends Component<Props> 
{

  state = {};

  async generateInitialFiles()
  {
    logger.info(codeFileName, 'generateInitialFiles', 'Writing initial files.')
    if(!await RNFS.exists(USER_SETTINGS_FILE_PATH))//write default settings
    {
        const _settings={ homeWifi: '', askWifi:true, afterTime: '00:00',beforeTime: '00:00'};

        await utilities.writeJSONFile(_settings, USER_SETTINGS_FILE_PATH,
                                        codeFileName, 'generateInitialFiles');
    }
    if(!await RNFS.exists(SERVICE_FILE_LOCAL)) //write service file
    {
//        const _fileContent = await RNFS.readFileAssets(SERVICE_FILE_ASSET);
        await utilities.writeJSONFile(SERVICES, SERVICE_FILE_LOCAL,
                                     codeFileName, 'generateInitialFiles');
    }
  }


  async componentDidMount()
  {
    if(Platform.OS=='ios')
    {
        logger.info(codeFileName, 'componentDidMount', 'Checking if notification permission is granted.');
        const _response = await Permissions.check('notification');
        if(_response != 'authorized')
        {
            logger.info(codeFileName, 'componentDidMount', 'Notification permission is not granted. Asking for permission.');
            const response = await Permissions.request('notification');
            if(response != 'authorized')
            {
                logger.info(codeFileName, 'componentDidMount', 'Notification permission denied. Exiting app.');
                BackHandler.exitApp();
            }
        }

        logger.info(codeFileName, 'componentDidMount',"Configuring background tasks for iOS.")
        BackgroundFetch.configure({
              minimumFetchInterval: 15, // <-- minutes (15 is minimum allowed)
              stopOnTerminate: false,   // <-- Android-only,
              startOnBoot: true         // <-- Android-only
            }, () => {
              uploadFiles();
              showPrompt();
              // Required: Signal completion of your task to native code
              // If you fail to do this, the OS can terminate your app
              // or assign battery-blame for consuming too much background-time
              BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
            }, (error) => {
              logger.error(codeFileName, 'componentDidMount', "RNBackgroundFetch failed to start.");
            });

            BackgroundFetch.status((status) => {
                  switch(status) {
                    case BackgroundFetch.STATUS_RESTRICTED:
                      logger.warn(codeFileName,'componentDidMount',"BackgroundFetch restricted");
                      break;
                    case BackgroundFetch.STATUS_DENIED:
                      logger.warn(codeFileName,'componentDidMount',"BackgroundFetch denied");
                      break;
                    case BackgroundFetch.STATUS_AVAILABLE:
                      logger.info(codeFileName,'componentDidMount',"BackgroundFetch enabled");
                      break;
                  }
                });
    }

    await this.generateInitialFiles();

    //uploadFiles();
    this.tu=null;
    this.sp=null;
//    this.tu = setTimeout(uploadFiles, 30*1000);
    //this.sp = setTimeout(showPrompt, 30*1000);
  }

  componentWillUnmount()
  {
    this.tu && clearInterval(this.tu);
    this.sp && clearInterval(this.sp);
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
