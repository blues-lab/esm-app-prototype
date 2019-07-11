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


import RelationGroup from './relationGroup';
import LocationGroup from './locationGroup';
import Locations from './locations';

import Relations from './relations';


const codeFileName='contextualQuestion.js';
const surveyResponseFilePath= RNFS.DocumentDirectoryPath+'/Responses.js';

export default class ContextualQuestionScreen extends React.Component {

  static navigationOptions = {
    title: 'Contextual questions',
    headerLeft: null
  };

  state={  numOfPeople:0, relations: [], locations:[],
           familySelected:false, friendSelected:false,
           selectedRelations: new Set([]), numOfPeopleCanHear:0,
           childrenPresent: false, adolescentPresent: false, remoteConversation:false,
           contextResponseJS: {}, //holds responses to the contextual questions
           surveyResponseJS: {}, //whole survey response passed by parent
        }

  constructor(props) {
    super(props);

//Alert.alert("Found:",JSON.stringify(props.surveyResponseJS));
//    this.setState({surveyResponseJS: props.surveyResponseJS});

    this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
          BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        );
  }

  componentDidMount() {
    const { navigation } = this.props;
    const _surveyResponseJS = navigation.getParam('surveyResponseJS', 'NO-SERVICE');
    Alert.alert("Found: :: ",JSON.stringify(_surveyResponseJS));
    this.setState({surveyResponseJS: _surveyResponseJS});


    this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
      BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );

    //create the response file
    RNFS.exists(surveyResponseFilePath)
        .then( (exists) => {})
        .else
         {
          RNFS.writeFile(surveyResponseFilePath, JSON.stringify({Responses:[]}))
              .then((success) =>
              {
                 logger.info(`${codeFileName}`,'componentDidMount','Created response file');
              })
              .catch((error) =>
              {
                  logger.error(`${codeFileName}`,'componentDidMount','Failed to create response file:'+error.message);
              })
         }
  }

  onBackButtonPressAndroid = () => {
    return true; //make it false to enable going back
  };

  componentWillUnmount() {
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
  }


   relationSelectionsChange = (selectedRelation, checked) =>
   {
      if (checked)
      {
        this.setState({ selectedRelations: this.state.selectedRelations.add(selectedRelation) });
        if(this.selectedRelation == "Other")
        {
        }

      }
      else
      {
        var updatedRelation = this.state.selectedRelations;
        updatedRelation.delete(selectedRelation);
        this.setState({ selectedRelations: updatedRelation });
      }
   }

   saveResponse()
   {


     _contextResponseJS={
        "NumOfPeopleAround": this.state.numOfPeople,
        "NumOfPeopleCanHear": this.state.numOfPeopleCanHear,
        "ChildrenPresent": this.state.childrenPresent,
        "AdolescentPresent": this.state.adolescentPresent,
        "RemoveConversation":this.state.remoteConversation,
        "Relations": Array.from(this.state.selectedRelations).toString(),
        "Locations": this.state.locations.toString(),
     }

     Alert.alert("surveyResponse:", JSON.stringify(this.state._contextResponseJS));

     logger.info(`${codeFileName}`, 'saveResponse', 'Response: '+JSON.stringify(_contextResponseJS));

     _surveyResponseJS = this.state.surveyResponseJS;
     _surveyResponseJS.ContextualQuestionResponses = _contextResponseJS;

     //Now save all responses
     RNFS.readFile(surveyResponseFilePath)
         .then((_fileContent)=>
         {
            responses = JSON.parse(_fileContent);
            responses.push(_surveyResponseJS);
            RNFS.writeFile(surveyResponseFilePath,JSON.stringify(responses))
                .then((success) =>
                {
                    logger.info(`${codeFileName}`, 'saveResponse', 'Saved full survey response');
                    appStatus.setSurveyStatus("Done");
                    //Alert.alert("Thank you!","All data have been saved.");
                    logger.showLog();
                })
                .catch((error) =>
                {
                    logger.error(`${codeFileName}`, 'saveResponse', 'Failed to save survey response:'+error.message);
                })

         })
         .catch((error)=>{
            logger.error(`${codeFileName}`, 'saveResponse', 'Failed to read survey response file:'+error.message);
            }
         )
   }


  componentDidMount()
  {
    const { navigation } = this.props;
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

        <Text style={commonStyle.questionStyle}>
            How many other people (excluding you) were talking?
        </Text>
        <CustomNumericInput valueChangeCallback={this.numPeopleAroundChangeHandler.bind(this)}/>


        {   this.state.numOfPeople>0 &&
            <View style={styles.verticalViewStyle}>
                <Text style={commonStyle.questionStyle}>
                    How do you relate to them (select all that apply)?
                </Text>
                <Relations/>

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

        <Text style={commonStyle.questionStyle}>
            Where were you talking (select all that apply)?
        </Text>
        <Locations callback={this.relationSelectionsChange.bind(this)} />


        <View style={styles.insideVerticalViewStyle}>
            <Text style={commonStyle.questionStyle}>
                How many people, who did not participate in the conversation, could hear it?
            </Text>
            <CustomNumericInput valueChangeCallback={this.numPeopleCanHearChangeHandler.bind(this)}/>
        </View>


      </View>

          <View style={commonStyle.buttonViewStyle}>
              <TouchableHighlight style ={commonStyle.buttonTouchHLStyle}>
                <Button
                  onPress={() => {
                        //this.saveResponse()
                        Alert.alert('Thank you!')
                    }
                  }
                  title="Save"
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