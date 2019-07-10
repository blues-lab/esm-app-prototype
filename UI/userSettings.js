import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert, DeviceEventEmitter} from 'react-native';
import wifi from 'react-native-android-wifi';
//import TimePicker from 'react-time-picker'

import logger from '../controllers/logger';


export default class UserSettingsScreen extends React.Component {

  state = {startTime:0}

  componentDidMount()
  {
  }

  componentWillMount()
  {

  }




  render() {

    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Hi</Text>
      </View>
    );
  }


}