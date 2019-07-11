import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert, DeviceEventEmitter} from 'react-native';
import wifi from 'react-native-android-wifi';
import Notification from 'react-native-android-local-notification';

import PushNotificationAndroid from 'react-native-push-notification';

import logger from '../controllers/logger';

import appStatus from '../controllers/appStatus';

//Import UIs
import SurveyStartScreen from './startsurvey'

export default class HomeScreen extends React.Component {

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
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Home Screen</Text>
        <Text>{this.state.msg}</Text>
        <Button
          title="Start new survey"
          onPress={() =>
              {
                //logger.info("HomeScreen", "render", "Navigating to StartSurvey");
                //logger.showLog();
                //this.props.navigation.navigate('StartSurvey')

               Alert.alert('HI',JSON.stringify(appStatus));

               // Notification.send({ message: 'Message', action: 'ACTION_NAME',
                 //payload: { data: 'Anything' } });

              }
          }
        />

        <Button
          title="Change settings"
          onPress={() =>
              {
                //this.props.navigation.navigate('UserSettings')

              }
          }
         />
      </View>
    );
  }


}