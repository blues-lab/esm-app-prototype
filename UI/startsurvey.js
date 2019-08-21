import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, TextInput, Alert,
    BackHandler, TouchableHighlight, Dimensions, Modal} from 'react-native';
import { ProgressDialog } from 'react-native-simple-dialogs';
import logger from '../controllers/logger';
import ServiceMenuScreen from './servicemenu';
import commonStyles from './Style';
import appStatus from '../controllers/appStatus';
const codeFileName = 'startsurvey.js';
import ToolBar from './toolbar'
import utilities from '../controllers/utilities';

export default class SurveyStartScreen extends React.Component {

  _didFocusSubscription;
  _willBlurSubscription;

  static navigationOptions = {
    headerLeft: null,
    headerTitle: <ToolBar title="Conversation topic" progress={0}/>
  };

  constructor(props) {
    super(props);
    this.state = {  conversationTopic: '', noSurveyDialogVisible: false,
                    saveWaitVisible: false, //show progress dialog while saving survey response
                 };
  }

  componentDidMount()
  {
      if (Platform.OS == "android")
      {
          BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid.bind(this));
      }
  }

  onBackButtonPressAndroid = () => {
    //BackHandler.exitApp();
    return true; //make it true to prevent going back
  };

  componentWillUnmount() {
    if(Platform.OS == 'android')
    {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid);
    }
  }


  render() {
    return (
          <View style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'stretch',
              backgroundColor:'lavender',
              margin:5
            }}>

               <View style={{
                          flex: 1,
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>

                        <Text style={commonStyles.questionStyle}>
                          What were you talking about?
                        </Text>


                    <TextInput
                        multiline={true}
                        numberOfLines={4}
                        style={{
                                   backgroundColor:'white',
                                   height: 150,
                                   width: Math.round(Dimensions.get('window').width)-30,
                                   borderColor: 'gray',
                                   borderWidth: 1.5,
                                   margin:5,
                              }}
                        onChangeText={(text) =>
                                this.setState({ conversationTopic: text })
                        }
                        value={this.state.conversationTopic}
                    />

                    <Text style={{fontSize:14, fontStyle:'italic', margin:10}}>
                        Enter 'Prefer not to answer' to skip
                    </Text>

                    <View style={commonStyles.buttonViewStyle}>
                        <TouchableHighlight style ={commonStyles.buttonTouchHLStyle}>
                            <Button title="Next"
                                color="#20B2AA"
                                onPress={ async () => {
                                    if(this.state.conversationTopic.length==0)
                                    {
                                        Alert.alert("Error","Please enter conversation topic to continue.");
                                    }
                                    else
                                    {
                                        //upload partial survey response
                                        {
                                            this.setState({saveWaitVisible:true});
                                            const _appStatus  = await appStatus.loadStatus();
                                            logger.info(codeFileName, 'NextButtonPress', 'Uploading conversation topic and going to AlvaPrompt.');
                                            const _uploaded = utilities.uploadData(
                                                    {SurveyID: _appStatus.CurrentSurveyID,
                                                    Stage: 'Conversation topic.',
                                                    PartialResponse: this.state.conversationTopic},
                                                    _appStatus.UUID, 'PartialSurveyResponse', codeFileName, 'NextButtonPress');
//                                             if(!_uploaded)
//                                             {
//                                                logger.error(codeFileName, 'NextButtonPress',
//                                                `Failed to upload partial response. SurveyID:${_appStatus.CurrentSurveyID}. Stage:Conversation topic. Response: ${this.state.conversationTopic}`);
//                                             }

                                            this.setState({saveWaitVisible:false});
                                        }
                                        this.props.navigation.navigate('AlvaPrompt',
                                            {
                                                conversationTopic: this.state.conversationTopic,
                                                surveyProgress: 20
                                            }
                                        )}
                                    }
                                }
                            />
                        </TouchableHighlight>

                    </View>

                     <Modal visible = {this.state.noSurveyDialogVisible}>
                                <View style={{  flex: 1,
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                backgroundColor:'lavender',
                                                margin:1}}>
                                    <Text style={{margin:15, fontSize:20, borderBottomColor:'black', borderBottomWidth: StyleSheet.hairlineWidth, padding:5}}>
                                        Sorry, survey has expired!
                                    </Text>
                                    <Text style={{fontSize:16, margin:20, marginTop:10}}>
                                        Advertisement/reminder for MIMI and suggestion to come back later.
                                    </Text>
                                       <TouchableHighlight style ={[commonStyles.buttonTouchHLStyle]}>
                                          <Button title="I will come back later!"
                                              color="#20B2AA"
                                            onPress={() => {
                                              logger.info(`${codeFileName}`, "No survey modal", "Closing app");
                                              this.setState({noSurveyDialogVisible: false});
                                          }}/>
                                    </TouchableHighlight>
                                </View>
                               </Modal>
          </View>
              <ProgressDialog
                  visible={this.state.saveWaitVisible}
                  title="MiMi"
                  message="Saving response. Please, wait..."
              />
      </View>
    );
  }
}
