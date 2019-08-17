import React, {Component} from 'react';
import { Platform, StyleSheet, Text, View, Button,
        TextInput, Alert, FlatList, Modal, ScrollView,
        TouchableHighlight, BackHandler} from 'react-native';
import * as RNFS from 'react-native-fs';
//import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';
import { RadioButton } from 'react-native-paper';
import DialogInput from 'react-native-dialog-input';
import { ProgressDialog } from 'react-native-simple-dialogs';
import logger from '../controllers/logger';
import utilities from '../controllers/utilities';
const codeFileName="servicePermission.js";
const serviceFileAsset= 'services.js';
const serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';

import commonStyle from './Style'
import ToolBar from './toolbar'

const fullShare= 'fullShare';
const partialShare= 'partialShare';
const noShare = 'noShare';

 var radioOptions = [
    {label: 'Yes, I will allow access to any relevant parts of the conversation', value: fullShare },
    {label: 'I will only allow access if I could censor certain parts of the relevant conversation', value: partialShare },
    {label: 'No, I will not allow access to any relevant parts of the conversation', value: noShare}
  ];

export default class ServicePermissionScreen extends React.Component
{

// static navigationOptions = {
//      headerLeft: null,
//      headerTitle: <ToolBar title="Permission" progress={70}/>
//    };
static navigationOptions = ({ navigation }) => {
    return {
        headerLeft: null,
        headerTitle: <ToolBar title="Permission" progress={navigation.state.params.surveyProgress}/>,
    };
  };

  state= {
            services: null, //the service list sent from the serviceMenu page
            currentServiceIdx:0,
            sharingDecision:fullShare,
            whyNoShare: '',
            whyPartShare: '',
            partsToRedact:'',
            value: fullShare,
            permissionResponses:[],
            surveyResponseJS: null, // full survey response so far sent from the serviceMenu page
            saveWaitVisible: false,
         }


  constructor(props) 
  {
    super(props);
  }

  promisedSetState = (newState) =>
  {
        return new Promise((resolve) =>
        {
            this.setState(newState, () => {
                resolve()
            });
        });
  }

  async componentDidMount()
  {
      const { navigation } = this.props;
      const _services = navigation.getParam('services', null);
      const _surveyProgress = navigation.getParam('surveyProgress', 0);
      const _surveyResponseJS = navigation.getParam('surveyResponseJS', null);

    await this.promisedSetState({services: _services, surveyProgress: _surveyProgress,
                surveyResponseJS: _surveyResponseJS});
  }

  async saveResponse()
  {
        const _permissionResponse= {
                  "ServiceCategory": this.state.services[this.state.currentServiceIdx].categoryName,
                  "ServiceName": this.state.services[this.state.currentServiceIdx].serviceName,
                  "Sharing": this.state.value,
                  "PartsToRedact": this.state.partsToRedact,
                  "WhyPartShare": this.state.whyPartShare,
                  "WhyNoShare": this.state.whyNoShare,
               }

        _permissionResponses = this.state.permissionResponses;
        _permissionResponses.push(_permissionResponse);
        _surveyResponseJS = this.state.surveyResponseJS;
        _surveyResponseJS.PermissionResponses = _permissionResponses;

       const _nextServiceIdx = this.state.currentServiceIdx+1;
       if(_nextServiceIdx < this.state.services.length) //more services remaining
       {
            logger.info(codeFileName, 'saveResponse', 'Saving response and going to the next service.');
            const _surveyProgress = this.state.surveyProgress+Math.floor(40/this.state.services.length);
            await this.promisedSetState(
                {
                    surveyResponseJS: _surveyResponseJS,
                    currentServiceIdx: _nextServiceIdx,
                    surveyProgress: _surveyProgress,
                    whyNoShare: '',
                    whyPartShare: '',
                    partsToRedact:'',
                    value: fullShare,
                });
            this.props.navigation.setParams({surveyProgress: _surveyProgress});
       }
       else //no more service, save and upload permission responses
       {
              logger.info(codeFileName, 'saveResponse', 'Uploading partial response and going to ContextualQuestion page.');
              //upload partial survey response
                {
                    await this.promisedSetState({saveWaitVisible:true});
                    const _appStatus  = await appStatus.loadStatus();
                    const _uploaded = await utilities.uploadData(
                            {SurveyID: _appStatus.CurrentSurveyID,
                             Stage: 'Permission complete.',
                             PartialResponse: this.state.surveyResponseJS},
                            _appStatus.UUID, 'PartialSurveyResponse', codeFileName, 'saveResponse');
                     if(!_uploaded)
                     {
                        logger.error(codeFileName, 'saveResponse',
                        `Failed to upload partial response. SurveyID:${_appStatus.CurrentSurveyID}. Stage:Permission complete. Response: ${JSON.stringify(this.state.surveyResponseJS)}`);
                     }
                }

              //go to the contextual question page
              await this.promisedSetState({saveWaitVisible:false});
              this.props.navigation.navigate('ContextualQuestion',
                  {
                      surveyResponseJS: this.state.surveyResponseJS,
                      surveyProgress: 80
                  });
       }
  }

  render() {
    return (

    <ScrollView contentContainerStyle={{ backgroundColor:'lavender'}}>
      <View style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginRight:10,
          marginLeft:10,
          backgroundColor:'lavendar',
          }}>

          {   this.state.services!=null &&
              <Text style={[commonStyle.questionStyle,{fontSize:22}]}>
                Would you allow MiMi to access the relevant parts of
                the conversation to "{this.state.services[this.state.currentServiceIdx].serviceName.toLowerCase()}"?
              </Text>
          }
          {   this.state.services!=null &&
              <View style={{flex:1, flexDirection:'column', justifyContent:'center', alignItems:'flex-start', margin:10}}>
                  <RadioButton.Group
                       onValueChange={value => this.setState({ value})}
                       value={this.state.value}
                     >
                       <View style={{flex:1, flexDirection:'row', justifyContent:'flex-start',alignItems:'flex-start'}}>
                         <RadioButton value='fullShare' />
                         <Text style={{fontSize:20}}>
                            Yes, I will allow access to any relevant parts of the conversation.
                         </Text>
                       </View>
                       <View style={{flex:1, flexDirection:'row', justifyContent:'flex-start',alignItems:'flex-start'}}>
                         <RadioButton value='partialShare'/>
                         <Text style={{fontSize:20}}>
                            I will only allow access if I could censor certain parts of the relevant conversation.
                         </Text>
                       </View>
                       <View style={{flex:1, flexDirection:'row', justifyContent:'flex-start',alignItems:'center'}}>
                        <RadioButton value='noShare'/>
                        <Text style={{fontSize:20}}>
                            No, I will not allow access to any relevant parts of the conversation.
                        </Text>
                      </View>
                  </RadioButton.Group>
              </View>
          }

          { (this.state.value == partialShare) &&
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

          { (this.state.value == noShare) &&
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
                    //this.props.navigation.goBack();
                }
              }
              title="Next"
              color="#20B2AA"
              accessibilityLabel="Next"
            />
          </TouchableHighlight>
      </View>
      <ProgressDialog
        visible={this.state.saveWaitVisible}
        title="MiMi"
        message="Saving response. Please, wait..."
      />
    </ScrollView>

    );
  }
}

const styles = StyleSheet.create({

});