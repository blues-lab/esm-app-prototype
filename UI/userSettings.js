import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert, TextInput,
        Picker, ScrollView,TouchableHighlight, BackHandler, Dimensions,
        PermissionsAndroid} from 'react-native';
import DateTimePicker from "react-native-modal-datetime-picker";
import logger from '../controllers/logger';
import * as RNFS from 'react-native-fs';
import commonStyle from './Style'
import utilities from '../controllers/utilities';
import {USER_SETTINGS_FILE_PATH} from '../controllers/constants';
import {WIFI_PERMISSION_MSG, DONT_DISTURB, HOME_WIFI_NOT_CONNECTED, HOME_WIFI_PROMPT, NOT_HOME_WIFI, SAVE_CHANGES_PROMPT} from '../controllers/strings';
const codeFileName="userSettings.js";
import Dialog from 'react-native-dialog';
import Permissions from 'react-native-permissions';
import { NetworkInfo } from "react-native-network-info";
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import {uploadFiles} from '../controllers/backgroundJobs';

export default class UserSettingsScreen extends React.Component {

static navigationOptions = ({ navigation }) => {
    return {
      title: 'Settings',
      headerLeft: (
        <TouchableHighlight>
            <Button title='<' onPress={navigation.getParam('backHandler')}> </Button>
        </TouchableHighlight>
      )
    };
  };


    constructor(props) {
      super(props);

      this.state = {
        homeWifi:'',
        askWifi:true,
        isDateTimePickerVisible:false,
        stateSaved: true,
        afterTimeSelected:true, //indicates if the 'after' or 'before' time was selected
        afterTime: '00:00',
        beforeTime:'00:00',
        backCallBack: null, // a callback function sent by Home screen
        wifiPermissionDialogVisible:false,
      };

}

    async componentDidMount()
    {
        logger.info(codeFileName, 'componentDidMount', 'Setting event handlers.');

        await this.promisedSetState({backCallBack:this.props.navigation.getParam('backCallBack', null)});

        this.props.navigation.setParams({ backHandler: this.handleBackNavigation.bind(this)});

        if (Platform.OS == "android")
        {
            BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid.bind(this));
        }

        this.loadSettings();
    }

    componentWillUnmount()
    {
        logger.info(codeFileName, 'componentWillUnmount', 'Removing event handlers.');
        if(Platform.OS == 'android')
        {
            BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid);
        }
    }

    onBackButtonPressAndroid = () =>
    {
        this.handleBackNavigation();
        return true;
    }

    async getHomeSSID()
    {
          try
          {
              const _ssid = await NetworkInfo.getSSID();
              logger.info(codeFileName, 'getHomeSSID', 'SSID:'+_ssid);
              if( (_ssid!=null) &&  (_ssid.length>0)  && (_ssid != '<unknown ssid>'))
              {
                  logger.info(codeFileName, 'getHomeSSID', `Connected WiFi:${_ssid}. Asking if this the is Home WiFi.`);
                  Alert.alert(
                  'Home WiFi',
                    HOME_WIFI_PROMPT(_ssid),
                    [
                      { text: 'NO', onPress: () => {
                            Alert.alert("Home WiFi", NOT_HOME_WIFI);
                            logger.info(codeFileName, 'getHomeSSID', 'Not connected to home WiFi. Will ask again.');
                      }},
                      {
                        text: 'YES', onPress: () => {
                            logger.info(codeFileName, 'getHomeSSID', 'Connected to home WiFi. Saving home WiFi:'+_ssid);
                            this.setState({homeWifi: _ssid}, ()=>this.saveSettings());
                      }},
                    ],
                    {cancelable: false}
                  );
              }
              else
              {
                logger.info(codeFileName, 'getHomeSSID', 'WiFi is not enabled or connected. Will check again later.')
                Alert.alert("Home WiFi", HOME_WIFI_NOT_CONNECTED);
              }
          }
          catch(error)
          {
            logger.error(codeFileName, 'getHomeSSID', 'Failed to get WiFi information:'+error);
          }
    }


   async getHomeWiFi()
   {
        logger.info(codeFileName, 'getHomeWiFi', 'Checking if location permission is already granted.');
        const _response = await Permissions.check('location');// ['authorized', 'denied', 'restricted', or 'undetermined']
        if(_response == 'authorized')
        {
            logger.info(codeFileName, 'getHomeWiFi', 'Location permission is already granted. Asking for home wifi name.');
            await this.getHomeSSID();
        }
        else
        {
            logger.info(codeFileName, 'getHomeWiFi', 'Location permission is not granted. Asking for permission.');
            await this.promisedSetState({wifiPermissionDialogVisible: true});
        }
   }

   promisedSetState = (newState) =>
     {
             return new Promise((resolve) =>
             {
                 this.setState(newState, () => {
                     resolve()
                 });
             });
     }

   async loadSettings()
   {
        if (await RNFS.exists(USER_SETTINGS_FILE_PATH))
        {
            const _fileContent = await RNFS.readFile(USER_SETTINGS_FILE_PATH);
            logger.info(`${codeFileName}`, 'loadSettings', 'Successfully loaded settings file.');
            const _userSettingsData = JSON.parse(_fileContent);
            await this.promisedSetState({
                            homeWifi: _userSettingsData.homeWifi,
                            afterTime: _userSettingsData.afterTime,
                            beforeTime: _userSettingsData.beforeTime,
                            askWifi: _userSettingsData.askWifi
                         });

            if(this.state.homeWifi.length==0)
            {
                logger.info(`${codeFileName}`, 'loadSettings', 'Home wifi is not set yet.');
                await this.getHomeWiFi();
            }
        }
        else
        {
            this.saveSettings(); //save the default settings
            await this.getHomeWiFi();
        }

   }

  handleBackNavigation()
  {
    if(!this.state.stateSaved)
    {
        logger.info(codeFileName, 'handleBackNavigation', "Back button pressed, asking to save settings.");
        Alert.alert(
            SAVE_CHANGES_PROMPT,
            '',
            [
              {text: 'NO', onPress: () =>
                {
                    logger.info(codeFileName, 'handleBackNavigation', "Declined to save settings, going to previous page.");
                    if(this.state.backCallBack!=null)
                    {
                        logger.info(codeFileName, 'handleBackNavigation', 'Calling backCallBack.')
                        this.state.backCallBack();
                    }

                    this.props.navigation.goBack(null);
                }},
              {text: 'YES', onPress: () =>
                {
                    logger.info(codeFileName, 'handleBackNavigation', "Agreed to save settings, saving and then going to previous page.");
                    this.saveSettings();
                    Alert.alert("Settings saved.",'',[{text: 'OK', onPress: () => this.props.navigation.goBack(null)}]);
                }},
            ]
          );
    }
    else
    {
        logger.info(codeFileName, 'handleBackNavigation', "Back button pressed, nothing to save, going to previous page.");
        if(this.state.backCallBack!=null)
        {
            logger.info(codeFileName, 'handleBackNavigation', 'Calling backCallBack.')
            this.state.backCallBack();
        }
        this.props.navigation.goBack(null);
    }

    return true;
  }


  handleDatePicked = (time) =>
  {
      const _hour = time.getHours()>9? time.getHours():"0"+time.getHours();
      const _min = time.getMinutes()>9? time.getMinutes(): "0"+time.getMinutes();

      if(this.state.afterTimeSelected)
      {
        this.setState({afterTime: _hour+":"+ _min});
      }
      else
      {
        this.setState({beforeTime: _hour+":"+_min});
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
            askWifi: this.state.askWifi,
            afterTime: this.state.afterTime,
            beforeTime: this.state.beforeTime,
        }
    utilities.writeJSONFile(_settings, USER_SETTINGS_FILE_PATH, codeFileName, 'saveSettings');

    logger.info(codeFileName, 'saveSettings', 'Saving settings:'+JSON.stringify(_settings))

  }

  changeWifi = ()=>
  {
    logger.info(codeFileName,'changeWifi', 'Setting current wifi to empty and getting new wifi info.')
    this.setState({homeWifi:''}, ()=>
        {
            this.saveSettings();
            this.getHomeWiFi();
        });

  }

  convertTime(time)
  {
    _hour = Number(time.split(":")[0])
    _min = time.split(":")[1]

    if(_hour==12)
    {
        return (_hour).toString()+":"+_min+" pm";
    }
    else if(_hour>=13)
    {
        return (_hour - 12).toString()+":"+_min+" pm";
    }
    else
    {
        return (_hour).toString()+":"+_min+" am";
    }
  }

  render() {

    return (

       <View style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                backgroundColor:'lavender'

            }}>

            {   this.state.homeWifi.length>0 &&
                       <Text style={{textAlign: 'center',borderBottomColor:'black', borderBottomWidth: StyleSheet.hairlineWidth, color:'black', marginTop:10, marginBottom:10, fontSize:20, width:Math.floor(Dimensions.get('window').width*.9)}}>
                           <Text style={{marginBottom:10, fontSize:16, paddingBottom:10}}> Your home WiFi: </Text>
                               <Text style={{fontSize:20, margin:0}}>
                                 {this.state.homeWifi}
                               </Text>
                               <Text>{"\n"}</Text>
                               <Text style={{color:'blue', fontSize:16, margin:0, textDecorationLine:'underline'}} onPress={this.changeWifi}>
                                Change
                               </Text>
                               <Text>{"\n"}</Text>
                       </Text>
            }



            <Text style={{color:'black', margin:10, fontSize:20,textAlign: 'center'}}>
                {DONT_DISTURB}
            </Text>

            <Text style={{ margin:10, fontSize:18,textAlign: 'center'}}>
                Do not show notifications after
            </Text>
            <TouchableHighlight style={{borderWidth:.5, padding:5}}
                onPress= {() => {
                      this.setState({afterTimeSelected:true,isDateTimePickerVisible:true})
                }}>
              <Text style={styles.timeBoxStyle}>{this.convertTime(this.state.afterTime)}</Text>
            </TouchableHighlight>
            <Text style={{ margin:10, fontSize:18,textAlign: 'center'}}>
                            And before
            </Text>
            <TouchableHighlight style={{borderWidth:.5, padding:5}}
                onPress= {() => {
                      this.setState({afterTimeSelected:false,isDateTimePickerVisible:true})
                }}>
              <Text style={styles.timeBoxStyle}>{this.convertTime(this.state.beforeTime)}</Text>
            </TouchableHighlight>








            { false &&
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
            }

            <View style={{flex:1, flexDirection:'row', justifyContent:'center', margin:10, paddingTop:30, width:Math.floor(Dimensions.get('window').width*.9),
                borderBottomColor:'black', borderTopWidth: StyleSheet.hairlineWidth}}>
            <TouchableHighlight style ={[commonStyle.buttonTouchHLStyle]}>
                 <Button title="Save settings"
                     color="#20B2AA"
                     onPress={async() => {
                            this.saveSettings();
                            this.setState({stateSaved:true});
                            const _firstLaunch = this.props.navigation.getParam('firstLaunch', false);
                            if(_firstLaunch)
                            {
                                Alert.alert(
                                  'Thank you!',
                                    "Your settings have been saved. We will prompt you when a new survey becomes available.",
                                    [
                                      { text: 'OK', onPress: () => {
                                        logger.info(codeFileName, 'SaveButtonClick', 'Settings saved. Since this is first launch exiting app.')
                                        BackHandler.exitApp();
                                      }}
                                    ],
                                    {cancelable: false}
                                  );
                            }
                            else
                            {
                                Alert.alert("Settings saved.");
                            }
                        }}
                 />
             </TouchableHighlight>
    </View>

         <DateTimePicker
                 isVisible={this.state.isDateTimePickerVisible}
                 onConfirm={this.handleDatePicked}
                 onCancel={this.hideDateTimePicker}
                 is24Hour={false}
                 mode='time'
               />

         <Dialog.Container visible={this.state.wifiPermissionDialogVisible}>
            <Dialog.Title>WiFi permission</Dialog.Title>
            <Dialog.Description>
                {WIFI_PERMISSION_MSG}
            </Dialog.Description>
            <Dialog.Button label="Cancel" onPress={ async () => {
                         logger.info(codeFileName, 'LocationPermissionDialog', 'Pressed cancel. Exiting app.');
                         await this.promisedSetState({wifiPermissionDialogVisible: false,});
                         BackHandler.exitApp();
                     }}
            />
            <Dialog.Button label="Allow" onPress={ async () => {
                            logger.info(codeFileName, 'LocationPermissionDialog', 'Pressed allow. Asking for actual permission.');
                            await this.promisedSetState({wifiPermissionDialogVisible: false,});
                            const response = await Permissions.request('location');
                              if(response != 'authorized')
                              {
                                logger.info(codeFileName, 'LocationPermissionDialog', 'Location permission denied. Exiting app.');
                                BackHandler.exitApp();
                              }
                              else
                              {
                                 logger.info(codeFileName, 'LocationPermissionDialog', 'Location permission granted. Checking if location sharing is enabled.');
                                 if(Platform.OS=='android')
                                 {

//                                     LocationServicesDialogBox.checkLocationServicesIsEnabled({
//                                         message: "<h2>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/><a href='#'>Learn more</a>",
//                                         ok: "YES",
//                                         cancel: "NO",
//                                         enableHighAccuracy: true, // true => GPS AND NETWORK PROVIDER, false => GPS OR NETWORK PROVIDER
//                                         showDialog: true, // false => Opens the Location access page directly
//                                         openLocationServices: true, // false => Directly catch method is called if location services are turned off
//                                         preventOutSideTouch: false, // true => To prevent the location services window from closing when it is clicked outside
//                                         preventBackClick: false, // true => To prevent the location services popup from closing when it is clicked back button
//                                         providerListener: false // true ==> Trigger locationProviderStatusChange listener when the location state changes
//                                     }).then(async function(success) {
//                                         // success => {alreadyEnabled: false, enabled: true, status: "enabled"}
//                                         logger.info(codeFileName, 'LocationPermissionDialog', 'Location sharing is:'+JSON.stringify(success)+'. Getting home wifi name.');
//                                         await this.getHomeSSID();
//                                     }).catch(async (error) => {
//                                         // error.message => "disabled"
//                                         await logger.error(codeFileName, 'LocationPermissionDialog', 'Error:'+error);
//                                         //send log data to the server
//                                         await uploadFiles();
//                                     });

                                       try
                                       {
                                            const _locationEnabled = await LocationServicesDialogBox.checkLocationServicesIsEnabled({
                                               message: "<h2>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/><a href='#'>Learn more</a>",
                                               ok: "YES",
                                               cancel: "NO",
                                               enableHighAccuracy: true, // true => GPS AND NETWORK PROVIDER, false => GPS OR NETWORK PROVIDER
                                               showDialog: false, // false => Opens the Location access page directly
                                               openLocationServices: true, // false => Directly catch method is called if location services are turned off
                                               preventOutSideTouch: false, // true => To prevent the location services window from closing when it is clicked outside
                                               preventBackClick: false, // true => To prevent the location services popup from closing when it is clicked back button
                                               providerListener: false // true ==> Trigger locationProviderStatusChange listener when the location state changes
                                           })
                                           if(_locationEnabled['status'] == 'enabled')
                                           {
                                               // success => {alreadyEnabled: false, enabled: true, status: "enabled"}
                                               logger.info(codeFileName, 'LocationPermissionDialog', 'Location sharing is '+JSON.stringify(_locationEnabled)+'. Getting home wifi name.');
                                               await this.getHomeSSID();
                                           }
                                           else
                                           {
                                               await logger.warn(codeFileName, 'LocationPermissionDialog', 'Location sharing was not enabled:'+JSON.stringify(_locationEnabled));
                                               //send log data to the server
                                               await uploadFiles();
                                           }
                                       }
                                       catch(error)
                                       {
                                           // error.message => "disabled"
                                           await logger.error(codeFileName, 'LocationPermissionDialog', 'Error: '+error.message);
                                           //send log data to the server
                                           await uploadFiles();
                                           await this.getHomeSSID();
                                       }
                                 }
                                 else
                                 {
                                    await this.getHomeSSID();
                                 }
                              }
                     }}
            />
         </Dialog.Container>
       </View>

    );
  }
}



const styles = StyleSheet.create({
  dayLabelStyle: {
          width: 80,
          fontSize:18,
          marginLeft:5,
          marginRight:5
  },
  timeBoxStyle:{
    width:80,
    height:25,
    fontSize:18,
    textAlign: 'center'
  },

});