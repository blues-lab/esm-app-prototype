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


import logger from '../controllers/logger';
const codeFileName = "locations.js"


export default class Locations extends React.Component {

  state={familySelected:false, friendSelected:false, acquaintanceSelected:false, colleaguesSelected:false,
         roommatesSelected:false, workerSelected:false, unknownSelected:false, selectedRelations:[],
         otherDialogVisible: false,
         locationNames : [
                 {name: "Bedroom", renderStyle: styles.unselectedStyle, selected: false},
                 {name: "Living room", renderStyle: styles.unselectedStyle, selected: false},
                 {name: "Garden", renderStyle: styles.unselectedStyle, selected: false},
                 {name: "Kitchen", renderStyle: styles.unselectedStyle, selected: false},
                 {name: "Garage", renderStyle: styles.unselectedStyle, selected: false},
                 {name: "Bathroom", renderStyle: styles.unselectedStyle, selected: false},
                 {name: "Patio/balcony/terrace", renderStyle: styles.unselectedStyle, selected: false},
                 {name: "Other", renderStyle: styles.unselectedStyle, selected: false},
             ]
        }

  constructor(props) 
  {
    super(props);
  }


  componentDidMount()
  {
    this.setState({familySelected:false, friendSelected:false, selectedRelations:[]});
  }

  handleSelectionChange(index)
  {
    _locationNames = this.state.locationNames;
    _locationNames[index].selected = !_locationNames[index].selected
    if(_locationNames[index].selected)
    {
        _locationNames[index].renderStyle = styles.selectedStyle;

        //check if 'other' was selected
        if(_locationNames[index].name=='Other')
        {
            this.setState({otherDialogVisible: true});
        }
    }
    else
    {
        _locationNames[index].renderStyle = styles.unselectedStyle;
    }

    logger.info(`${codeFileName}`,'handleSelectionChange',
            `relation: ${_locationNames[index].name}, selected: ${_locationNames[index].selected}`)
    this.setState({locationNames: _locationNames});
  }



  render() {
    return (

       <View  style={{
                 flex: 1,
                 flexDirection: 'column',
                 justifyContent: 'space-around',
                 alignItems: 'stretch',
                 margin:10,
                 backgroundColor:'lightcyan',
                 }}>

            <View style={styles.rowView}>

                <TouchableHighlight style={this.state.locationNames[0].renderStyle}
                    onPress={
                          this.handleSelectionChange.bind(this, 0)
                    }>
                  <Text style={styles.itemTextStyle}>{this.state.locationNames[0].name}</Text>
                </TouchableHighlight>

                <TouchableHighlight style={this.state.locationNames[1].renderStyle}
                    onPress={
                          this.handleSelectionChange.bind(this, 1)
                    }>
                  <Text style={styles.itemTextStyle}>{this.state.locationNames[1].name}</Text>
                </TouchableHighlight>

                <TouchableHighlight style={this.state.locationNames[2].renderStyle}
                    onPress={
                          this.handleSelectionChange.bind(this, 2)
                    }>
                  <Text style={styles.itemTextStyle}>{this.state.locationNames[2].name}</Text>
                </TouchableHighlight>
            </View>

            <View style={styles.rowView}>
                <TouchableHighlight style={this.state.locationNames[3].renderStyle}
                    onPress={
                          this.handleSelectionChange.bind(this, 3)
                    }>
                  <Text style={styles.itemTextStyle}>{this.state.locationNames[3].name}</Text>
                </TouchableHighlight>

                <TouchableHighlight style={this.state.locationNames[4].renderStyle}
                        onPress={
                              this.handleSelectionChange.bind(this, 4)
                        }>
                      <Text style={styles.itemTextStyle}>{this.state.locationNames[4].name}</Text>
                </TouchableHighlight>

                <TouchableHighlight style={this.state.locationNames[5].renderStyle}
                    onPress={
                          this.handleSelectionChange.bind(this, 5)
                    }>
                  <Text style={styles.itemTextStyle}>{this.state.locationNames[5].name}</Text>
                </TouchableHighlight>
            </View>


            <View style={styles.rowView}>
                <TouchableHighlight style={this.state.locationNames[6].renderStyle}
                    onPress={
                          this.handleSelectionChange.bind(this,6)
                    }>
                  <Text style={styles.itemTextStyle}>{this.state.locationNames[6].name}</Text>
                </TouchableHighlight>

                <TouchableHighlight style={this.state.locationNames[7].renderStyle}
                        onPress={
                              this.handleSelectionChange.bind(this, 7)
                        }>
                      <Text style={styles.itemTextStyle}>{this.state.locationNames[7].name}</Text>
                </TouchableHighlight>
            </View>

              <DialogInput isDialogVisible={this.state.otherDialogVisible}
                  title={"Please enter"}
                  message={""}
                  hintInput ={""}
                  multiline={true}
                  numberOfLines={4}
                  submitInput={ (inputText) => {
                        this.setState({otherLocationName: inputText, otherDialogVisible: false});
                    }
                  }
                  closeDialog={ () => {this.setState({otherDialogVisible:false})}}>
              </DialogInput>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  unselectedStyle: {
          backgroundColor: "white",
          padding: 2,
          margin:2,
          borderWidth:.5
  },
  selectedStyle: {
        backgroundColor: "springgreen",
        padding: 2,
        margin:2,
        borderWidth:.5
    },

  rowView: {
     flex: 1,
     flexDirection: 'row',
     justifyContent: 'center',
     alignItems: 'stretch',
  },
  itemTextStyle: {
    fontSize:20,
  },

});