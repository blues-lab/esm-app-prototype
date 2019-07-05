import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, 
  TextInput, Alert, FlatList, Modal, ScrollView, TouchableHighlight} from 'react-native';
import * as RNFS from 'react-native-fs';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';

import DialogInput from 'react-native-dialog-input';
//import SelectMultiple from 'react-native-select-multiple';
import NumericInput from 'react-native-numeric-input';

import { CheckBox } from 'react-native-elements'

//import CheckBoxes from 'react-native-group-checkbox'

const serviceFileAsset= 'services.js';
const serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';

import RelationGroup from './relationGroup'



export default class ContextualQuestionScreen extends React.Component {

  state={  numOfPeople:0, relations: [], ages:[], locations:[],
           familySelected:false, friendSelected:false, selectedItems:[],
           selectedRelations: new Set([])}




  constructor(props) 
  {
    super(props);
  }



   relationSelectionsChange = (selectedRelation, checked) => {
      if (checked)
      {
        this.setState({ selectedRelations: this.state.selectedRelations.add(selectedRelation) });
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

onSelectedItemsChange = (selectedItems) => {
    this.setState({ selectedItems });
  };


  render() {
    return (
    <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'stretch',
        marginRight:10,
        marginLeft:10,
        backgroundColor:'lightcyan',
        }}>
    <ScrollView>
      <View style={styles.verticalViewStyle}>

                <Text style={styles.questionStyle}>
                    How many other people (excluding you) were talking?
                </Text>
                <NumericInput
                   value={this.state.numOfPeople}
                   //onChange={value => this.setState({value})}
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
                    <Text style={styles.questionStyle}>
                        How do you relate to them (select all that apply)?
                    </Text>

                    <RelationGroup callback={this.relationSelectionsChange.bind(this)} />
                    </View>
                }

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
                  onPress={() => Alert.alert("people:"+this.state.numOfPeople+",,"+Array.from(this.state.selectedRelations).toString())}
                  title="Save"
                  color="#20B2AA"
                  accessibilityLabel="Save"
                />
              </TouchableHighlight>
          </View>
      </ScrollView>
</View>

    );
  }
}

const styles = StyleSheet.create({
  questionStyle: {
    color: 'black',
    fontFamily:'Times New Roman',
    //fontWeight: 'bold',
    fontSize: 18,
    borderColor: 'black',
    paddingRight:20,
    paddingLeft:20,
    paddingTop:10,
    paddingBottom:10,
    marginTop:5,
    backgroundColor:'#a7f1e9',
  },
 radioFrameStyle: {
    //justifyContent: 'center',
    //flex: 1,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    marginTop: 15,
    paddingLeft:30,
    paddingRight:40,
  },

  inputStyle:{
    height: 100,
    width: 300,
    alignItems: 'center',
    borderColor: 'gray',
    borderWidth: 1,
    paddingRight:20,
    paddingLeft:20,
    paddingTop:10,
    paddingBottom:10,
    marginTop:5,
  },

  verticalViewStyle:{
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginRight:10,
    marginLeft:10,
    backgroundColor:'lightcyan',
  }

});