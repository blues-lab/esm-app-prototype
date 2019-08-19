import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert, TextInput,
        Picker, ScrollView,TouchableHighlight, BackHandler, Dimensions,
        PermissionsAndroid} from 'react-native';
import DateTimePicker from "react-native-modal-datetime-picker";
import logger from '../controllers/logger';
import * as RNFS from 'react-native-fs';
import commonStyle from './Style'
import utilities from '../controllers/utilities';
import {LOG_FILE_PATH,USER_SETTINGS_FILE_PATH,WIFI_PERMISSION_MSG} from '../controllers/constants';
const codeFileName="userSettings.js";
import Dialog from 'react-native-dialog';
import Permissions from 'react-native-permissions';
import { NetworkInfo } from "react-native-network-info";
//if (Platform.OS == 'android') {
//    wifi = require('react-native-android-wifi');
//}

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
                    'Is "'+_ssid+'" your home wifi?',
                    [
                      { text: 'NO', onPress: () => {
                            Alert.alert("Home WiFi","We'll try to ask again, when you connect to another network.");
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
                Alert.alert("Home WiFi", 'We will only send surveys when you are connected to your home WiFi.'+
                                         ' We will ask about it again when you are connected to WiFi.');
              }
          }
          catch(error)
          {
            logger.error(codeFileName, 'getHomeSSID', 'Failed to get WiFi information:'+error);
          }
    }


   async getHomeWiFi()
   {
//        if(Platform.OS=='android')
//        {
//            if(this.state.askWifi)
//            {
//                await this.promisedSetState({wifiPermissionDialogVisible: true});
//            }
//            else
//            {
//                await this.getHomeWiFiAndroid();
//            }
//        }
//        else if(Platform.OS =='ios')
//        {
//            Permissions.check('location').then(response => {
//                  // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
//                  this.setState({photoPermission: response});
//                });
//        }

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

//            Alert.alert(
//              'Alert Title',
//              'My Alert Msg',
//              [
//                {text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
//                {
//                  text: 'Cancel',
//                  onPress: () => {logger.info(codeFileName,'abc','canceled');console.log('Cancel Pressed');},
//                  style: 'cancel',
//                },
//                {text: 'OK', onPress: () => console.log('OK Pressed')},
//              ],
//              {cancelable: false},
//            );
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
          'Do you want to save changes?',
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
                           <Text style={{marginBottom:10, paddingBottom:10}}> Your home WiFi: </Text>
                               <Text style={{color:'blue', fontSize:20, margin:0, textDecorationLine:'underline'}} onPress={this.changeWifi}>
                                 {this.state.homeWifi}
                               </Text>
                               <Text>{"\n"}</Text>
                       </Text>
            }



            <Text style={{color:'black', margin:10, fontSize:20,textAlign: 'center'}}>
                If there is specific time of the day you do not want to receive surveys,
                while connected to the home WiFi, please indicate it below.
            </Text>

            <Text style={{ margin:10, fontSize:18,textAlign: 'center'}}>
                Do not show notifications after
            </Text>
            <TouchableHighlight style={{borderWidth:.5, padding:5}}
                onPress= {() => {
                      this.setState({afterTimeSelected:true,isDateTimePickerVisible:true})
                }}>
              <Text style={styles.timeBoxStyle}>{this.state.afterTime}</Text>
            </TouchableHighlight>
            <Text style={{ margin:10, fontSize:18,textAlign: 'center'}}>
                            And before
            </Text>
            <TouchableHighlight style={{borderWidth:.5, padding:5}}
                onPress= {() => {
                      this.setState({afterTimeSelected:false,isDateTimePickerVisible:true})
                }}>
              <Text style={styles.timeBoxStyle}>{this.state.beforeTime}</Text>
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
                                Alert.alert("Thank you!","Your settings have been saved. We will prompt you when a new survey becomes available.");

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
             <Button title="Show log" onPress={async() => {
                try
                {
                    const _fileContent = await RNFS.readFile(LOG_FILE_PATH);
                    Alert.alert("Log", _fileContent);
                }
                catch(error)
                {
                    Alert.alert("Error reading log file.", error.message);
                }

             }}/>
    </View>

         <DateTimePicker
                 isVisible={this.state.isDateTimePickerVisible}
                 onConfirm={this.handleDatePicked}
                 onCancel={this.hideDateTimePicker}
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
                                 logger.info(codeFileName, 'LocationPermissionDialog', 'Location permission granted. Asking home wifi name.');
//                                 if(Platform.OS=='android')
//                                 {
//                                    await this.getHomeWiFiAndroid();
//                                 }
                                  await this.getHomeSSID();
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
    width:60,
    height:20,
    fontSize:18,
    textAlign: 'center'
  },

});