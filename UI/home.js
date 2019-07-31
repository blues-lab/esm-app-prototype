import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert,
DeviceEventEmitter, Image, TouchableHighlight, Modal, BackHandler, AppState} from 'react-native';
import wifi from 'react-native-android-wifi';
import * as RNFS from 'react-native-fs';
import PushNotificationAndroid from 'react-native-push-notification';

import AnimatedProgressWheel from 'react-native-progress-wheel';

import logger from '../controllers/logger';

import appStatus from '../controllers/appStatus';
import {SURVEY_STATUS} from '../controllers/constants'

//Import UIs
import SurveyStartScreen from './startsurvey';
import commonStyles from './Style'

import ToolBar from './toolbar'

const codeFileName='home.js';

import utilities from '../controllers/utilities';

import AsyncStorage from '@react-native-community/async-storage';

import {USER_SETTINGS_FILE_PATH} from '../controllers/constants'



export default class HomeScreen extends React.Component {

  static navigationOptions = {
        headerLeft: null,
        headerTitle: <ToolBar title="Mimi" showProgress={false}/>
      };

  constructor(props)
  {
    super(props);
    this.state={msg: "Initial state", noSurveyDialogVisible: false};
  }


  startNewSurvey = () => //Will be called if participants indicate recent conversation
  {
    this.props.navigation.navigate('StartSurvey');
  }


    isFirstLaunch = async () => {
      try {
        const value = await AsyncStorage.getItem('@HAS_LAUNCHED')
        return value;
      } catch(e) {
        // error reading value
      }
    }

  handleAppStateChange = (currentState) =>
  {
      const _appStatus = appStatus.getStatus();
      logger.info(codeFileName, "handleAppStateChange", "Current app state: "+currentState);
      if(currentState=='active')
      {
        //show appropriate screen based on if survey is available
        if(_appStatus.SurveyStatus == SURVEY_STATUS.AVAILABLE)
        {//survey is available, but not ONGOING
            this.setState({noSurveyDialogVisible:false})
            this.startSurvey();
        }
      }
  }

  startSurvey()
  {

      Alert.alert(
        'New survey!',
        'Have you had a conversation recently?',
        [
          {text: 'Yes', onPress: () => {
              logger.info(`${codeFileName}`, "'Yes' to recent conversation", " Setting survey status to ONGOING and navigating to StartSurvey");
              appStatus.setSurveyStatus(SURVEY_STATUS.ONGOING);
              this.props.navigation.navigate('StartSurvey');
            }},
          {text: 'No', onPress: () => {
                logger.info(`${codeFileName}`, "'No' to recent conversation", "Exiting App.");

                Alert.alert("Thank you!", "We will try again later.",
                  [
                      {text: 'OK', onPress:() => {BackHandler.exitApp()}}
                  ]
                )

          }}
        ],
        {cancelable: false},
      );
  }


  async componentDidMount()
  {
      AppState.addEventListener('change', this.handleAppStateChange);
      logger.info(codeFileName, 'componentDidMount', 'Registering to listen app foreground/background transition');

      logger.info(codeFileName, "componentDidMount", "Getting app status.");
      const _appStatus = appStatus.getStatus();

    if(await this.isFirstLaunch()==null)
    {
        logger.info(codeFileName, 'componentDidMount', "First time app launch. Trying to set flag.");
        try
        {
            await AsyncStorage.setItem('@HAS_LAUNCHED', 'true');
            const _installationDate = new Date();
            logger.info(codeFileName, 'componentDidMount', "Setting installation date:"+_installationDate.toString());
            appStatus.setInstallationDate(_installationDate);
        }
        catch (e)
        {
            logger.info(codeFileName, 'componentDidMount', "Failed to set flag:"+e.message);
        }

        logger.info(codeFileName, 'componentDidMount', "Navigating to settings page.");
        this.props.navigation.navigate('UserSettings');
    }
    else
    {
        logger.info(codeFileName, 'componentDidMount', "Nth time app launch");

        //Check if study period has ended
        {
            _installationDate = _appStatus.InstallationDate;
            if(_installationDate==null)
            {
                logger.error(codeFileName, 'componentDidMount', 'Fatal error: installation date is null!!!')
            }
            else
            {
                _oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
                _currDate = new Date();
                _diffDays = Math.round(Math.abs((_currDate.getTime() - _installationDate.getTime())/(_oneDay)));
                if(_diffDays > _appStatus.StudyDuration)
                {
                    logger.info(codeFileName, 'componentDidMount', "Survey period ended. Returning");
                    return;
                }
                else
                {
                    logger.info(codeFileName, 'componentDidMount', "Still in survey period. "+_diffDays+' days have passed.');
                }
            }

        }
        if (await RNFS.exists(USER_SETTINGS_FILE_PATH))
        {
            RNFS.readFile(USER_SETTINGS_FILE_PATH)
                .then((_fileContent) =>
               {
                    logger.info(codeFileName, 'componentDidMount', 'Successfully read user settings file. Checking if home wifi was set.');
                    _userSettingsData = JSON.parse(_fileContent);

                    if(_userSettingsData.homeWifi.length==0)
                    {
                         this.props.navigation.navigate('UserSettings');
                    }
                    else
                    {
                        if(_appStatus.SurveyStatus == SURVEY_STATUS.AVAILABLE)//check if survey is available from app settings
                        {
                            logger.info(codeFileName, 'componentDidMount', "New survey available. Asking for conversation.");
                            this.startSurvey();
                        }
                        else
                        {
                            logger.info(codeFileName, 'componentDidMount', "No survey available.");
                            this.setState({noSurveyDialogVisible:true})
                        }
                    }
               })
               .catch( (error) =>
                {
                    logger.error(codeFileName, 'componentDidMount', 'Error reading user settings file:'+error.message);
                }
               )
        }
        else
        {
            this.props.navigation.navigate('UserSettings');
        }
    }

      //this.setState({noSurveyDialogVisible: true})

      this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
            BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
      );

      this.didFocusSubscription= this.props.navigation.addListener(
              'didBlur',
              payload => {}
            );

  }

  UpdateWifiState()
  {
    wifi.isEnabled((isEnabled) => {
    if (isEnabled)
      {
        wifi.connectionStatus((isConnected) => {
          if (isConnected) {
              wifi.getSSID((ssid) => {
                this.setState({msg: "Connected: "+ssid});
              });
            } else {
              this.setState({msg: "Not connected!"});
          }
        });

        this.setState({msg: "Wifi is enabled!"});
      }
      else
      {
        this.setState({msg: "Wifi not enabled!"});
      }
    });
  }

  render() {

    return (
      <View style={{
                      flex: 1,
                      flexDirection: 'column',
                      justifyContent: 'space-around',
                      alignItems: 'stretch',
                      backgroundColor:'lavender',
                      margin:5
                  }}>


           { this.state.noSurveyDialogVisible &&
                <View style={{  flex: 1,
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                                backgroundColor:'lavender',
                                margin:20}}>
                    <Text style={{margin:15, fontSize:20, borderBottomColor:'black', borderBottomWidth: StyleSheet.hairlineWidth, padding:5}}>
                        Sorry, no survey available!
                    </Text>
                    <Text style={{fontSize:16, margin:10, marginTop:10}}>
                        Advertisement/reminder for MIMI and suggestion to come back later.
                    </Text>
                       <TouchableHighlight style ={[commonStyles.buttonTouchHLStyle]}>
                          <Button title="Ok, try later!"
                              color="#20B2AA"
                            onPress={() => {
                              logger.info(`${codeFileName}`, "No survey modal", "Closing app");
                              this.setState({noSurveyDialogVisible: false});
                              BackHandler.exitApp();
                          }}/>
                    </TouchableHighlight>
                </View>
           }

      </View>
    );
  }

    componentWillUnmount()
    {
      AppState.removeEventListener('change', this.handleAppStateChange);
      this._didFocusSubscription && this._didFocusSubscription.remove();
      logger.info(codeFileName, 'componentWillUnmount', 'Removing listeners and evens handlers');
    }

}