import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, 
  TextInput, Alert, FlatList, Modal, ScrollView,
  TouchableHighlight, Switch, BackHandler} from 'react-native';
import * as RNFS from 'react-native-fs';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';
import { ProgressDialog } from 'react-native-simple-dialogs';

import DialogInput from 'react-native-dialog-input';

import CustomNumericInput from './customNumericInput';

import { CheckBox } from 'react-native-elements';

import commonStyle from './Style';

const serviceFileAsset= 'services.js';
const serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';

import logger from '../controllers/logger';

import appStatus from '../controllers/appStatus';

import notificationController from '../controllers/notificationController';

import RelationGroup from './relationGroup';
import LocationGroup from './locationGroup';
import Locations from './locations';

import Relations from './relations';

import ToolBar from './toolbar'
const codeFileName='contextualQuestion.js';
const surveyResponseFilePath= RNFS.DocumentDirectoryPath+'/Responses.js';
import utilities from '../controllers/utilities';
import {SURVEY_STATUS} from '../controllers/constants';

export default class ContextualQuestionScreen extends React.Component {


static navigationOptions = ({ navigation }) => {
    return {
        headerLeft: null,
        headerTitle: <ToolBar title="Contextual questions" progress={navigation.state.params.surveyProgress}/>,
    };
  };


  constructor(props) {
    super(props);

    this.state = { numOfPeople:0, relations: [], locations:[],
                   familySelected:false, friendSelected:false,
                   selectedRelations: new Set([]), selectedLocations: new Set([]),
                   numOfPeopleCanHear:0,
                   childrenPresent: false, adolescentPresent: false, remoteConversation:false,
                   contextResponseJS: {}, //holds responses to the contextual questions
                   surveyResponseJS: {}, //whole survey response passed by parent
                   surrounding:true, //Questions about surrounding people VS participating people
                   saveWaitVisible: false, //show progress dialog while saving survey response
                 };
  }

  componentDidMount() {
    const { navigation } = this.props;
    const _surveyResponseJS = navigation.getParam('surveyResponseJS', null);

    this.setState({surveyResponseJS: _surveyResponseJS,
                   surveyProgress: navigation.getParam('surveyProgress', 0)});
    if (Platform.OS == "android")
    {
        BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid.bind(this));
    }
  }

  onBackButtonPressAndroid = () => {
    return true; //make it false to enable going back
  };

  componentWillUnmount() {
    if(Platform.OS == 'android')
    {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid);
    }
  }


   relationSelectionHandler(selectedRelation, checked)
   {
      if (checked)
      {
        this.setState({ selectedRelations: this.state.selectedRelations.add(selectedRelation) });
      }
      else
      {
        _selectedRelations = this.state.selectedRelations;
        _selectedRelations.delete(selectedRelation);
        this.setState({ selectedRelations: _selectedRelations});
      }
   }

  locationSelectionHandler(selectedLocation, checked)
  {
     if (checked)
     {
       this.setState({ selectedLocations: this.state.selectedLocations.add(selectedLocation) });
     }
     else
     {
       _selectedLocations = this.state.selectedLocations;
       _selectedLocations.delete(selectedLocation);
       this.setState({selectedLocations: _selectedLocations});
     }
  }

   async saveResponse()
   {

    this.setState({saveWaitVisible:true});

    _appStatus = await appStatus.loadStatus();

     _contextResponseJS={
        "NumOfPeopleAround": this.state.numOfPeople,
        "NumOfPeopleCanHear": this.state.numOfPeopleCanHear,
        "ChildrenPresent": this.state.childrenPresent,
        "AdolescentPresent": this.state.adolescentPresent,
        "RemoteConversation":this.state.remoteConversation,
        "Relations": Array.from(this.state.selectedRelations).toString(),
        "Locations": Array.from(this.state.selectedLocations).toString(),
        "SurveyCountToday": _appStatus.SurveyCountToday,
        "CurrentSurveyCreationTime": _appStatus.FirstNotificationTime,
        "CurrentSurveyCompletionTime": new Date(),
        "UIID": _appStatus.UIID,
     }

     logger.info(codeFileName, 'saveResponse', 'Saving survey response and updating app status variables.');

     _surveyResponseJS = this.state.surveyResponseJS;
     _surveyResponseJS.ContextualQuestionResponses = _contextResponseJS;

     _appStatus.CompletedSurveys+=1;
     _appStatus.SurveyStatus = SURVEY_STATUS.COMPLETED;
     _appStatus.CurrentSurveyID = null;
     await appStatus.setAppStatus(_appStatus);

     notificationController.cancelNotifications();

     logger.info(codeFileName, 'saveResponse', 'Uploading survey response to the server.');

     const _uploaded = await utilities.uploadData({SurveyID: _appStatus.CurrentSurveyID,
            Stage: 'Completed.', Response: _surveyResponseJS},
            _appStatus.UUID, 'SurveyResponse', codeFileName, 'saveResponse');
     if(_uploaded)
     {
        logger.info(codeFileName, 'saveResponse', 'All done!');
     }
     else
     {
        logger.error(codeFileName, 'saveResponse', 'Failed to upload response. Saving in local file for now.')
        _time =  Date.now().toString();
        await utilities.writeJSONFile(_surveyResponseJS, RNFS.DocumentDirectoryPath+"/survey--response--"+ _time+'.js',
                                codeFileName, "saveResponse");
     }


     this.setState({saveWaitVisible:false}, ()=> {
     Alert.alert("Congratulations!", "You have earned \u00A220!!!",
               [
                   {text: 'OK', onPress:() => {BackHandler.exitApp()}}
               ],
               {cancelable: false}
             )});
   }


  numPeopleAroundChangeHandler(value)
  {
    this.setState({numOfPeople: value});
  }
  numPeopleCanHearChangeHandler(value)
  {
    this.setState({numOfPeopleCanHear:value});
  }


  render() {
    return (

    <ScrollView contentContainerStyle={{ backgroundColor:'lavender'}}>

      <View style={{margin:10}}>
      <View style={styles.verticalViewStyle}>

        {
            this.state.surrounding &&
            <View style={styles.verticalViewStyle}>
                <View style={commonStyle.dividerStyle}>
                    <Text style={[commonStyle.questionStyle]}>
                        <Text>Answer a few questions about the conversion you just had.</Text>
                        <Text>{"\n"}</Text><Text>{"\n"}</Text>
                        <Text>Where were you talking?</Text><Text>{"\n"}</Text>
                        <Text>Select all that apply.</Text>
                    </Text>
                    <Locations locationSelectionHandler={this.locationSelectionHandler.bind(this)} />
                </View>

                <View style={styles.insideVerticalViewStyle}>
                    <View style={commonStyle.dividerStyle}>
                        <Text style={commonStyle.questionStyle}>
                            How many people, who did not participate in the conversation, could hear it?
                        </Text>
                        <CustomNumericInput valueChangeCallback={this.numPeopleCanHearChangeHandler.bind(this)}/>
                    </View>
                </View>
            </View>

        }

        {   !this.state.surrounding &&

            <View style={styles.verticalViewStyle}>
                <View style={commonStyle.dividerStyle}>
                    <Text style={commonStyle.questionStyle}>
                        How many other people (excluding you) were talking?
                    </Text>
                    <CustomNumericInput valueChangeCallback={this.numPeopleAroundChangeHandler.bind(this)}/>

                </View>

            {   this.state.numOfPeople>0 &&
                <View style={styles.verticalViewStyle}>
                    <View style={commonStyle.dividerStyle}>
                        <Text style={commonStyle.questionStyle}>
                            How do you relate to them? Select all that apply.
                        </Text>
                        <Relations relationSelectionHandler ={this.relationSelectionHandler.bind(this)}/>
                    </View>

                    <View style={commonStyle.dividerStyle}>
                        <Text style={commonStyle.questionStyle}>
                            Of the people who were talking, were there:
                        </Text>
                        <View style= {styles.horizontalViewStyle}>
                            <Text style={{margin:10, fontSize:18}}> Children (0-12 years old):</Text>
                            <Switch style={{marginLeft:10}}
                              value={this.state.childrenPresent}
                              onValueChange={(val) => this.setState({childrenPresent: val})}
                            />
                        </View>
                         <View style= {styles.horizontalViewStyle}>
                            <Text style={{margin:10, fontSize:18}}> Adolescents (13-17 years old):</Text>
                            <Switch style={{marginLeft:10}}
                              value={this.state.adolescentPresent}
                              onValueChange={(val) => this.setState({adolescentPresent: val})}
                            />
                        </View>
                    </View>

                    <View style={commonStyle.dividerStyle}>

                        <Text style={commonStyle.questionStyle}>
                            Was everyone talking physically present (e.g., rather than talking over the phone)?
                        </Text>
                        <View style= {styles.horizontalViewStyle}>
                            <Text style={{margin:10, fontSize:18}}>No</Text>
                            <Switch style={{marginLeft:10}}
                              value={this.state.remoteConversation}
                              onValueChange={(val) => this.setState({remoteConversation: val})}
                            />
                            <Text style={{margin:10, fontSize:18}}>Yes</Text>
                        </View>
                    </View>

                </View>
            }

            </View>
        }


      </View>


          <View style={[commonStyle.buttonViewStyle,{marginTop:20}]}>
              <TouchableHighlight style ={commonStyle.buttonTouchHLStyle}>
                <Button
                  onPress={() =>
                    {
                        if(this.state.surrounding)
                        {
                            this.setState({surrounding:false, surveyProgress:90})
                            this.props.navigation.setParams({ surveyProgress: 90})
                        }
                        else
                        {
                            this.setState({surrounding:false, surveyProgress:100})
                            this.props.navigation.setParams({ surveyProgress: 100})
                            this.saveResponse();
                        }
                    }
                  }
                  title="Next"
                  color="#20B2AA"
                  accessibilityLabel="Save"
                />
              </TouchableHighlight>
          </View>


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




  verticalViewStyle:{
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
//    marginRight:10,
//    marginLeft:10,
    //backgroundColor:'lightcyan',
  },

  insideVerticalViewStyle:{
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      //backgroundColor:'#a7f1e9'
    },

  horizontalViewStyle:{
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
//      marginRight:10,
//      marginLeft:10,
      ///backgroundColor:'lightcyan',
  }

});