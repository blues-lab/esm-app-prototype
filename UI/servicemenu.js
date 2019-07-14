import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, ScrollView, Image,
 TextInput, Alert, FlatList, TouchableHighlight, TouchableOpacity,
 Modal, CheckBox} from 'react-native';

import * as RNFS from 'react-native-fs';
import ElevatedView from 'react-native-elevated-view';
import Dialog from 'react-native-dialog';
import DialogInput from 'react-native-dialog-input';


import ServicePermissionScreen from './servicePermission'
import commonStyles from './Style'
const serviceFileAsset= 'services.js';
const serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';


import logger from '../controllers/logger';


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
    permissionModalVisible:false,
    permissionResponses: [],    //array to hold permission responses for each of the selected services
    permissionPages: [], //used to navigate to the permission page
    permissionPageIdx: -1,
    noRelevantServiceReason: '',
    surveyResponseJS:{},             //Hold participants responses
    activeServiceCategoryName:null,
    activeServiceName:null,
  };


  OpenServiceDetailsPage(selectedServiceCategoryName) //Function for click on a service category item
  {
      logger.info("ServiceMenu","OpenServiceDetailsPage", 'Opening service category:'+selectedServiceCategoryName);
      _serviceCategories = this.state.serviceCategories;
      for(var i=0; i< _serviceCategories.length; i++)
      {
        if(_serviceCategories[i].name == selectedServiceCategoryName)
        {
            logger.info("ServiceMenu","OpenServiceDetailsPage", 'Navigating to service details for:'+selectedServiceCategoryName);
            this.props.navigation.navigate('ServiceDetails',
            {
                serviceCategory: _serviceCategories[i],
                serviceSelectionHandler: this.handleServiceSelectionChange.bind(this)
            });
            break;
        }
      }

  }

  getSelectedServices()
  {
    //Convert selected services in JSON format
    _selectedServicesJS = []
    _serviceCategories = this.state.serviceCategories;
    for(var i=0; i< _serviceCategories.length; i++)
    {
       if(_serviceCategories[i].selectedServiceNames.size>0)
        {
            _selectedServicesJS.push({
                "category": _serviceCategories[i].name,
                'services': Array.from(_serviceCategories[i].selectedServiceNames)}
            );
        }
    }
  }


  ReadServiceFile()
  {
    RNFS.readFile(serviceFileLocal)
    .then((_fileContent) => {

    logger.info("ServiceMenu","ReadServiceFile", 'Successfully read:'+serviceFileLocal);

      _serviceCategoriesJS = JSON.parse(_fileContent).serviceCategories;
      _serviceCategories=[];
      for(var i=0; i< _serviceCategoriesJS.length; i++)
      {
        _servicesJS = _serviceCategoriesJS[i].services;
        _services = [];
        for(var j=0; j< _servicesJS.length; j++)
        {
            _services.push
            (
                {
                    id: _servicesJS[j].serviceName,
                    name: _servicesJS[j].serviceName,
                    selected: false
                }
            );
        }
        _serviceCategories.push
        (
          {
            id: _serviceCategoriesJS[i].categoryName,
            name: _serviceCategoriesJS[i].categoryName,
            selectedServiceNames: new Set([]),
            renderStyle: commonStyles.listItemStyle,
            services: _services
          }
        );
      }

      logger.info("ServiceMenu","ReadServiceFile", 'Number of categories found:'+_serviceCategories.length);

      this.setState
      (
        {
          serviceCategoriesJS: _serviceCategoriesJS,
          serviceCategories: _serviceCategories
        }
      );

    })  
    .catch((err) => {
      logger.info("ServiceMenu","ReadServiceFile", 'Failed to read:'+serviceFileLocal+". Err:"+err.message);
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

  handleServiceSelectionChange = (categoryName, service) =>
  {

    logger.info("ServiceMenu","handleServiceSelectionChange",
            'Selected category:'+categoryName+', service:'+service.name);
      _serviceCategories = this.state.serviceCategories;
      for(var i=0; i< _serviceCategories.length; i++)
      {
        if(_serviceCategories[i].name == categoryName)
        {
            if (service.selected)
            {
                _serviceCategories[i].selectedServiceNames.add(service.name)
            }
            else
            {
                _serviceCategories[i].selectedServiceNames.delete(service.name);
            }
        }
      }

      this.setState({serviceCategories: _serviceCategories})
  }

  enableDisableNextButton()
  {
    //enable the next button if
    // --at least one selected service OR
    // --entered reason for no relevant service


    _serviceCategories = this.state.serviceCategories;
    for(var i=0; i<_serviceCategories.length; i++)
    {
        _services= _serviceCategories[i].services;
        for(var j=0; j< _services.length; i++)
        {
            if(_services[j].selected)
            {
                this.setState({saveButtonEnabled: true});
                return;
            }
        }
    }

    this.setState({saveButtonEnabled: true});
  }


  savePermissionResponse(response)
  {
     _permissionResponses = this.state.permissionResponses;
     _permissionResponses.push(response);
     this.setState({permissionResponses: _permissionResponses});
     //if more services to ask permission, (+1 is required since state is updated async)
     if(this.state.permissionPageIdx+1 < this.state.permissionPages.length)
     {
        this.setState({permissionModalVisible: false}, ()=>
                this.showPermissionPage());
     }
     else //otherwise, go to the contextual question page
     {
        //add permission responses to the survey response
        _surveyResponseJS = this.state.surveyResponseJS;
        _surveyResponseJS.PermissionResponses = _permissionResponses;

        this.setState({permissionModalVisible: false, _surveyResponseJS: _surveyResponseJS}, ()=>
            this.props.navigation.navigate('ContextualQuestion',
                {surveyResponseJS: this.state.surveyResponseJS}));
     }
  }

  showPermissionPage()
  {

     _permissionPages = this.state.permissionPages;

    if(this.state.permissionPageIdx == -1)
    {
        for(var i=0; i< this.state.serviceCategories.length; i++)
        {
            _services = Array.from(this.state.serviceCategories[i].selectedServiceNames);
            for(var j=0; j< _services.length; j++)
            {
                _permissionPages.push
                (
                    {
                        categoryName: this.state.serviceCategories[i].name,
                        serviceName: _services[j]
                    }
                );
            }
        }
        this.setState({permissionPages: _permissionPages});
    }

    if(_permissionPages.length==0)
    {
        Alert.alert("Please select at least one service to continue.");
        return;
    }

    _permissionPageIdx = this.state.permissionPageIdx+1;

    if(_permissionPageIdx < _permissionPages.length)
    {
        this.setState({permissionPageIdx: _permissionPageIdx,
                       activeServiceCategoryName: _permissionPages[_permissionPageIdx].categoryName,
                       activeServiceName: _permissionPages[_permissionPageIdx].serviceName,
                       permissionModalVisible: true});
    }
  }

  renderListItem = ({item}) => {
    img= require('../res/unchecked.png');
    selected=false;
    if(item.selectedServiceNames.size>0)
    {
        img= require('../res/checked.png');
        selected=true;
    }
    return (
        <TouchableHighlight onPress={this.OpenServiceDetailsPage.bind(this, item.name)}>
          <View style={{flex: 1, flexDirection: 'column'}}>
            <View style={{flex: 1, flexDirection: 'row'}}>
                <Image
                    style={{width: 30, height:30, resizeMode : 'contain' , margin:1}}
                    source={img}
                />
                <Text style={{fontSize:20}}>
                    {item.name}
                </Text>
            </View>
            <Text style={{fontSize:12, fontStyle:'italic', marginLeft:10}}>
                {Array.from(item.selectedServiceNames).toString()}
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

            <View style={commonStyles.buttonViewStyle}>
                  <TouchableHighlight style ={commonStyles.buttonTouchHLStyle}>
                        <Button title="Add new"
                            color="#20B2AA"
                            onPress={() => this.setState({newCategoryDialogVisible:true})}
                        />
                  </TouchableHighlight>

                  <TouchableHighlight style ={commonStyles.buttonTouchHLStyle}>
                      <Button disabled = {!this.state.saveButtonEnabled}
                        onPress={this.showPermissionPage.bind(this)}
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
                  name: inputText,
                  selectedServiceNames: new Set([]),
                  renderStyle: commonStyles.listItemStyle,
                  services: []
                }
              );

              logger.info("ServiceMenu","DialogInput.Submit", "Adding new service category: "+inputText);

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
            value={this.state.noRelevantServiceReason}
            onChangeText={(reason) => {
                  this.setState({ noRelevantServiceReason: reason});
                  logger.info("ServiceMenu","DialogInput.Submit", "No relevant service: "+reason);
                }}
        />
        <Dialog.Button label="Cancel" onPress={ () => {
                this.setState({noRelevantDialogVisible: false,
                    noRelevantServiceReason: this.state.surveyResponseJS.noRelevantServiceReason
                });
            }}
        />
        <Dialog.Button label="Save" onPress={() => {
                _surveyResponseJS = this.state.surveyResponseJS;
                _surveyResponseJS.noRelevantServiceReason = this.state.noRelevantServiceReason;
                this.setState({noRelevantDialogVisible: false, surveyResponseJS: _surveyResponseJS});

                if(this.state.surveyResponseJS.noRelevantServiceReason.length>0)
                {
                    logger.info("ServiceMenu","SaveButton.onPress", "Navigating to contextual question page.");
                    this.props.navigation.navigate('ContextualQuestion',
                                                    {surveyResponseJS: this.state.surveyResponseJS});
                }
            }}
        />
      </Dialog.Container>

      <Modal visible = {this.state.permissionModalVisible}>
        <ServicePermissionScreen
            serviceName = {this.state.activeServiceName}
            serviceCategoryName= {this.state.activeServiceCategoryName}
            callBack = {this.savePermissionResponse.bind(this)}
            extraData= {this.state}
        />
      </Modal>

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