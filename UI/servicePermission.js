import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, 
  TextInput, Alert, FlatList, Modal, ScrollView, TouchableHighlight} from 'react-native';
import * as RNFS from 'react-native-fs';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';

import DialogInput from 'react-native-dialog-input';

const serviceFileAsset= 'services.js';
const serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';

import commonStyle from './Style'


 var radioOptions = [
    {label: 'Yes, I will allow access to any relevant parts of the conversation', value: 0 },
    {label: 'I will only allow access if I could censor certain parts of the relevant conversation', value: 1 },
    {label: 'No, I will not allow access to any relevant parts of the conversation', value:2}
  ];


export default class ServicePermissionScreen extends React.Component {

  state={serviceName:"NO-SERVICE", selectedValue:0, notAtAllSelected:false, partsSelected:false}


  constructor(props) 
  {
    super(props);
  }

  componentDidMount()
  {
    const { navigation } = this.props;
    const serviceName = navigation.getParam('serviceName', 'NO-SERVICE');
    this.setState({serviceName: serviceName});
  }

  selectionChanged(value)
  {
    if(value==0)
    {
        this.setState({partsSelected:false, notAtAllSelected:false})
    }
    if(value==1)
    {
        this.setState({partsSelected:true, notAtAllSelected:false})
    }
    if(value==2)
    {
        this.setState({notAtAllSelected:true, partsSelected:false})
    }
  }

  render() {
    return (

    <ScrollView>
      <View style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginRight:10,
          marginLeft:10,
          backgroundColor:'lightcyan',
          }}>

          <Text style={commonStyle.questionStyle}>
            Would you allow MiMi to access the relevant parts of
            the conversation to provide you the service {this.state.serviceName}?
          </Text>
          <RadioForm style={commonStyle.radioFrameStyle}
              radio_props={radioOptions}
              initial={0}
              onPress={(value) => this.selectionChanged(value)}
          />

          { this.state.partsSelected &&
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={commonStyle.questionStyle}>
                    What parts would you not allow the device to access?
                </Text>
                <TextInput multiline={true} numberOfLines={4} style={commonStyle.inputStyle}
                    onChangeText={(text) => this.setState({ conversationTopic: text })}
                    value={this.state.conversationTopic}
                />

                <Text style={commonStyle.questionStyle}>
                    Why would you not allow the device to access these parts?
                </Text>
                 <TextInput multiline={true} numberOfLines={4} style={commonStyle.inputStyle}
                    onChangeText={(text) => this.setState({ conversationTopic: text })}
                    value={this.state.conversationTopic}
                />
            </View>
          }

          { this.state.notAtAllSelected &&
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={commonStyle.questionStyle}>
                    Why would you not allow to access the relevant conversation?
                </Text>
                <TextInput multiline={true} numberOfLines={4} style={commonStyle.inputStyle}
                    onChangeText={(text) => this.setState({ conversationTopic: text })}
                    value={this.state.conversationTopic}
                />
            </View>
          }
      </View>

      <View style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight:10,
                    marginLeft:10,
                    backgroundColor:'lightcyan',
                    }}>
          <TouchableHighlight style ={{
                                height: 40,
                                width:160,
                                borderRadius:10,
                                marginLeft:5,
                                marginRight:5,
                                marginTop:10,
                                marginBottom:10
                              }}>
            <Button
              onPress={() => this.props.navigation.navigate('ContextualQuestion')}
              title="Next"
              color="#20B2AA"
              accessibilityLabel="Next"
            />
          </TouchableHighlight>
      </View>

    </ScrollView>

    );
  }
}

const styles = StyleSheet.create({

});