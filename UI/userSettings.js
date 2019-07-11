import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert, TextInput,ScrollView} from 'react-native';
import wifi from 'react-native-android-wifi';
//import TimePicker from 'react-time-picker'

import logger from '../controllers/logger';
import commonStyle from './Style'

export default class UserSettingsScreen extends React.Component {

  static navigationOptions = {
    title: 'Settings',
  };


  state = {homeWifi:0}

  componentDidMount()
  {
  }

  componentWillMount()
  {

  }




  render() {

    return (
    <ScrollView>
       <View style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'space-around',
                alignItems: 'stretch',
                backgroundColor:'lavender',
                margin:5
            }}>

            <Text style={commonStyle.questionStyle}>
                Please enter your home WiFi network name.
            </Text>
            <TextInput
                 multiline={false}
                 style={{height: 50, width: 100, borderColor: 'gray', borderWidth: 1}}
                 onChangeText={(text) =>
                   this.setState({ homeWifi: text })

                 }
                 value={''}
            />

            <Text style={commonStyle.questionStyle}>
                Please specify at which times you do not want to get prompts. Note that you will
                    only get prompts when connected to you home network.
            </Text>

            <View style={{flex:1, flexDirection:'row', margin:10, justifyContent: 'space-around', alignItems:'center'}}>
                <Text style={{margin:5, fontSize:20}}> Monday </Text>
                <Text style={{margin:5, fontSize:16}}> from</Text>
                <Text style={{margin:5, fontSize:16}}> to</Text>
            </View>


       </View>
       </ScrollView>
    );
  }


}