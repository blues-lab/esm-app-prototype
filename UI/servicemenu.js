import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, ScrollView, Image,
 TextInput, Alert, FlatList, TouchableHighlight, TouchableOpacity,
 Modal} from 'react-native';

import * as RNFS from 'react-native-fs';
import ElevatedView from 'react-native-elevated-view';
import Dialog from 'react-native-dialog';
import DialogInput from 'react-native-dialog-input';


import ServicePermissionScreen from './servicePermission'
import commonStyles from './Style'
const serviceFileAsset= 'services.js';
const serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';


export default class ServiceMenuScreen extends React.Component {

  static navigationOptions = {
    title: 'Service categories',
  };

  state = {
    serviceCategoriesJS: '',        //JSON object loaded from file and then parsed
    serviceCategories: [],          //Parsed service categories in an array
    newCategoryDialogVisible:false,
    noRelevantDialogVisible:false,
    saveButtonEnabled:true,
    modalVisible:false,
    activeServiceName: "",           //Name of the currently selected service category
    surveyResponseJS:{},             //Hold participants responses
  };


  OpenServiceDetailsPage(selectedServiceCategoryName) //Function for click on a service category item
  {
      _serviceCategoriesJS = this.state.serviceCategoriesJS;
      for(var i=0; i< _serviceCategoriesJS.length; i++)
      {
        if(_serviceCategoriesJS[i].categoryName == selectedServiceCategoryName)
        {
            this.props.navigation.navigate('ServiceDetails',
            {
                serviceCategory: _serviceCategoriesJS[i],
                serviceSelectionHandler: this.handleServiceSelectionChange.bind(this)
            });
            break;
        }
      }

  }


  ReadServiceFile()
  {
    RNFS.readFile(serviceFileLocal)
    .then((_fileContent) => {

      _serviceCategoriesJS = JSON.parse(_fileContent).serviceCategories;
      _serviceCategories=[];
      for(var i=0; i< _serviceCategoriesJS.length; i++)
      {
        _serviceCategories.push
        (
          { id: _serviceCategoriesJS[i].categoryName,
            value: _serviceCategoriesJS[i].categoryName,
            selectedServices: [],
            renderStyle: commonStyles.listItemStyle
          }
        );
      }

      this.setState
      (
        {
          serviceCategoriesJS: _serviceCategoriesJS,
          serviceCategories: _serviceCategories
        }
      );

    })  
    .catch((err) => {
      Alert.alert("Error: "+err.code,err.message);
      //TODO: handle error
    })

  }

  constructor(props) 
  {
    super(props);
  }

  componentDidMount()
  {
    this.ReadServiceFile();
  }

  flatListItemSeparator = () =>
  {
      return (
        <View style={{height: 0.5, width: '100%', backgroundColor: '#C8C8C8'}}/>
      );
  }

  handleServiceSelectionChange = (service) =>
  {
    //Callback function to be invoked by service details when a service is (de) selected
    Alert.alert("from child:"+service.name);
  }

  renderListItem = ({item}) => {
    return (
        <TouchableHighlight onPress={this.OpenServiceDetailsPage.bind(this, item.value)}>
          <View style={item.renderStyle}>
            <Text style={{fontSize:20}}>
              {item.value}
            </Text>
            <Text style={{fontSize:12, fontStyle:'italic', paddingBottom:10, marginBottom:20}}>
                {item.selectedServices.toString()}
            </Text>
          </View>
        </TouchableHighlight>
    )
  }

  render() {
    return (
    <ScrollView>

      <View style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-around',
          alignItems: 'stretch',
          backgroundColor:'lavender'
        }}>

        <View style={commonStyles.longTextView}>
            <Text style={commonStyles.longtextStyle}>
              Imagine an always-listening voice assistant called Mimi
              recorded an audio when you were talking. Please select all
              services that are <Text style={{fontWeight: "bold"}}>relevant</Text> to this
              audio recording that could provide to you.
              You can also add new services.
            </Text>
        </View>


        <View style={commonStyles.listContainerStyle}>
          <FlatList
            data={this.state.serviceCategories}
            ItemSeparatorComponent={this.flatListItemSeparator}
            renderItem={this.renderListItem}
            keyExtractor={(item, index) => index.toString()}
            extraData={this.state}
          />
        </View>


        <View style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            marginTop:2,
            marginBottom:2
        }}>

            <View style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop:2,
              marginBottom:2
              }}>
                  <TouchableHighlight style ={commonStyles.buttonTouchHLStyle}>
                        <Button title="Add new"
                            color="#20B2AA"
                            onPress={() => this.setState({newCategoryDialogVisible:true})}
                        />
                  </TouchableHighlight>

                  <TouchableHighlight style ={commonStyles.buttonTouchHLStyle}>
                      <Button disabled = {!this.state.saveButtonEnabled}
                        onPress={() => this.props.navigation.navigate('ServicePermission',
                                            {serviceName:this.state.activeServiceName})}
                        title="Next"
                        color="#20B2AA"
                        accessibilityLabel="Next"
                      />
                  </TouchableHighlight>
            </View>

            <Button
              title="No relevant service"
              color="#D8BFD8"
              onPress={() => this.setState({noRelevantDialogVisible:true})}
            />
        </View>

      </View>

      <DialogInput isDialogVisible={this.state.newCategoryDialogVisible}
          title={"Add new service category"}
          message={""}
          hintInput ={""}
          multiline={true}
          numberOfLines={4}
          submitInput={ (inputText) =>
            {
              _serviceCategories= this.state.serviceCategories;
              _serviceCategories.push
              (
                { id: inputText,
                  value: inputText }
              );

              this.setState({serviceCategories: _serviceCategories, newCategoryDialogVisible:false});
            }
          }
          closeDialog={ () => {this.setState({newCategoryDialogVisible:false})}}>
      </DialogInput>

      <Dialog.Container visible={this.state.noRelevantDialogVisible}>
        <Dialog.Title>Please explain why no service would be relevant in this situation.</Dialog.Title>
        <Dialog.Input
            multiline={true}
            numberOfLines={4}
            style={{height: 300, borderColor: 'lightgray', borderWidth: 1}}
        />
        <Dialog.Button label="Cancel" onPress={ () => {
            this.setState({ noRelevantDialogVisible: false })
            }}
        />
        <Dialog.Button label="Save" onPress={() => {
            this.setState({ noRelevantDialogVisible: false })
            }}
        />
      </Dialog.Container>

      </ScrollView>

    );
  }
}


const styles = StyleSheet.create({

  selectedItemStyle: {
      backgroundColor: "#9dd7fb",
      padding: 10,
      height: 60,
  }

});