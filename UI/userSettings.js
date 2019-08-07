import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert, TextInput,
Picker, ScrollView,TouchableHighlight, BackHandler, Dimensions} from 'react-native';
import DateTimePicker from "react-native-modal-datetime-picker";
import logger from '../controllers/logger';
import * as RNFS from 'react-native-fs';
import commonStyle from './Style'
import utilities from '../controllers/utilities';
import {USER_SETTINGS_FILE_PATH} from '../controllers/constants'
import WifiManager from 'react-native-wifi';
const codeFileName="userSettings.js"


export class UserSettingsEntity
{

    settings = {
            homeWifi:'',
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
            sunTo:'00:00'
          };
    constructor()
    {
        this.loadSettingsFile();
    }

    loadSettingsFile()
    {
        RNFS.exists(USER_SETTINGS_FILE_PATH)
            .then( (exists) =>
            {
                if (exists)
                {
                    RNFS.readFile(USER_SETTINGS_FILE_PATH)
                        .then((_fileContent) => {

                            logger.info(codeFileName, 'loadSettingsFile', 'Successfully read file:'+_fileContent);
                            _userSettingsData = JSON.parse(_fileContent);
                            this.settings = {
                                                  homeWifi: _userSettingsData.homeWifi,
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
                                                  sunTo: _userSettingsData.sunTo
                                             };
                        })
                        .catch( (error)=>{
                            logger.error(`${codeFileName}`, 'constructor', 'Failed to read file:'+error.message);
                          })
                }
                else
                {
                    logger.info(`${codeFileName}`, 'constructor', 'User settings file does not exist to read file.');
                }
            })
             .catch( (error)=>{
                        logger.error(`${codeFileName}`, 'constructor', 'Failed to check if file exists:'+error.message);
              })
    }

     getFromHour(day)
        {
            //return min+hour*60
            time = null;
            switch (day)
            {
              case 0:
                time = this.settings.sunFrom;
                break;
              case 1:
                time = this.settings.mondayFrom;
                break;
              case 2:
                time = this.settings.tuesdayFrom;
                break;
              case 3:
                time = this.settings.wedFrom;
                break;
              case 4:
                time = this.settings.thFrom;
                break;
              case 5:
                time = this.settings.friFrom;
                break;
              case 6:
                time = this.settings.satFrom;
                break;
            }

            //Alert.alert(time,time.split(':')[0])
            hr = time.split(':')[0]
            min = time.split(':')[1]
            return  Number(min)+Number(hr)*60;
        }

        getToHour(day)
        {
            //return min+hour*60
            time = null;
            switch (day)
            {
              case 0:
                time = this.settings.sunTo;
                break;
              case 1:
                time = this.settings.mondayTo;
                break;
              case 2:
                time = this.settings.tuesdayTo;
                break;
              case 3:
                time = this.settings.wedTo;
                break;
              case 4:
                time = this.settings.thTo;
                break;
              case 5:
                time = this.settings.friTo;
                break;
              case 6:
                time = this.settings.satTo;
                break;
            }

            hr = time.split(':')[0]
            min = time.split(':')[1]
            return  Number(min)+Number(hr)*60;
        }
}

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
        isDateTimePickerVisible:false,
        stateSaved: true,
        afterTimeSelected:true, //indicates if the 'after' or 'before' time was selected
        afterTime: '00:00',
        beforeTime:'00:00',
      };

      this.loadSettings();


    }

    componentDidMount()
    {
        logger.info(codeFileName, 'componentDidMount', 'Setting event handlers.');
        this.props.navigation.setParams({ backHandler: this.handleBackNavigation.bind(this)});
        this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
          BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        );

        this._didFocusSubscription = this.props.navigation.addListener('didFocus', payload =>
                    BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
                  );

    //this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackNavigation.bind(this));

    }

    componentWillUnmount()
    {
        logger.info(codeFileName, 'componentDidMount', 'Removing event handlers.')
        this._didFocusSubscription && this._didFocusSubscription.remove();
        this._willBlurSubscription && this._willBlurSubscription.remove();
// this.backHandler.remove();
    }

    onBackButtonPressAndroid = () =>
    {
        this.handleBackNavigation();
        return true;
    }

   async getHomeWiFi()
   {

      try
      {
          const _ssid = await WifiManager.getCurrentWifiSSID();
          if((_ssid.length>0)  && (_ssid != '<unknown ssid>'))
          {
              logger.info(codeFileName, 'getHomeWiFi', `Connected WiFi:${_ssid}. Asking if this the is Home WiFi.`);
              Alert.alert(
              'Home WiFi',
                'We will only send surveys when you are connected to the home WiFi.\nIs "'+_ssid+'" your home wifi?',
                [
                  { text: 'NO', onPress: () => {
                        Alert.alert("We'll try to ask again, when you connect to another network");
                        logger.info(codeFileName, 'getHomeWiFi', 'Not connected to home WiFi. Will ask again');
                  }},
                  {
                    text: 'YES', onPress: () => {
                        logger.info(codeFileName, 'getHomeWiFi', 'Connected to home WiFi. Saving home WiFi:'+_ssid);
                        this.setState({homeWifi: _ssid}, ()=>this.saveSettings());
                  }},
                ],
                {cancelable: false}
              );
          }
          else
          {
            logger.info(codeFileName, 'getHomeWiFi', 'WiFi is not enabled or connected. Will check again later.')
            Alert.alert("Home WiFi", 'We will only send surveys when you are connected to your home WiFi.'+
                                     ' We wil ask about it again when you are connected to WiFi.');
          }
      }
      catch(error)
      {
        logger.error(codeFileName, 'getHomeWiFi', 'Failed to get WiFi information:'+error);
      }
   }

   async loadSettings()
   {
        if (await RNFS.exists(USER_SETTINGS_FILE_PATH))
        {
            RNFS.readFile(USER_SETTINGS_FILE_PATH)
                .then((_fileContent) => {

                    logger.info(`${codeFileName}`, 'loadSettings', 'Successfully read file.');
                    _userSettingsData = JSON.parse(_fileContent);
                    this.setState({
                                    homeWifi: _userSettingsData.homeWifi,
                                    afterTime: _userSettingsData.afterTime,
                                    beforeTime: _userSettingsData.beforeTime
                                  }, () => {
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
            this.saveSettings(); //save the default settings
            this.getHomeWiFi();
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
                     onPress={() => {
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
    </View>

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