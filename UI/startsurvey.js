import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, TextInput, Alert,
    BackHandler, TouchableHighlight, Dimensions, Modal} from 'react-native';

import logger from '../controllers/logger';
import ServiceMenuScreen from './servicemenu';
import commonStyles from './Style';

const codeFileName = 'startsurvey.js';
import ToolBar from './toolbar'


export default class SurveyStartScreen extends React.Component {

  _didFocusSubscription;
  _willBlurSubscription;

  static navigationOptions = {
    //headerLeft: null,
    headerTitle: <ToolBar title="Conversation topic" progress={0}/>
  };

  constructor(props) {
    super(props);
    this.state = { conversationTopic: '', noSurveyDialogVisible: false };

    this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
          BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        );
  }

  componentDidMount() {

      if(true)//check if survey is available from app settings
      {
            Alert.alert(
              'New survey!',
              'Have you had a conversation recently?',
              [
                {text: 'Yes', onPress: () => {
                    logger.info(`${codeFileName}`, "'Yes' to recent conversation", "Navigating to StartSurvey");
                    appStatus.setSurveyStatus("Started");
                    //this.props.navigation.navigate('StartSurvey');
                  }},
                {text: 'No', onPress: () => {
                      logger.info(`${codeFileName}`, "'No' to recent conversation", "Showing NoSurvey dialog.");

                      Alert.alert("Thank you!", "We will try again later.",
                        [
                            {text: 'OK', onPress:() => {BackHandler.exitApp()}}
                        ]
                      )
                      //this.setState({noSurveyDialogVisible: true});
                }}
              ],
              {cancelable: true},
            );
      }
      else
      {
          this.setState({noSurveyDialogVisible: true});
      }

        this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
      BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
  }

  onBackButtonPressAndroid = () => {
    return false; //make it true to prevent going back
  };

  componentWillUnmount() {
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
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

                    <View style={commonStyles.questionStyle}>
                        <Text style={[commonStyles.longtextStyle,{fontSize:28}]}>
                          What were you talking about?
                        </Text>
                    </View>


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

                    <Text style={{fontSize:12, fontStyle:'italic', margin:10}}>
                        Enter 'Prefer not to answer' to skip
                    </Text>

                    <View style={commonStyles.buttonViewStyle}>
                        <TouchableHighlight style ={commonStyles.buttonTouchHLStyle}>
                            <Button title="Next"
                                color="#20B2AA"
                                onPress={() => {
                                    if(this.state.conversationTopic.length==0)
                                    {
                                        Alert.alert("Please insert conversation topic to continue.")
                                    }
                                    else
                                    {
                                        this.props.navigation.navigate('AlvaPrompt', {conversationTopic: this.state.conversationTopic})}
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

      </View>
    );
  }
}
