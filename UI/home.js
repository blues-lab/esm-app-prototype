import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button} from 'react-native';
import wifi from 'react-native-android-wifi';


//Import UIs
import SurveyStartScreen from './startsurvey'

export default class HomeScreen extends React.Component {

  state = {msg: "Initial state"};

  componentDidMount()
  {
    this.UpdateWifiState();
    this.interval = setInterval(()=> this.UpdateWifiState(), 5000)
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
          onPress={() => this.props.navigation.navigate('ServiceMenu')}
        />
      </View>
    );
  }
}