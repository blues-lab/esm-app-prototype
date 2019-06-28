import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, TextInput, Alert} from 'react-native';


export default class SurveyStartScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = { conversationTopic: '' };
  }


  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>What were you talking about?</Text>
        <TextInput 
        multiline={true}
        numberOfLines={4}
        style={{height: 100, width: 200, borderColor: 'gray', borderWidth: 1}}
        onChangeText={(text) => 
          this.setState({ conversationTopic: text }) 

        }
        value={this.state.conversationTopic}
      />

      <Button
          title="Prefer not to answer"
          onPress={() => 
            //this.props.navigation.navigate('StartSurvey')
            Alert.alert(
              'Alert',
              'You entered:'+this.state.conversationTopic)
          }
        />
      </View>
    );
  }
}
