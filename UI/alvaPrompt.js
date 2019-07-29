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
  headerTitle: <ToolBar title="MIMI" progress={10}/>,
   // headerLeft: null
  };

  constructor(props) {
    super(props);
    this.state = { conversationTopic: '', noSurveyDialogVisible: false };
  }

   startNewSurvey = () => //Will be called if participants indicate recent conversation
   {
     //this.props.navigation.navigate('StartSurvey');
   }

   componentDidMount()
   {
        const { navigation } = this.props;
        const _topic = navigation.getParam('conversationTopic', '');
        this.setState({conversationTopic:_topic})
   }
  componentWillUnmount()
  {
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
                        <Text style={[commonStyles.longtextStyle,{fontSize:24, backgroundColor:'lavender'}]}>
                          <Text>Imagine an always-listening voice assistant, "Mimi," was able to offer you
                          services that were </Text>
                          <Text style={{fontWeight:'bold'}}>relevant </Text>
                          <Text>to your conversation.</Text>
                        </Text>
                    </View>

                    <View style={commonStyles.buttonViewStyle}>
                        <TouchableHighlight style ={commonStyles.buttonTouchHLStyle}>
                            <Button title="Next"
                                color="#20B2AA"
                                onPress={() => {
                                        this.props.navigation.navigate('ServiceMenu', {conversationTopic:this.state.conversationTopic});
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
