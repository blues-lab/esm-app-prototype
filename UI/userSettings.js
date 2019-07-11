import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert, TextInput,
Picker, ScrollView,TouchableHighlight} from 'react-native';
import wifi from 'react-native-android-wifi';
import DateTimePicker from "react-native-modal-datetime-picker";
import logger from '../controllers/logger';
import commonStyle from './Style'


const codeFileName="userSettings.js"

export default class UserSettingsScreen extends React.Component {

  static navigationOptions = {
    title: 'Settings',
  };

    constructor(props) {
      super(props);
      this.state = {
        homeWifi:'',
        isDateTimePickerVisible: false,
        dayOfWeek:'Monday'
      };
    }

  componentDidMount()
  {
  }

  componentWillMount()
  {

  }


  handleDatePicked = (date) =>
  {
    Alert.alert("date",date)
  }

  hideDateTimePicker = () => {
      this.setState({ isDateTimePickerVisible: false });
    };

  render() {

    return (
    <ScrollView contentContainerStyle={{
                     flex: 1
                  }}>
       <View style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor:'lavender',
                margin:5
            }}>

            <Text style={commonStyle.questionStyle}>
                Please enter your home WiFi network name.
            </Text>
            <TextInput
                 multiline={false}
                 style={{height: 30, width: 200, backgroundColor: 'white', borderColor:'gray',
                    borderWidth: 1, alignItems:'center', marginTop:5, marginBottom:20}}
                 onChangeText={(text) =>
                   this.setState({ homeWifi: text })

                 }
                 value={''}
            />

            <Text style={commonStyle.questionStyle}>
                Please specify at which times you do not want to get prompts. Note that you will
                    only get prompts when connected to you home network.
            </Text>

            <View style={{flex:1, flexDirection:'row', margin:10, justifyContent: 'space-around', alignItems:'flex-start'}}>
            <View style={{flex:1, flexDirection:'row', justifyContent:'space-around', alignItems:'center'}}>
                <Picker
                  selectedValue={this.state.dayOfWeek}
                  style={{height: 50, width: 140}}
                    onValueChange={(itemValue, itemIndex) =>
                        this.setState({dayOfWeek: itemValue})
                    }>
                  <Picker.Item label="Monday" value="Monday" />
                  <Picker.Item label="Tuesday" value="Tuesday" />
                  <Picker.Item label="Wednesday" value="Wednesday" />
                </Picker>

                <TouchableHighlight style={{borderWidth:.5, padding:5}}
                    onPress= {() => {
                          this.setState({isDateTimePickerVisible:true})
                    }}>
                  <Text >00:00</Text>
                </TouchableHighlight>
                <Text style={{margin:5}}>to</Text>
                <TouchableHighlight style={{borderWidth:.5, padding:5}}
                    onPress= {() => {
                          this.setState({isDateTimePickerVisible:true})
                    }}>
                  <Text >00:00</Text>
                </TouchableHighlight>
            </View>
            </View>

            <TouchableHighlight style ={[commonStyle.buttonTouchHLStyle]}>
                 <Button title="Save settings"
                     color="#20B2AA"
                     onPress={() => {
                         logger.info(`${codeFileName}`, 'save button press', "Saving user settings and navigating to home screen");
                         this.props.navigation.goBack();

                     }}
                 />
             </TouchableHighlight>

       </View>

       <DateTimePicker
         isVisible={this.state.isDateTimePickerVisible}
         onConfirm={this.handleDatePicked}
         onCancel={this.hideDateTimePicker}
         mode='time'
       />
       </ScrollView>
    );
  }


}