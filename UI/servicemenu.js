import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, TextInput, Alert} from 'react-native';


export default class ServiceMenuScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = { conversationTopic: '', height:50 };
  }


  render() {
    return (
      //<View style={{ flex: 1, alignItems: 'top', justifyContent: 'center' }}>
      <View style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'stretch',
        }}>
        <Text style={styles.longtextstyle}>
          Imagine an always-listening voice assistant called Mimi 
          recorded an audio when you were talking. Please select all 
          services that are relevant to this 
          audio recording that could provide to you. 
          You can also add new services. 
        </Text>
        
        <Text> Text222</Text>
        <Text> Text3</Text>
        
      </View>


    );
  }
}

const styles = StyleSheet.create({
        longtextstyle: {
                color: 'black',
                fontFamily:'Times New Roman',
                //fontWeight: 'bold',
                fontSize: 16,
                borderColor: 'black',
                paddingRight:30,
                paddingLeft:30,
                paddingTop:20
                //paddingBottom:
                //borderWidth: 1
        }
});