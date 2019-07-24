import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert,
DeviceEventEmitter, Image, TouchableHighlight, Modal} from 'react-native';
import wifi from 'react-native-android-wifi';
import Notification from 'react-native-android-local-notification';

import PushNotificationAndroid from 'react-native-push-notification';

import AnimatedProgressWheel from 'react-native-progress-wheel';

import logger from '../controllers/logger';

import appStatus from '../controllers/appStatus';

//Import UIs
import SurveyStartScreen from './startsurvey';
import commonStyles from './Style'

import ToolBar from './toolbar'

const codeFileName='home.js';

export default class HomeScreen extends React.Component {



  constructor(props)
  {
    super(props);
    this.state={msg: "Initial state", noSurveyDialogVisible: false};
  }


  startNewSurvey = () => //Will be called if participants indicate recent conversation
  {
    this.props.navigation.navigate('StartSurvey');
  }

  componentDidMount()
  {

    if(true)//check if survey is available from app settings
    {
          Alert.alert(
            'New survey!',
            'Were you talking recently?',
            [
              {text: 'Yes', onPress: () => {
                logger.info(`${codeFileName}`, "'Yes' to recent conversation", "Navigating to StartSurvey");
                appStatus.setSurveyStatus("Started");
                this.props.navigation.navigate('StartSurvey');
                }},
              {text: 'No', onPress: () => {
                    logger.info(`${codeFileName}`, "'No' to recent conversation", "Showing NoSurvey dialog.");
                    //this.setState({noSurveyDialogVisible: true});
              }}
            ],
            {cancelable: true},
          );
    }
    else
    {
        this.setState({noSurveyDialogVisible: true});
    }


   // this.UpdateWifiState();
    //this.interval = setInterval(()=> this.UpdateWifiState(), 5000);
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
          <Image
            style={{width: '85%', height:250, resizeMode : 'contain' , margin:20}}
            source={require('../res/logo.png')}
          />

           <View style={{
                                       flex: 1,
                                       flexDirection: 'column',
                                       justifyContent: 'center',
                                       alignItems: 'center'
                                   }}>
             <TouchableHighlight style ={[commonStyles.buttonTouchHLStyle]}>
                 <Button title="Start new survey"
                     color="#20B2AA"
                     onPress={() => {
                         logger.info(`${codeFileName}`, "Start new survey button press", "Navigating to StartSurvey");
                                         appStatus.setSurveyStatus("Started");
                                         this.props.navigation.navigate('StartSurvey');

                     }}
                 />
             </TouchableHighlight>

             <Text>{this.state.msg}</Text>
           </View>

           <Modal visible = {this.state.noSurveyDialogVisible}>
            <View style={{  flex: 1,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'stretch',
                            backgroundColor:'lavender',
                            margin:5}}>
                <Text style={{margin:15, fontSize:20, borderBottomColor:'black', borderBottomWidth: StyleSheet.hairlineWidth, padding:5}}>
                    No survey available now.
                </Text>
                <Text style={{fontSize:16, margin:10, marginTop:10}}>
                    Advertisement/reminder for MIMI and suggestion to come back later.
                </Text>
                   <TouchableHighlight style ={[commonStyles.buttonTouchHLStyle]}>
                      <Button title="I will come back later!"
                          color="#20B2AA"
                        onPress={() => {
                          logger.info(`${codeFileName}`, "No survey modal", "Closing app");
                          this.setState({noSurveyDialogVisible: false});
                      }}/>
                </TouchableHighlight>
            </View>
           </Modal>

      </View>
    );
  }


}