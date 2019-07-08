import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, TextInput, Alert,
    BackHandler, TouchableHighlight, Dimensions} from 'react-native';


import ServiceMenuScreen from './servicemenu'
import commonStyles from './Style'

export default class SurveyStartScreen extends React.Component {

  _didFocusSubscription;
  _willBlurSubscription;


  static navigationOptions = {
    title: 'Start survey',
    headerLeft: null
  };

  constructor(props) {
    super(props);
    this.state = { conversationTopic: '' };

    this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
          BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        );
  }

  componentDidMount() {
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

                    <View style={commonStyles.buttonViewStyle}>
                        <TouchableHighlight style ={commonStyles.buttonTouchHLStyle}>
                            <Button title="Save"
                                color="#20B2AA"
                                onPress={() => {
                                    if(this.state.conversationTopic.length==0)
                                    {
                                        Alert.alert("Please insert conversation topic to contnue.")
                                    }
                                    else
                                    {
                                        this.props.navigation.navigate('ServiceMenu')}
                                    }
                                }
                            />
                        </TouchableHighlight>
                    </View>
                    <Button
                          title="Prefer not to answer"
                          color="#D8BFD8"
                          onPress={() => this.props.navigation.navigate('ServiceMenu')}
                    />
          </View>

      </View>
    );
  }
}
