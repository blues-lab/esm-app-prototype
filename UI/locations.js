import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, 
  TextInput, Alert, FlatList, Modal, ScrollView, TouchableHighlight, Image} from 'react-native';
import * as RNFS from 'react-native-fs';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';
import Icon from 'react-native-vector-icons/Fontisto';
import DialogInput from 'react-native-dialog-input';
import NumericInput from 'react-native-numeric-input';
import { CheckBox } from 'react-native-elements';

const serviceFileAsset= 'services.js';
const serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';


import logger from '../controllers/logger';
const codeFileName = "locations.js"

const checkBoxWidth=25;
const checkBoxHeight=25;

export default class Locations extends React.Component {

  state={familySelected:false, friendSelected:false, acquaintanceSelected:false, colleaguesSelected:false,
         roommatesSelected:false, workerSelected:false, unknownSelected:false, selectedRelations:[],
         otherDialogVisible: false,
         locationNames : [
                 {name: "Bedroom", renderStyle: styles.unselectedStyle, iconName : "checkbox-passive", selected: false},
                 {name: "Living room", renderStyle: styles.unselectedStyle, iconName : "checkbox-passive", selected: false},
                 {name: "Garden", renderStyle: styles.unselectedStyle, iconName : "checkbox-passive",  selected: false},
                 {name: "Kitchen", renderStyle: styles.unselectedStyle, iconName : "checkbox-passive",  selected: false},
                 {name: "Garage", renderStyle: styles.unselectedStyle, iconName : "checkbox-passive",  selected: false},
                 {name: "Bathroom", renderStyle: styles.unselectedStyle, iconName : "checkbox-passive",  selected: false},
                 {name: "Patio/balcony/terrace", renderStyle: styles.unselectedStyle, iconName : "checkbox-passive",  selected: false},
                 {name: "Other", renderStyle: styles.unselectedStyle, iconName : "checkbox-passive",  selected: false},
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

    _name = _locationNames[index].name;
    _selected = _locationNames[index].selected;

    if(_selected)
    {
        //check if 'other' was selected
        if(_locationNames[index].name=='Other')
        {
            this.setState({otherDialogVisible: true});
        }
        _locationNames[index].iconName="checkbox-active";
    }
    else
    {
        _locationNames[index].iconName="checkbox-passive";
    }

    logger.info(`${codeFileName}`,'handleSelectionChange',
            `location: ${_locationNames[index].name}, selected: ${_locationNames[index].selected}`)

    this.setState({locationNames: _locationNames});

    if(_name != 'Other')
    {
        this.props.locationSelectionHandler(_name, _selected);
    }
    else
    {
        this.props.locationSelectionHandler(this.state.otherLocationName, _selected);
    }
  }

  unselectOther()
  {
    //When other is selected but nothing entered, un-select the option
    _locationNames = this.state.locationNames;
    _locationNames[_locationNames.length-1].selected=false;
    _locationNames[_locationNames.length-1].renderStyle=styles.unselectedStyle;
    this.setState({locationNames: _locationNames})
  }



  render() {
    return (

       <View  style={{
                 flex: 1,
                 flexDirection: 'column',
                 justifyContent: 'space-around',
                 alignItems: 'stretch',
                 margin:10,
                 //backgroundColor:'lightcyan',
                 }}>

            <View style={styles.rowView}>

                <TouchableHighlight style={this.state.locationNames[0].renderStyle}
                      onPress={
                          this.handleSelectionChange.bind(this, 0)
                      }>
                      <View style={styles.rowView}>
                        <Icon name= {this.state.locationNames[0].iconName} size={18} color="#66cc94" style ={{margin:5}}/>
                        <Text style={styles.itemTextStyle}>{this.state.locationNames[0].name}</Text>
                      </View>
                </TouchableHighlight>

                <TouchableHighlight style={this.state.locationNames[1].renderStyle}
                    onPress={
                          this.handleSelectionChange.bind(this, 1)
                    }>
                  <View style={styles.rowView}>
                    <Icon name= {this.state.locationNames[1].iconName} size={18} color="#66cc94" style ={{margin:5}}/>
                    <Text style={styles.itemTextStyle}>{this.state.locationNames[1].name}</Text>
                  </View>
                </TouchableHighlight>

                <TouchableHighlight style={this.state.locationNames[2].renderStyle}
                    onPress={
                          this.handleSelectionChange.bind(this, 2)
                    }>
                  <View style={styles.rowView}>
                    <Icon name= {this.state.locationNames[2].iconName} size={18} color="#66cc94" style ={{margin:5}}/>
                    <Text style={styles.itemTextStyle}>{this.state.locationNames[2].name}</Text>
                  </View>
                </TouchableHighlight>
            </View>

            <View style={styles.rowView}>
                <TouchableHighlight style={this.state.locationNames[3].renderStyle}
                    onPress={
                          this.handleSelectionChange.bind(this, 3)
                    }>
                    <View style={styles.rowView}>
                     <Icon name= {this.state.locationNames[3].iconName} size={18} color="#66cc94" style ={{margin:5}}/>
                     <Text style={styles.itemTextStyle}>{this.state.locationNames[3].name}</Text>
                   </View>
                </TouchableHighlight>

                <TouchableHighlight style={this.state.locationNames[4].renderStyle}
                        onPress={
                              this.handleSelectionChange.bind(this, 4)
                        }>
                      <View style={styles.rowView}>
                        <Icon name= {this.state.locationNames[4].iconName} size={18} color="#66cc94" style ={{margin:5}}/>
                        <Text style={styles.itemTextStyle}>{this.state.locationNames[4].name}</Text>
                      </View>
                </TouchableHighlight>

                <TouchableHighlight style={this.state.locationNames[5].renderStyle}
                    onPress={
                          this.handleSelectionChange.bind(this, 5)
                    }>
                  <View style={styles.rowView}>
                    <Icon name= {this.state.locationNames[5].iconName} size={18} color="#66cc94" style ={{margin:5}}/>
                    <Text style={styles.itemTextStyle}>{this.state.locationNames[5].name}</Text>
                  </View>
                </TouchableHighlight>
            </View>


            <View style={styles.rowView}>
                <TouchableHighlight style={this.state.locationNames[6].renderStyle}
                    onPress={
                          this.handleSelectionChange.bind(this,6)
                    }>
                  <View style={styles.rowView}>
                    <Icon name= {this.state.locationNames[6].iconName} size={18} color="#66cc94" style ={{margin:5}}/>
                    <Text style={styles.itemTextStyle}>{this.state.locationNames[6].name}</Text>
                  </View>
                </TouchableHighlight>

                <TouchableHighlight style={this.state.locationNames[7].renderStyle}
                        onPress={
                              this.handleSelectionChange.bind(this, 7)
                        }>
                      <View style={styles.rowView}>
                            <Icon name= {this.state.locationNames[7].iconName} size={18} color="#66cc94" style ={{margin:5}}/>
                            <Text style={styles.itemTextStyle}>{this.state.locationNames[7].name}</Text>
                      </View>
                </TouchableHighlight>
            </View>

              <DialogInput isDialogVisible={this.state.otherDialogVisible}
                  title={"Please enter"}
                  message={""}
                  hintInput ={""}
                  multiline={true}
                  numberOfLines={4}
                  submitInput={ (inputText) =>
                  {
                        if(inputText.length>0)
                        {
                            this.props.locationSelectionHandler(inputText,true);
                        }
                        else
                        {
                            this.unselectOther();
                        }
                        this.setState({otherLocationName: inputText, otherDialogVisible: false});
                    }
                  }
                  closeDialog={ () => {
                     this.unselectOther();
                    this.setState({otherDialogVisible:false})}
                   }>
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
          borderWidth:1,
          padding:1
  },
  selectedStyle: {
        backgroundColor: "#bfd9bf",
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
    fontSize:18,
  },

});