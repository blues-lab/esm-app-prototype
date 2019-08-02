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


export default class RelationGroup extends React.Component {

  state={familySelected:false, friendSelected:false, acquaintanceSelected:false, colleaguesSelected:false,
         roommatesSelected:false, workerSelected:false, unknownSelected:false, selectedRelations:[]}

  constructor(props) 
  {
    super(props);
  }


  componentDidMount()
  {
    this.setState({familySelected:false, friendSelected:false, selectedRelations:[]});
  }

  render() {
    return (

       <View  style={{
                 flex: 1,
                 flexDirection: 'column',
                 justifyContent: 'space-around',
                 alignItems: 'stretch',
                 marginRight:10,
                 marginLeft:10,
                 backgroundColor:'lightcyan',
                 }}>

            <CheckBox
              title='Family members'
              checkedIcon='dot-circle-o'
              uncheckedIcon='circle-o'
              checked={this.state.familySelected}
              onPress={()=>{
                this.props.callback("Family",!this.state.familySelected);
                this.setState({familySelected: !this.state.familySelected});
              }}
            />
            <CheckBox
              title='Friends'
              checkedIcon='dot-circle-o'
              uncheckedIcon='circle-o'

              checked={this.state.friendSelected}
              onPress={()=>{
                  this.props.callback("Friends",!this.state.friendSelected);
                  this.setState({friendSelected: !this.state.friendSelected});
              }}
            />

             <CheckBox
                  title='Acquaintance'
                  checkedIcon='dot-circle-o'
                  uncheckedIcon='circle-o'
                  checked={this.state.acquaintanceSelected}
                  onPress={()=>{
                    this.props.callback("Acquaintance",!this.state.acquaintanceSelected);
                    this.setState({acquaintanceSelected: !this.state.acquaintanceSelected});
                  }}
                />
                <CheckBox
                  title='Colleagues'
                  checkedIcon='dot-circle-o'
                  uncheckedIcon='circle-o'

                  checked={this.state.colleaguesSelected}
                  onPress={()=>{
                      this.props.callback("Colleagues",!this.state.colleaguesSelected);
                      this.setState({colleaguesSelected: !this.state.colleaguesSelected});
                  }}
                />
                 <CheckBox
                      title='Roommates'
                      checkedIcon='dot-circle-o'
                      uncheckedIcon='circle-o'
                      checked={this.state.roommatesSelected}
                      onPress={()=>{
                        this.props.callback("Roommates",!this.state.roommatesSelected);
                        this.setState({roommatesSelected: !this.state.roommatesSelected});
                      }}
                    />
                    <CheckBox
                      title='Worker'
                      checkedIcon='dot-circle-o'
                      uncheckedIcon='circle-o'

                      checked={this.state.workerSelected}
                      onPress={()=>{
                          this.props.callback("Worker",!this.state.workerSelected);
                          this.setState({workerSelected: !this.state.workerSelected});
                      }}
                    />
                    <CheckBox
                      title='Unknown'
                      checkedIcon='dot-circle-o'
                      uncheckedIcon='circle-o'

                      checked={this.state.unknownSelected}
                      onPress={()=>{
                          this.props.callback("Unknown",!this.state.unknownSelected);
                          this.setState({unknownSelected: !this.state.unknownSelected});
                      }}
                    />

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
  }
});