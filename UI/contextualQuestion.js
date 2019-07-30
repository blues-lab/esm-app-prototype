import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, 
  TextInput, Alert, FlatList, Modal, ScrollView,
  TouchableHighlight, Switch, BackHandler} from 'react-native';
import * as RNFS from 'react-native-fs';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';

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

export default class ContextualQuestionScreen extends React.Component {


  static navigationOptions = {
      headerTitle: <ToolBar title="Contextual questions" progress={90}/>,
      headerLeft: null
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
                        };

    this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
          BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        );
  }

  componentDidMount() {
    const { navigation } = this.props;
    const _surveyResponseJS = navigation.getParam('surveyResponseJS', null);

    this.setState({surveyResponseJS: _surveyResponseJS});

//    this.setState({surveyResponseJS: _surveyResponseJS}, ()=>
//                    Alert.alert("surveyResponseJS", JSON.stringify(this.state.surveyResponseJS)));



    this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
      BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
  }

  onBackButtonPressAndroid = () => {
    return true; //make it false to enable going back
  };

  componentWillUnmount() {
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
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

     _contextResponseJS={
        "NumOfPeopleAround": this.state.numOfPeople,
        "NumOfPeopleCanHear": this.state.numOfPeopleCanHear,
        "ChildrenPresent": this.state.childrenPresent,
        "AdolescentPresent": this.state.adolescentPresent,
        "RemoteConversation":this.state.remoteConversation,
        "Relations": Array.from(this.state.selectedRelations).toString(),
        "Locations": Array.from(this.state.selectedLocations).toString(),
        "CompletionTime": new Date()
     }

     logger.info(codeFileName, 'saveResponse', 'Saving survey response.');

     _surveyResponseJS = this.state.surveyResponseJS;
     _surveyResponseJS.ContextualQuestionResponses = _contextResponseJS;

     time =  Date.now().toString()
     utilities.writeJSONFile(_surveyResponseJS, RNFS.DocumentDirectoryPath+"/response-"+ time+'.js', codeFileName, "saveResponse");

     logger.info(codeFileName, 'saveResponse', 'Updating survey status to "Completed" and removing all notifications.');

     appStatus.setSurveyStatus("Completed");
     notificationController.cancelNotifications();

     Alert.alert("Congratulations!", "You have earned $.2!",
               [
                   {text: 'OK', onPress:() => {BackHandler.exitApp()}}
               ]
             )

     logger.info(codeFileName, 'saveResponse', 'All done!');
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

    <ScrollView>

      <View style={{margin:10}}>
      <View style={styles.verticalViewStyle}>

        {
            this.state.surrounding &&
            <View style={styles.verticalViewStyle}>
            <Text style={commonStyle.questionStyle}>
                Where were you talking (select all that apply)?
            </Text>
            <Locations locationSelectionHandler={this.locationSelectionHandler.bind(this)} />


            <View style={styles.insideVerticalViewStyle}>
                <Text style={commonStyle.questionStyle}>
                    How many people, who did not participate in the conversation, could hear it?
                </Text>
                <CustomNumericInput valueChangeCallback={this.numPeopleCanHearChangeHandler.bind(this)}/>
            </View>
            </View>

        }

        {   !this.state.surrounding &&

            <View style={styles.verticalViewStyle}>
            <Text style={commonStyle.questionStyle}>
                How many other people (excluding you) were talking?
            </Text>
            <CustomNumericInput valueChangeCallback={this.numPeopleAroundChangeHandler.bind(this)}/>

            {   this.state.numOfPeople>0 &&
                <View style={styles.verticalViewStyle}>
                    <Text style={commonStyle.questionStyle}>
                        How do you relate to them (select all that apply)?
                    </Text>
                    <Relations relationSelectionHandler ={this.relationSelectionHandler.bind(this)}/>

                    <Text style={commonStyle.questionStyle}>
                        Among people who were talking, were there:
                    </Text>
                    <View style= {styles.horizontalViewStyle}>
                        <Text style={{fontSize:16}}> Children (0-12 years old):</Text>
                        <Switch style={{marginLeft:10}}
                          value={this.state.childrenPresent}
                          onValueChange={(val) => this.setState({childrenPresent: val})}
                        />
                    </View>
                     <View style= {styles.horizontalViewStyle}>
                        <Text style={{fontSize:16}}> Adolescent (13-17 years old):</Text>
                        <Switch style={{marginLeft:10}}
                          value={this.state.adolescentPresent}
                          onValueChange={(val) => this.setState({adolescentPresent: val})}
                        />
                    </View>

                    <Text style={commonStyle.questionStyle}>
                        Did any of the people who were talking call in or connect to a video chat (as
                            opposed to being physically present in the room)?
                    </Text>
                    <View style= {styles.horizontalViewStyle}>
                        <Text>No</Text>
                        <Switch style={{marginLeft:10}}
                          value={this.state.remoteConversation}
                          onValueChange={(val) => this.setState({remoteConversation: val})}
                        />
                        <Text>Yes</Text>
                    </View>

                </View>
            }

            </View>
        }


      </View>


          <View style={commonStyle.buttonViewStyle}>
              <TouchableHighlight style ={commonStyle.buttonTouchHLStyle}>
                <Button
                  onPress={() =>
                    {
                        if(this.state.surrounding)
                        {
                            this.setState({surrounding:false})
                        }
                        else
                        {
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
    backgroundColor:'lightcyan',
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
      backgroundColor:'lightcyan',
  }

});