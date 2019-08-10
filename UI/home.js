import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert,
DeviceEventEmitter, Image, TouchableHighlight, Modal, BackHandler, AppState} from 'react-native';
import wifi from 'react-native-android-wifi';
import * as RNFS from 'react-native-fs';
import PushNotificationAndroid from 'react-native-push-notification';
import notificationController from '../controllers/notificationController';
import {onAppOpen} from '../controllers/notificationController';
import AnimatedProgressWheel from 'react-native-progress-wheel';
import Dialog from 'react-native-dialog';
import logger from '../controllers/logger';
import UUIDGenerator from 'react-native-uuid-generator';
import appStatus from '../controllers/appStatus';
import {SURVEY_STATUS} from '../controllers/constants'

//Import UIs
import SurveyStartScreen from './startsurvey';
import commonStyles from './Style'

import ToolBar from './toolbar'

const codeFileName='home.js';

import utilities from '../controllers/utilities';

import AsyncStorage from '@react-native-community/async-storage';

import {USER_SETTINGS_FILE_PATH, STUDY_PERIOD, INVITATION_CODE_FILE_PATH} from '../controllers/constants';

export default class HomeScreen extends React.Component {


  static navigationOptions = ({ navigation }) => {
    return {
        headerLeft: null,
        headerTitle: <ToolBar title="Home" progress={0} showProgress={false}
                                    backCallBack={navigation.getParam('backCallBack')}/>
    };
  };


  constructor(props)
  {
    super(props);
    this.state={invitationCodePrompt: "Please enter your invitation code",
                invitationCodeDialogVisible:false,
                invitationCode:'',
                noSurveyDialogVisible: false,
                };
  }


    isFirstLaunch = async () => {
      try {
        const value = await AsyncStorage.getItem('@HAS_LAUNCHED')
        return value;
      } catch(e) {
        // error reading value
      }
    }

  handleAppStateChange(currentState)
  {

  }

  async startSurvey() //Will be called if participants indicate recent conversation
  {
      Alert.alert(
        'New survey!',
        'Have you had a conversation recently?',
        [
          {text: 'Yes', onPress: () => {
              logger.info(`${codeFileName}`, "'Yes' to recent conversation", " Setting survey status to ONGOING and navigating to StartSurvey");

              const _surveyID = 'SurveyID-'+Date.now();

              appStatus.setCurrentSurveyID(_surveyID)
                       .then(() =>
                       {
                          appStatus.setSurveyStatus(SURVEY_STATUS.ONGOING)
                                   .then(() =>
                                   {
                                        notificationController.cancelNotifications();
                                        this.props.navigation.navigate('StartSurvey');
                                   });
                       });
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


  initApp = async () =>
  {
       if(this.props.navigation.state.routeName == 'Home')
       {
              AppState.addEventListener('change', this.handleAppStateChange.bind(this));
              logger.info(codeFileName, 'componentDidMount', 'Registering to listen app foreground/background transition');

              logger.info(codeFileName, "componentDidMount", "Reloading app status.");
              _appStatus = await appStatus.loadStatus();
              logger.info(codeFileName, "componentDidMount", "Current app status:"+JSON.stringify(_appStatus));

            if(await this.isFirstLaunch()==null)
            {
                //first launch
                logger.info(codeFileName, 'componentDidMount', "First time app launch. Getting invitation code.");
                this.setState({noSurveyDialogVisible: true, invitationCodeDialogVisible:true});
            }
            else
            {
                //TODO: check for home wifi set and connected, and the current survey (if available) was created today
                logger.info(codeFileName, 'componentDidMount', "Nth time app launch");

                //Check if study period has ended
                {
                    _installationDate = _appStatus.InstallationDate;
                    logger.info(codeFileName, 'componentDidMount', 'Checking if study period has ended. _installationDate:'+_installationDate)
                    if(_installationDate==null)
                    {
                        logger.error(codeFileName, 'componentDidMount', 'Fatal error: installation date is null!!!')
                    }
                    else
                    {
                        _oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
                        _currDate = new Date();
                        _diffDays = Math.round(Math.abs((_currDate.getTime() - _installationDate.getTime())/(_oneDay)));
                        if(_diffDays > STUDY_PERIOD)
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
                        .then(async (_fileContent) =>
                       {
                            _userSettingsData = JSON.parse(_fileContent);
                            logger.info(codeFileName, 'componentDidMount', 'Read user settings file:'+_fileContent);

                            if(_userSettingsData.homeWifi.length==0)
                            {
                                 logger.info(codeFileName, 'componentDidMount', 'Home Wifi not set. Navigating to settings page.');
                                 this.props.navigation.navigate('UserSettings');
                            }
                            else
                            {
                                if(_appStatus.SurveyStatus == SURVEY_STATUS.AVAILABLE)//check if survey is available from app settings
                                {
                                    logger.info(codeFileName, 'componentDidMount', "New survey available. Asking for conversation.");
                                    this.setState({noSurveyDialogVisible:false});
                                    await this.startSurvey();
                                }
                                else
                                {
                                    logger.info(codeFileName, 'componentDidMount', "No survey available.");
                                    this.setState({noSurveyDialogVisible:true});
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
                    logger.info(codeFileName, 'componentDidMount', 'Settings file not found. Navigating to settings page.');
                    this.props.navigation.navigate('UserSettings');
                }
            }

        }

      this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
            BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
      );

      this.didFocusSubscription= this.props.navigation.addListener(
              'didBlur',
              payload => {}
            );
  }

  async componentDidMount()
  {
      this.props.navigation.setParams({ backCallBack: this.initApp.bind(this)});
      onAppOpen.backCallBack = this.initApp.bind(this);
      await this.initApp();
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

             <Dialog.Container visible={this.state.invitationCodeDialogVisible}>
                   <Dialog.Title>{this.state.invitationCodePrompt}</Dialog.Title>
                   <Dialog.Input
                       multiline={true}
                       numberOfLines={1}
                       style={{height: 300, borderColor: 'lightgray', borderWidth: 1}}
                       value={this.state.invitationCode}
                       onChangeText={(code) => {
                                 this.setState({invitationCode: code});
                                 }}
                   />

                   <Dialog.Button label="Cancel" onPress={ () => {BackHandler.exitApp();}}/>
                   <Dialog.Button label="Save" onPress={ async () => {

                            //TODO: check validity of the code
                            _code = this.state.invitationCode;
                            if(_code.length==2 && _code.toLowerCase().startsWith('i'))
                            {
                                logger.info(codeFileName, 'invitationCodeDialog', "Entered invitation code:"+this.state.invitationCode+'. Writing it to file.');
                                const _written = await utilities.writeJSONFile({InvitationCode:_code},
                                                                INVITATION_CODE_FILE_PATH,
                                                                codeFileName, "invitationCodeDialog");
                                if(_written)
                                {
                                    try
                                    {
                                        await AsyncStorage.setItem('@HAS_LAUNCHED', 'true');
                                        const _uuid = await UUIDGenerator.getRandomUUID();
                                        const _installationDate = new Date();

                                        _appStatus = appStatus.loadStatus();
                                        _appStatus.InstallationDate = _installationDate;
                                        _appStatus.LastSurveyCreationDate = _installationDate; //this should not be a problem, since survey count is still zero.
                                        _appStatus.UUID = _uuid;

                                        logger.info(codeFileName, 'invitationCodeDialog', "Setting app status properties.");
                                        await appStatus.setAppStatus(_appStatus);

                                    }
                                    catch (e)
                                    {
                                        logger.error(codeFileName, 'invitationCodeDialog', "Failed to set installation flag:"+e.message);
                                    }

                                    this.setState({invitationCodeDialogVisible:false});
                                    logger.info(codeFileName, 'invitationCodeDialog', "Navigating to settings page.");
                                    this.props.navigation.navigate('UserSettings', {firstLaunch:true, backCallBack: this.initApp.bind(this)});
                                }
                                else
                                {
                                    logger.error(codeFileName, 'invitationCodeDialog', 'Error saving invitation code. Asking to try again.');
                                    Alert.alert('Error','There was an error saving invitation code. Please try again later.');
                                    BackHandler.exitApp();
                                }
                            }
                            else
                            {
                                this.setState({invitationCodePrompt: 'The code you entered is invalid. Please try again.'});
                            }

                       }}/>

                 </Dialog.Container>

      </View>
    );
  }

    componentWillUnmount()
    {
      AppState.removeEventListener('change', this.handleAppStateChange);
      this._didFocusSubscription && this._didFocusSubscription.remove();
      logger.info(codeFileName, 'componentWillUnmount', 'Removing listeners and event handlers');
    }

}