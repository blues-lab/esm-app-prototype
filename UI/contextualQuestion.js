import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, 
  TextInput, Alert, FlatList, Modal, ScrollView, TouchableHighlight} from 'react-native';
import * as RNFS from 'react-native-fs';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';

import DialogInput from 'react-native-dialog-input';
import NumericInput from 'react-native-numeric-input';

import { CheckBox } from 'react-native-elements'

import commonStyle from './Style'

const serviceFileAsset= 'services.js';
const serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';

import RelationGroup from './relationGroup'
import LocationGroup from './locationGroup'


export default class ContextualQuestionScreen extends React.Component {

  state={  numOfPeople:0, relations: [], ages:[], locations:[],
           familySelected:false, friendSelected:false, selectedItems:[],
           selectedRelations: new Set([]), numOfPeopleCanHear:0 }

  constructor(props)
  {
    super(props);
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


  componentDidMount()
  {
    const { navigation } = this.props;
  }

  onSelectedItemsChange = (selectedItems) =>
  {
    this.setState({ selectedItems });
  };


  render() {
    return (

    <ScrollView>
      <View style={styles.verticalViewStyle}>

        <Text style={commonStyle.questionStyle}>
            How many other people (excluding you) were talking?
        </Text>
        <NumericInput
           value={this.state.numOfPeople}
           onChange={(value)=>{
            this.setState({numOfPeople: value});
            if(value==0)
                this.setState({selectedRelations: new Set([])})
           }}
           onLimitReached={(isMax,msg) => console.log(isMax,msg)}
           totalWidth={200}
           totalHeight={40}
           minValue={0}
           maxValue={100}
           iconSize={25}
           step={1}
           valueType='integer'
           rounded
           textColor='#B0228C'
           iconStyle={{ color: 'white' }}
           rightButtonBackgroundColor='#66c1e5'
           leftButtonBackgroundColor='#92d3ed'
        />


        {   this.state.numOfPeople>0 &&
            <View style={styles.verticalViewStyle}>
                <Text style={commonStyle.questionStyle}>
                    How do you relate to them (select all that apply)?
                </Text>
                <RelationGroup callback={this.relationSelectionsChange.bind(this)} />

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
                    TODO: add options
                </Text>
            </View>
        }

        <Text style={commonStyle.questionStyle}>
            Where were you talking (select all that apply)?
        </Text>
        <LocationGroup callback={this.relationSelectionsChange.bind(this)} />

        <Text style={commonStyle.questionStyle}>
            Were all the people who were talking at your home (as opposed to someone calling in
            or connecting to a video chat)? -- What should be the input type?
        </Text>

        <View style={styles.insideVerticalViewStyle}>
            <Text style={commonStyle.questionStyle}>
                How many people, who did not participate in the conversation, could hear it?
            </Text>
            <NumericInput style={{marginTop:100, marginBottom:30, paddingTop:10, paddingBottom:30}}
               value={this.state.numOfPeopleCanHear}
               onChange={(value)=>{
                this.setState({numOfPeopleCanHear: value});
               }}
               onLimitReached={(isMax,msg) => console.log(isMax,msg)}
               totalWidth={200}
               totalHeight={40}
               minValue={0}
               maxValue={100}
               iconSize={25}
               step={1}
               valueType='integer'
               rounded
               textColor='#B0228C'
               iconStyle={{ color: 'white' }}
               rightButtonBackgroundColor='#66c1e5'
               leftButtonBackgroundColor='#92d3ed'
            />
        </View>


      </View>

          <View style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'space-around',
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
                  onPress={() => Alert.alert("Saved!")}
                  title="Save"
                  color="#20B2AA"
                  accessibilityLabel="Save"
                />
              </TouchableHighlight>
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
    marginRight:10,
    marginLeft:10,
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
      justifyContent: 'space-around',
      alignItems: 'center',
      marginRight:10,
      marginLeft:10,
      backgroundColor:'lightcyan',
  }

});