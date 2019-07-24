import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert, TextInput,
Picker, ScrollView,TouchableHighlight} from 'react-native';
import DateTimePicker from "react-native-modal-datetime-picker";
import logger from '../controllers/logger';
import * as RNFS from 'react-native-fs';
import commonStyle from './Style'
import wifi from 'react-native-android-wifi';
import utilities from '../controllers/utilities';


const codeFileName="userSettings.js"
const userSettingsFile= RNFS.DocumentDirectoryPath+'/userSettingsData.js';

export default class UserSettingsScreen extends React.Component {

  static navigationOptions = {
    title: 'Settings',
  };

    constructor(props) {
      super(props);
      this.state = {
        homeWifi:'',
        currentWifi:'',
        askWifi:true,
        mondayFrom:'00:00',
        mondayTo:'00:00',
        tuesdayFrom:'00:00',
        tuesdayTo:'00:00',
        wedFrom: '00:00',
        wedTo:'00:00',
        thFrom:'00:00',
        thTo:'00:00',
        friFrom:'00:00',
        friTo:'00:00',
        satFrom:'00:00',
        satTo:'00:00',
        sunFrom:'00:00',
        sunTo:'00:00',
        currentDay:'mondayFrom',
        isDateTimePickerVisible:false
      };
    }

   interval=null;
   updateWifiState = ()=>
   {

      wifi.isEnabled((isEnabled) => {
      if (isEnabled)
        {
          wifi.connectionStatus((isConnected) => {
            if (isConnected) {
                wifi.getSSID((ssid) => {
                  this.setState({currentWifi:ssid});

                  if(ssid.length>0)
                  {
                      Alert.alert(
                      'Home wifi',
                        'Is "'+ssid+'" your home wifi?',
                        [
                          {text: 'NO', onPress: () => {}},
                          {text: 'YES', onPress: () => {this.setState({homeWifi: ssid})}},
                        ]
                      );
                  }
                  this.setState({askWifi:false});
                  clearInterval(this.interval);
                });
              }
          });
        }
      });
   }


  componentDidMount()
  {
    //load user settings file if exists
    _userSettingsData = utilities.readJSONFile(userSettingsFile);
    if(_userSettingsData != null)
    {
       this.setState({homeWifi: _userSettingsData.homeWifi,
                      currentWifi: _userSettingsData.homeWifi,
                      isDateTimePickerVisible: false,
                      askWifi: false})
    }
    else
    {
       this.updateWifiState();
       this.interval=setInterval(this.updateWifiState, 1000);
       this.setState({askWifi:true});
    }

  }


  handleDatePicked = (time) =>
  {
    if(this.state.currentDay=='mondayFrom')
    {
        this.setState({mondayFrom: time.getHours()+":"+time.getMinutes(),
            tuesdayFrom: time.getHours()+":"+time.getMinutes()});
        this.setState({wedFrom: time.getHours()+":"+time.getMinutes()});
        this.setState({thFrom: time.getHours()+":"+time.getMinutes()});
        this.setState({friFrom: time.getHours()+":"+time.getMinutes()});
        this.setState({satFrom: time.getHours()+":"+time.getMinutes()});
        this.setState({sunFrom: time.getHours()+":"+time.getMinutes()});
    }
    if(this.state.currentDay=='mondayTo')
    {
        this.setState({mondayTo: time.getHours()+":"+time.getMinutes(),
                    tuesdayTo: time.getHours()+":"+time.getMinutes()});
        this.setState({wedTo: time.getHours()+":"+time.getMinutes()});
        this.setState({thTo: time.getHours()+":"+time.getMinutes()});
        this.setState({friTo: time.getHours()+":"+time.getMinutes()});
        this.setState({satTo: time.getHours()+":"+time.getMinutes()});
        this.setState({sunTo: time.getHours()+":"+time.getMinutes()});
    }
    if(this.state.currentDay=='tuesdayFrom')
    {
        this.setState({tuesdayFrom: time.getHours()+":"+time.getMinutes()});
    }
    if(this.state.currentDay=='tuesdayTo')
    {
        this.setState({tuesdayTo: time.getHours()+":"+time.getMinutes()});
    }
    if(this.state.currentDay=='wedFrom')
    {
        this.setState({wedFrom: time.getHours()+":"+time.getMinutes()});
    }
    if(this.state.currentDay=='wedTo')
    {
        this.setState({wedTo: time.getHours()+":"+time.getMinutes()});
    }
    if(this.state.currentDay=='thFrom')
    {
        this.setState({thFrom: time.getHours()+":"+time.getMinutes()});
    }
    if(this.state.currentDay=='thTo')
    {
        this.setState({thTo: time.getHours()+":"+time.getMinutes()});
    }
    if(this.state.currentDay=='friFrom')
    {
        this.setState({friFrom: time.getHours()+":"+time.getMinutes()});
    }
    if(this.state.currentDay=='friTo')
    {
        this.setState({friTo: time.getHours()+":"+time.getMinutes()});
    }
    if(this.state.currentDay=='satFrom')
    {
        this.setState({satFrom: time.getHours()+":"+time.getMinutes()});
    }
    if(this.state.currentDay=='satTo')
    {
        this.setState({satTo: time.getHours()+":"+time.getMinutes()});
    }
    if(this.state.currentDay=='sunFrom')
    {
        this.setState({sunFrom: time.getHours()+":"+time.getMinutes()});
    }
    if(this.state.currentDay=='sunTo')
    {
        this.setState({sunTo: time.getHours()+":"+time.getMinutes()});
    }

    this.setState({isDateTimePickerVisible:false});

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

            { this.state.homeWifi.length==0 &&
                <Text style={{margin:15, fontSize:20, borderBottomColor:'black', borderBottomWidth: StyleSheet.hairlineWidth, padding:5}}>
                    You will need to connect to your home wifi network
                </Text>
            }
            { this.state.homeWifi.length>0 &&
              <View style={{flex: 1,flexDirection: 'row', justifyContent: 'center'}}>
                <Text> Home wifi network {this.state.homeWifi}</Text>
                <TouchableHighlight onPress={this.changeWifi}>
                    <Text>Change</Text>
                </TouchableHighlight>
              </View>
            }

            <Text style={{margin:15, fontSize:20}}>
                Please specify at which times you do not want to get prompts. Note that you will
                    only get prompts when connected to you home network.
            </Text>


            <View style={{flex:1, flexDirection:'column', margin:10, justifyContent: 'space-around', alignItems:'flex-start'}}>
                <View style={{flex:1, flexDirection:'row', justifyContent:'space-around', alignItems:'center'}}>
                   <Text style={styles.dayLabelStyle}>Monday</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'mondayFrom',isDateTimePickerVisible:true})
                        }}>
                      <Text>{this.state.mondayFrom}</Text>
                    </TouchableHighlight>
                    <Text style={{margin:5}}>to</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'mondayTo',isDateTimePickerVisible:true})
                        }}>
                      <Text >{this.state.mondayTo}</Text>
                    </TouchableHighlight>
                </View>

                <View style={{flex:1, flexDirection:'row', justifyContent:'space-around', alignItems:'center'}}>
                   <Text style={styles.dayLabelStyle}>Tuesday</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'tuesdayFrom',isDateTimePickerVisible:true})
                        }}>
                      <Text >{this.state.tuesdayFrom}</Text>
                    </TouchableHighlight>
                    <Text style={{margin:5}}>to</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'tuesdayTo',isDateTimePickerVisible:true})

                        }}>
                      <Text >{this.state.tuesdayTo}</Text>
                    </TouchableHighlight>
                </View>

                <View style={{flex:1, flexDirection:'row', justifyContent:'space-around', alignItems:'center'}}>
                   <Text style={styles.dayLabelStyle}>Wednesday</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'wedFrom',isDateTimePickerVisible:true})
                        }}>
                      <Text >{this.state.wedFrom}</Text>
                    </TouchableHighlight>
                    <Text style={{margin:5}}>to</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'wedTo',isDateTimePickerVisible:true})

                        }}>
                      <Text >{this.state.wedTo}</Text>
                    </TouchableHighlight>
                </View>

                <View style={{flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                   <Text style={styles.dayLabelStyle}>Thursday</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'thFrom',isDateTimePickerVisible:true})
                        }}>
                      <Text >{this.state.thFrom}</Text>
                    </TouchableHighlight>
                    <Text style={{margin:5}}>to</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'thTo',isDateTimePickerVisible:true})

                        }}>
                      <Text >{this.state.thTo}</Text>
                    </TouchableHighlight>
                </View>

                <View style={{flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                   <Text style={styles.dayLabelStyle}>Friday</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'friFrom',isDateTimePickerVisible:true})
                        }}>
                      <Text >{this.state.friFrom}</Text>
                    </TouchableHighlight>
                    <Text style={{margin:5}}>to</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'friTo',isDateTimePickerVisible:true})

                        }}>
                      <Text >{this.state.friTo}</Text>
                    </TouchableHighlight>
                </View>

                <View style={{flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                   <Text style={styles.dayLabelStyle}>Saturday</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'satFrom',isDateTimePickerVisible:true})
                        }}>
                      <Text >{this.state.satFrom}</Text>
                    </TouchableHighlight>
                    <Text style={{margin:5}}>to</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'satTo',isDateTimePickerVisible:true})

                        }}>
                      <Text >{this.state.satTo}</Text>
                    </TouchableHighlight>
                </View>

                <View style={{flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                   <Text style={styles.dayLabelStyle}>Sunday</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'sunFrom',isDateTimePickerVisible:true})
                        }}>
                      <Text >{this.state.sunFrom}</Text>
                    </TouchableHighlight>
                    <Text style={{margin:5}}>to</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'sunTo',isDateTimePickerVisible:true})

                        }}>
                      <Text >{this.state.sunTo}</Text>
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



const styles = StyleSheet.create({
  dayLabelStyle: {
          width: 80,
          margin:5,
          fontSize:14
  },

});