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

import RelationGroup from './relationGroup'
import LocationGroup from './locationGroup'
import Locations from './locations'

import Relations from './relations'


export default class ContextualQuestionScreen extends React.Component {

  static navigationOptions = {
    title: 'Contextual questions',
    headerLeft: null
  };

  state={  numOfPeople:0, relations: [], locations:[],
           familySelected:false, friendSelected:false,
           selectedRelations: new Set([]), numOfPeopleCanHear:0,
           childrenPresent: false, adolescentPresent: false,
           contextResponseJS: {}}

  constructor(props) {
    super(props);

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
        "Relations": Array.from(this.state.selectedRelations).toString(),
        "Locations": this.state.locations.toString(),
     }
     Alert.alert(JSON.stringify(_contextResponseJS));
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

                {   false &&
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
                        <Text style={{color: 'black', fontFamily:'Times New Roman', fontSize: 18}}>
                            Other:
                        </Text>

                        <TextInput
                             multiline={false}
                             style={{height: 50, width: 100, borderColor: 'gray', borderWidth: 1}}
                             onChangeText={(text) =>
                               this.setState({ conversationTopic: text })

                             }
                             value={"hasaflj"}
                        />
                    </View>
                }
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

            </View>
        }

        <Text style={commonStyle.questionStyle}>
            Where were you talking (select all that apply)?
        </Text>
        <Locations callback={this.relationSelectionsChange.bind(this)} />

        <Text style={commonStyle.questionStyle}>
            Were all the people who were talking at your home (as opposed to someone calling in
            or connecting to a video chat)? -- What should be the input type?
        </Text>

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