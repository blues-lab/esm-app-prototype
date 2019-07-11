import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert,
DeviceEventEmitter, Image, TouchableHighlight} from 'react-native';
import wifi from 'react-native-android-wifi';
import Notification from 'react-native-android-local-notification';

import PushNotificationAndroid from 'react-native-push-notification';

import logger from '../controllers/logger';

import appStatus from '../controllers/appStatus';

//Import UIs
import SurveyStartScreen from './startsurvey';
import commonStyles from './Style'

const codeFileName='home.js';

export default class HomeScreen extends React.Component {

  static navigationOptions = {
    title: 'Welcome',
  };

  state = {msg: "Initial state"};

  componentDidMount()
  {
    this.UpdateWifiState();
    this.interval = setInterval(()=> this.UpdateWifiState(), 5000);
  }

  componentWillMount()
  {
    PushNotificationAndroid.registerNotificationActions(['Accept','Reject','Yes','No']);
      DeviceEventEmitter.addListener('notificationActionReceived', function(action){
        Alert.alert('Notification action received: ' + action);
      });
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
                                         //logger.showLog();
                                         this.props.navigation.navigate('StartSurvey')

                     }}
                 />
             </TouchableHighlight>
           </View>

           <Button
             title="Change settings"
             color="#D8BFD8"
             onPress={() => this.props.navigation.navigate('UserSettings')}
           />

      </View>
    );
  }


}