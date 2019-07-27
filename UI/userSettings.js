import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert, TextInput,
Picker, ScrollView,TouchableHighlight, BackHandler} from 'react-native';
import DateTimePicker from "react-native-modal-datetime-picker";
import logger from '../controllers/logger';
import * as RNFS from 'react-native-fs';
import commonStyle from './Style'
import wifi from 'react-native-android-wifi';
import utilities from '../controllers/utilities';


const codeFileName="userSettings.js"
const userSettingsFile= RNFS.DocumentDirectoryPath+'/usersettings.js';

export default class UserSettingsScreen extends React.Component {

static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;

    return{
        title: 'Settings',
        headerLeft: <Button title='<'  onPress={() => {params.backHandler();}}/>
    };
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
        isDateTimePickerVisible:false,
        stateSaved: true
      };

      this.loadSettings(userSettingsFile);

      this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
            BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
          );
    }

    componentDidMount()
    {
        this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
          BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        );
    }

    onBackButtonPressAndroid = () =>
    {
        this.handleBackNavigation();
        return true;
    };


   interval=null;
   getHomeWiFi = ()=>
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
                        'We will only send surveys when you are connected to the home WiFi. Is "'+ssid+'" your home wifi?',
                        [
                          {text: 'NO', onPress: () => {
                                Alert.alert("We'll try to ask again, when you connect to another network");
                            }},
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

   async loadSettings(filePath)
   {
        if (await RNFS.exists(filePath))
        {
            RNFS.readFile(filePath)
                .then((_fileContent) => {

                    logger.info(`${codeFileName}`, 'loadSettings', 'Successfully read file.');
                    _userSettingsData = JSON.parse(_fileContent);
                    this.setState({homeWifi: _userSettingsData.homeWifi,
                                  currentWifi: _userSettingsData.homeWifi,
                                  isDateTimePickerVisible: false,
                                  askWifi: false,
                                  mondayFrom: _userSettingsData.mondayFrom,
                                  mondayTo: _userSettingsData.mondayTo,
                                  tuesdayFrom: _userSettingsData.tuesdayFrom,
                                  tuesdayTo: _userSettingsData.tuesdayTo,
                                  wedFrom: _userSettingsData.wedFrom,
                                  wedTo: _userSettingsData.wedTo,
                                  thFrom: _userSettingsData.thFrom,
                                  thTo: _userSettingsData.thTo,
                                  friFrom: _userSettingsData.friFrom,
                                  friTo: _userSettingsData.friTo,
                                  satFrom: _userSettingsData.satFrom,
                                  satTo: _userSettingsData.satTo,
                                  sunFrom: _userSettingsData.sunFrom,
                                  sunTo: _userSettingsData.sunTo}, () => {
                                        if(this.state.homeWifi.length==0)
                                        {
                                            this.getHomeWiFi();
                                        }
                                    });
                })
                .catch( (error)=>{
                    logger.error(`${codeFileName}`, 'loadSettings', 'Failed to read file:'+error.message);
                  })

        }
        else
        {
            this.getHomeWiFi();
        }

   }
  componentDidMount()
  {
    this.props.navigation.setParams({ backHandler: this.handleBackNavigation.bind(this)});
  }

  handleBackNavigation()
  {
    if(!this.state.stateSaved)
    {
        logger.info(codeFileName, 'handleBackNavigation', "Back button pressed, asking to save settings.");
        Alert.alert(
          'Do you want to save changes?',
            '',
            [
              {text: 'NO', onPress: () =>
                {
                    logger.info(codeFileName, 'handleBackNavigation', "Declined to save settings, going to previous page.");
                    this.props.navigation.goBack(null);
                }},
              {text: 'YES', onPress: () =>
                {
                    logger.info(codeFileName, 'handleBackNavigation', "Agreed to save settings, saving and then going to previous page.");
                    this.saveSettings();
                    this.props.navigation.goBack(null);
                }},
            ]
          );
    }
    else
    {
        logger.info(codeFileName, 'handleBackNavigation', "Back button pressed, nothing to save, going to previous page.");
        this.props.navigation.goBack(null);
    }
  }


  handleDatePicked = (time) =>
  {
    if(this.state.currentDay=='mondayFrom')
    {
        this.setState({mondayFrom: time.getHours()+":"+time.getMinutes(),
            tuesdayFrom: time.getHours()+":"+time.getMinutes() });
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

    this.setState({isDateTimePickerVisible:false, stateSaved:false});

  }

  hideDateTimePicker = () => {
      this.setState({ isDateTimePickerVisible: false });
    };

  saveSettings()
  {
    _settings={
        homeWifi: this.state.homeWifi,
        mondayFrom: this.state.mondayFrom,
        mondayTo: this.state.mondayTo,
        tuesdayFrom: this.state.tuesdayFrom,
        tuesdayTo: this.state.tuesdayTo,
        wedFrom: this.state.wedFrom,
        wedTo: this.state.wedTo,
        thFrom: this.state.thFrom,
        thTo: this.state.thTo,
        friFrom: this.state.friFrom,
        friTo: this.state.friTo,
        satFrom: this.state.satFrom,
        satTo: this.state.satTo,
        sunFrom: this.state.sunFrom,
        sunTo: this.state.sunTo
    }

    utilities.writeJSONFile(_settings, userSettingsFile, codeFileName, 'saveSettings');

    Alert.alert("Settings saved!");
  }

  render() {

    return (

       <View style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                backgroundColor:'lavender',
                margin:5
            }}>

            <Text style={{margin:5, fontSize:20}}>
                If there is specific time of the day you do not want to receive surveys,
                while connected to the home WiFi, please indicate it below.
            </Text>


            <View style={{flex:1, flexDirection:'column', margin:10, justifyContent: 'space-around', alignItems:'flex-start'}}>
                <View style={{flex:1, flexDirection:'row', justifyContent:'space-around', alignItems:'center'}}>
                   <Text style={styles.dayLabelStyle}>Monday</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5,}}
                        onPress= {() => {
                              this.setState({currentDay:'mondayFrom',isDateTimePickerVisible:true})
                        }}>
                      <Text style={styles.timeBoxStyle}>{this.state.mondayFrom}</Text>
                    </TouchableHighlight>
                    <Text style={{margin:5}}>to</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'mondayTo',isDateTimePickerVisible:true})
                        }}>
                      <Text style={styles.timeBoxStyle}>{this.state.mondayTo}</Text>
                    </TouchableHighlight>
                </View>

                <View style={{flex:1, flexDirection:'row', justifyContent:'space-around', alignItems:'center'}}>
                   <Text style={styles.dayLabelStyle}>Tuesday</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'tuesdayFrom',isDateTimePickerVisible:true})
                        }}>
                      <Text style={styles.timeBoxStyle}>{this.state.tuesdayFrom}</Text>
                    </TouchableHighlight>
                    <Text style={{margin:5}}>to</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'tuesdayTo',isDateTimePickerVisible:true})

                        }}>
                      <Text style={styles.timeBoxStyle}>{this.state.tuesdayTo}</Text>
                    </TouchableHighlight>
                </View>

                <View style={{flex:1, flexDirection:'row', justifyContent:'space-around', alignItems:'center'}}>
                   <Text style={styles.dayLabelStyle}>Wednesday</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'wedFrom',isDateTimePickerVisible:true})
                        }}>
                      <Text style={styles.timeBoxStyle}>{this.state.wedFrom}</Text>
                    </TouchableHighlight>
                    <Text style={{margin:5}}>to</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'wedTo',isDateTimePickerVisible:true})

                        }}>
                      <Text style={styles.timeBoxStyle}>{this.state.wedTo}</Text>
                    </TouchableHighlight>
                </View>

                <View style={{flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                   <Text style={styles.dayLabelStyle}>Thursday</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'thFrom',isDateTimePickerVisible:true})
                        }}>
                      <Text style={styles.timeBoxStyle}>{this.state.thFrom}</Text>
                    </TouchableHighlight>
                    <Text style={{margin:5}}>to</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'thTo',isDateTimePickerVisible:true})

                        }}>
                      <Text style={styles.timeBoxStyle}>{this.state.thTo}</Text>
                    </TouchableHighlight>
                </View>

                <View style={{flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                   <Text style={styles.dayLabelStyle}>Friday</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'friFrom',isDateTimePickerVisible:true})
                        }}>
                      <Text style={styles.timeBoxStyle}>{this.state.friFrom}</Text>
                    </TouchableHighlight>
                    <Text style={{margin:5}}>to</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'friTo',isDateTimePickerVisible:true})

                        }}>
                      <Text style={styles.timeBoxStyle}>{this.state.friTo}</Text>
                    </TouchableHighlight>
                </View>

                <View style={{flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                   <Text style={styles.dayLabelStyle}>Saturday</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'satFrom',isDateTimePickerVisible:true})
                        }}>
                      <Text style={styles.timeBoxStyle}>{this.state.satFrom}</Text>
                    </TouchableHighlight>
                    <Text style={{margin:5}}>to</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'satTo',isDateTimePickerVisible:true})

                        }}>
                      <Text style={styles.timeBoxStyle}>{this.state.satTo}</Text>
                    </TouchableHighlight>
                </View>

                <View style={{flex:1, flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                   <Text style={styles.dayLabelStyle}>Sunday</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'sunFrom',isDateTimePickerVisible:true})
                        }}>
                      <Text style={styles.timeBoxStyle}>{this.state.sunFrom}</Text>
                    </TouchableHighlight>
                    <Text style={{margin:5}}>to</Text>
                    <TouchableHighlight style={{borderWidth:.5, padding:5}}
                        onPress= {() => {
                              this.setState({currentDay:'sunTo',isDateTimePickerVisible:true})

                        }}>
                      <Text style={styles.timeBoxStyle}>{this.state.sunTo}</Text>
                    </TouchableHighlight>
                </View>

            </View>

            <TouchableHighlight style ={[commonStyle.buttonTouchHLStyle]}>
                 <Button title="Save settings"
                     color="#20B2AA"
                     onPress={() => {this.saveSettings(); this.setState({stateSaved:true})}}
                 />
             </TouchableHighlight>


         <DateTimePicker
                 isVisible={this.state.isDateTimePickerVisible}
                 onConfirm={this.handleDatePicked}
                 onCancel={this.hideDateTimePicker}
                 mode='time'
               />
       </View>

    );
  }
}



const styles = StyleSheet.create({
  dayLabelStyle: {
          width: 80,
          margin:5,
          fontSize:14
  },
  timeBoxStyle:{
    width:40,
    fontSize:14,
    textAlign: 'center'
  },

});