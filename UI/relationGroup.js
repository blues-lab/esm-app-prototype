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



const fruits = ['Apples', 'Oranges', 'Pears']
// --- OR ---
// const fruits = [
//   { label: 'Apples', value: 'appls' },
//   { label: 'Oranges', value: 'orngs' },
//   { label: 'Pears', value: 'pears' }
// ]



export default class RelationGroup extends React.Component {

  state={familySelected:false, friendSelected:false, selectedRelations:[]}

  constructor(props) 
  {
    super(props);
  }


  componentDidMount()
  {
    this.setState({familySelected:false, friendSelected:false, selectedRelations:[]});
  }

  sendSelectedItemsToParent = () => {
    var selectedRelations =[];
    //Alert.alert("v:"+this.state.familySelected)
    if(this.state.familySelected)
        selectedRelations.push("Family");
    if(this.state.friendSelected)
        selectedRelations.push("Friends");

    this.props.callback(selectedRelations);
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
              center
              title='Family members'
              iconType='material'
              checkedIcon='clear'
              uncheckedIcon='add'
              checkedColor='red'
              checked={this.state.familySelected}
              onPress={()=>{

                //if(this.state.familySelected ==false )
                  //  this.setState({ selectedRelations: [...this.state.selectedRelations, 'Family'] });
                this.props.callback("Family",!this.state.familySelected);
//Alert.alert("fam:"+this.state.familySelected);
                this.setState({familySelected: !this.state.familySelected});

              }}
            />

            <CheckBox
              center
              title='Friends'
              checkedIcon='dot-circle-o'
              uncheckedIcon='circle-o'

              checked={this.state.friendSelected}
              onPress={()=>{
//                  if(!this.state.friendSelected)
//                    this.setState({ selectedRelations: [...this.state.selectedRelations, 'Friends'] });
//                    this.props.callback(this.state.selectedRelations);
                  this.props.callback("Friends",!this.state.friendSelected);
                  this.setState({friendSelected: !this.state.friendSelected});
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