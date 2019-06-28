import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, TextInput, Alert} from 'react-native';


export default class ServiceMenuScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = { conversationTopic: '', height:50 };
  }


  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>multiline</Text>
        
        <TextInput                       
         multiline={true}
         value={this.state.conversationTopic}
         onChangeText={ editedText =>
             this.setState({ conversationTopic: editedText }) 
          }                            
          onContentSizeChange={(event) => 
            this.setState({ height:event.nativeEvent.contentSize.height})
          }
          style={
            { height: Math.min(120, Math.max(35, this.state.height)),  width: 300,
              borderColor: 'gray', borderWidth: 1}
          }                        
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
