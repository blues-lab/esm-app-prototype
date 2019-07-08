import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, 
  TextInput, Alert, FlatList, Modal, ScrollView, TouchableHighlight} from 'react-native';
import * as RNFS from 'react-native-fs';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';

import DialogInput from 'react-native-dialog-input';

const serviceFileAsset= 'services.js';
const serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';

import commonStyle from './Style'


const fullShare= 0;
const partialShare= 1;
const noShare = 2;

 var radioOptions = [
    {label: 'Yes, I will allow access to any relevant parts of the conversation', value: fullShare },
    {label: 'I will only allow access if I could censor certain parts of the relevant conversation', value: partialShare },
    {label: 'No, I will not allow access to any relevant parts of the conversation', value: noShare}
  ];

export default class ServicePermissionScreen extends React.Component {

  state= {  serviceName:"NO-SERVICE",
            sharingDecision:fullShare,
            whyNoShare: '',
            whyPartShare: '',
            partsToRedact:''
         }


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


  saveResponse()
  {
       _permissionResponse= {
          "Sharing": this.state.sharingDecision,
          "PartsToRedact": this.state.partsToRedact,
          "WhyPartShare": this.state.whyPartShare,
          "WhyNoShare": this.state.whyNoShare,
       }
       Alert.alert(JSON.stringify(_permissionResponse));
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
              onPress={(value) => {
                    this.setState({sharingDecision:value});
                }
              }
          />

          { (this.state.sharingDecision == partialShare) &&
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={commonStyle.questionStyle}>
                    What parts would you not allow the device to access?
                </Text>
                <TextInput multiline={true} numberOfLines={4} style={commonStyle.inputStyle}
                    onChangeText={(text) => this.setState({ partsToRedact: text })}
                    value={this.state.partsToRedact}
                />

                <Text style={commonStyle.questionStyle}>
                    Why would you not allow the device to access these parts?
                </Text>
                 <TextInput multiline={true} numberOfLines={4} style={commonStyle.inputStyle}
                    onChangeText={(text) => this.setState({ whyPartShare: text })}
                    value={this.state.whyPartShare}
                />
            </View>
          }

          { (this.state.sharingDecision == noShare) &&
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={commonStyle.questionStyle}>
                    Why would you not allow to access the relevant conversation?
                </Text>
                <TextInput multiline={true} numberOfLines={4} style={commonStyle.inputStyle}
                    onChangeText={(text) => this.setState({ whyNoShare: text })}
                    value={this.state.whyNoShare}
                />
            </View>
          }
      </View>

      <View style={commonStyle.buttonViewStyle}>
          <TouchableHighlight style ={commonStyle.buttonTouchHLStyle}>
            <Button
              onPress={() => {
                    this.saveResponse();
                    this.props.navigation.navigate('ContextualQuestion');
                }
              }
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