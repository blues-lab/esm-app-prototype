import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, TextInput, Alert,
    BackHandler, TouchableHighlight, Dimensions, Modal} from 'react-native';

import logger from '../controllers/logger';
import ServiceMenuScreen from './servicemenu';
import commonStyles from './Style';

const codeFileName = 'startsurvey.js';
import ToolBar from './toolbar';


export default class AlvaPromptScreen extends React.Component {

  static navigationOptions = {
    title: 'Mimi',
    headerLeft: null,
    headerTitle: <ToolBar/>
  };

  constructor(props) {
    super(props);
    this.state = { conversationTopic: '', noSurveyDialogVisible: false };

    this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
          BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        );
  }

   startNewSurvey = () => //Will be called if participants indicate recent conversation
   {
     //this.props.navigation.navigate('StartSurvey');
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
                        <Text style={[commonStyles.longtextStyle,{fontSize:24}]}>
                          Imagine an always-listening voice assistant, "Mimi," was able to offer you
                          services that were relevant to your conversation. Please select all services
                          that are relevant to your most recent conversation. You can also add new services.

                        </Text>
                    </View>

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
                                        this.props.navigation.navigate('ServiceMenu')}
                                    }
                                }
                            />
                        </TouchableHighlight>

                    </View>

          </View>

      </View>
    );
  }
}
