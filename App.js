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
import UserSettingsScreen from './UI/userSettings';
import {UserSettingsEntity}from './UI/userSettings';
import AlvaPromptScreen from './UI/alvaPrompt';

import BackgroundJob from 'react-native-background-job';

import backgroundJobs from './controllers/backgroundJobs';
import notificationController from './controllers/notificationController';
import {USER_SETTINGS_FILE_PATH,SURVEY_STATUS, MAX_NOTIFICATION_NUM} from './controllers/constants'
const codeFileName="App.js";

import {showPrompt} from './controllers/backgroundJobs';


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

    //showPrompt();
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
