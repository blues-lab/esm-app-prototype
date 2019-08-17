import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, ScrollView, Image,
 TextInput, Alert, FlatList, TouchableHighlight, TouchableOpacity,
 Modal, CheckBox, BackHandler} from 'react-native';
 import Icon from 'react-native-vector-icons/Fontisto';
import { ProgressDialog } from 'react-native-simple-dialogs';
import * as RNFS from 'react-native-fs';
import ElevatedView from 'react-native-elevated-view';
import Dialog from 'react-native-dialog';
import DialogInput from 'react-native-dialog-input';

import appStatus from '../controllers/appStatus';
import ServicePermissionScreen from './servicePermission'
import commonStyles from './Style'
const serviceFileAsset= 'services.js';
const serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';
import ToolBar from './toolbar'

import logger from '../controllers/logger';
import utilities from '../controllers/utilities';

const codeFileName ='servicemenu.js';

export default class ServiceMenuScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
    return {
        headerLeft: null,
        headerTitle: <ToolBar title="Service categories" progress={navigation.state.params.surveyProgress}/>,
    };
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
    firstLoad:true, //indicates whether the services are being loaded for the first time
    saveWaitVisible: false, //show progress dialog while saving survey response
  };


  openServiceDetailsPage(selectedServiceCategory)
  {
  //When clicked on a service category item, show the service-details page with the services
  // unless "No relevant service"/"None" was selected

      logger.info("ServiceMenu","OpenServiceDetailsPage", 'Opening service category:'+selectedServiceCategory.name);

      if (selectedServiceCategory.id == "None")
      {
        this.setState({noRelevantDialogVisible:true});
        return;
      }

      _serviceCategories = this.state.serviceCategories;
      _selectedIdx = 0;
      for(var i=0; i< _serviceCategories.length; i++)
      {
        if(_serviceCategories[i].name == selectedServiceCategory.name)
        {
            _selectedIdx = i;
            break;
        }
      }

      logger.info("ServiceMenu","OpenServiceDetailsPage",
                'Navigating to service details for:'+selectedServiceCategory.name+'. '+JSON.stringify(_serviceCategories[_selectedIdx]));

      this.props.navigation.navigate('ServiceDetails',
      {
          serviceCategory: _serviceCategories[_selectedIdx],
          serviceSelectionHandler: this.handleServiceSelectionChange.bind(this),
          newServiceHandler: this.createNewService.bind(this)
      });

  }

  createNewService = async (categoryName, newServiceName)=>
  {
    //create entry in the database when users enter a new service

    logger.info(codeFileName, 'createNewService', 'Category:'+categoryName+', service:'+newServiceName);

    _serviceCategoriesJS = this.state.serviceCategoriesJS;

    for(var i=0; i<_serviceCategoriesJS.length; i++)
    {
        if(_serviceCategoriesJS[i].categoryName == categoryName)
        {
            _serviceCategoriesJS[i].services.push(
                    {
                        serviceName: newServiceName,
                        selected:true
                    }
                );
            break;
        }
    }


    await this.promisedSetState({serviceCategoriesJS: _serviceCategoriesJS});
    await this.handleServiceSelectionChange(categoryName, {id:newServiceName, name:newServiceName, selected:true}, true);
    await utilities.writeJSONFile(_serviceCategoriesJS, serviceFileLocal, codeFileName, 'createNewService');
    await logger.info(codeFileName, 'createNewService', 'All selected services:'+JSON.stringify(this.getSelectedServices()));

  }

  async parseService(_fullJsonObj)
  {
    //parse json data
      _serviceCategoriesJS = _fullJsonObj;
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

    await logger.info("ServiceMenu","parseService", 'Number of categories found:'+_serviceCategories.length+'.');


    if(this.state.firstLoad) //only shuffle and add these items at the first time
    {
        logger.info(codeFileName, 'parseService', 'First time loading. Shuffling service categories.')
        _serviceCategories = this.shuffle(_serviceCategories);
        _serviceCategories.push //Add 'Other'
        (
          {
            id: 'Other',
            name: 'Other',
            selectedServiceNames: new Set([]),
            renderStyle: commonStyles.listItemStyle,
            services: []
          }
        );

        _serviceCategories.push //Add 'No relevant service'
        (
          {
            id: 'None',
            name: 'No relevant service',
            selectedServiceNames: new Set([]),
            renderStyle: commonStyles.listItemStyle,
            services: []
          }
        );
    }

      this.setState
      (
        {
          serviceCategoriesJS: _fullJsonObj,
          serviceCategories: _serviceCategories,
          firstLoad:false
        },()=>
        {logger.info("ServiceMenu","parseService", 'Service[0]:'+JSON.stringify(this.state.serviceCategories[0]));}
      )

  }

  handleServiceSelectionChange = async (categoryName, service, isNewService) =>
  {
    //Callback function sent to the service details page, and called when a service is selected.
      logger.info("ServiceMenu","handleServiceSelectionChange",
              'Category:'+categoryName+', service:'+service.name,', selected:'+service.selected);
        _serviceCategories = this.state.serviceCategories;
        for(var i=0; i< _serviceCategories.length; i++)
        {
          if(_serviceCategories[i].name == categoryName)
          {
              //add service to the selected list
              if (service.selected)
              {
                  _serviceCategories[i].selectedServiceNames.add(service.name)
              }
              else
              {
                  _serviceCategories[i].selectedServiceNames.delete(service.name);
              }

              //if existing service, mark it as selected, or create a new entry
              if(!isNewService)
              {
                  _services = _serviceCategories[i].services;
                  for(var j=0; j<_services.length; j++)
                  {
                      if(_services[j].name==service.name)
                      {
                          _services[j].selected=service.selected;
                      }
                  }
              }
              else
              {
                _serviceCategories[i].services.push(service);
              }
          }
        }

        await this.promisedSetState({serviceCategories: _serviceCategories});
       // await logger.info(codeFileName, 'handleServiceSelectionChange', 'All selected services:'+JSON.stringify(this.getSelectedServices()));
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
    return _selectedServicesJS;
  }

  loadServices()
  {
    RNFS.readFile(serviceFileLocal)
    .then((_fileContent) => {

      logger.info("ServiceMenu","ReadServiceFile", 'Successfully read:'+serviceFileLocal);
      _fullJsonObj = JSON.parse(_fileContent);
      this.parseService(_fullJsonObj);
    })  
    .catch((err) => {
      logger.info("ServiceMenu","ReadServiceFile", 'Failed to read:'+serviceFileLocal+". Err:"+err.message);
    })

  }


  promisedSetState = (newState) =>
  {
          return new Promise((resolve) =>
          {
              this.setState(newState, () => {
                  resolve()
              });
          });
  }

  constructor(props) 
  {
    super(props);

    this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
                BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        );
  }

  componentDidMount()
  {
      const { navigation } = this.props;
      const _topic = navigation.getParam('conversationTopic', '');
      _surveyResponseJS = this.state.surveyResponseJS;
      _surveyResponseJS.conversationTopic = _topic;
      this.setState({surveyResponseJS: _surveyResponseJS,
                    surveyProgress:navigation.getParam('surveyProgress', 0)});


    this.loadServices();

    this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
              BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
            );
  }

  flatListItemSeparator = () =>
  {
      return (
        <View style={{height: 0.5, width: '100%', backgroundColor: 'grey'}}/>
      );
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

  clearServiceSelections()
  {
    //clears all selected services if 'No relevant service' selected
    logger.info(codeFileName, 'clearServiceSelections', 'Clearing all selected services.')
    _serviceCategories = this.state.serviceCategories;
    for(var i=0; i< _serviceCategories.length; i++)
    {
       _serviceCategories[i].selectedServiceNames.clear();
    }
    this.setState({serviceCategories: _serviceCategories});
  }

  shuffle(a)
  {
      for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
  }

  async showPermissionPage()
  {
    //After service selection is done, show permission page for at most 3 selected services
    _services = [];
    for(var i=0; i< this.state.serviceCategories.length; i++)
    {
        _selectedServiceNames = Array.from(this.state.serviceCategories[i].selectedServiceNames);
        for(var j=0; j< _selectedServiceNames.length; j++)
        {
            _services.push
            (
                {
                    categoryName: this.state.serviceCategories[i].name,
                    serviceName: _selectedServiceNames[j]
                }
            );
        }
    }

    if(_services.length==0)
    {
        Alert.alert("Please select at least one service to continue.");
        logger.info(codeFileName, 'showPermissionPage','No service selected to show permission page. Returning.');
        return;
    }

    //logger.info(codeFileName, 'showPermissionPage','Total number of services selected:'+_services.length);

    //randomly select 3 permission pages
    _services = this.shuffle(_services);
    _services = _services.slice(0,3);

    logger.info(codeFileName, 'showPermissionPage', 'Uploading partial response.');
    //upload partial survey response
      {
          await this.promisedSetState({saveWaitVisible:true});
          _surveyResponseJS = this.state.surveyResponseJS;
          _surveyResponseJS.SelectedServices = this.getSelectedServices();
          const _appStatus  = await appStatus.loadStatus();

          const _uploaded = await utilities.uploadData(
                  {SurveyID: _appStatus.CurrentSurveyID,
                   Stage: 'Services selected.',
                   PartialResponse: _surveyResponseJS},
                  _appStatus.UUID, 'PartialSurveyResponse', codeFileName, 'showPermissionPage');
           if(!_uploaded)
           {
              logger.error(codeFileName, 'showPermissionPage',
              `Failed to upload partial response. SurveyID:${_appStatus.CurrentSurveyID}. Stage: Services selected. Response: ${JSON.stringify(_surveyResponseJS)}`);
           }

           logger.info(codeFileName, 'showPermissionPage', 'Navigating to permission page')
           await this.promisedSetState({saveWaitVisible:false, surveyResponseJS: _surveyResponseJS, surveyProgress:40});
      }

      this.props.navigation.navigate('ServicePermission', { services: _services,
                                                            surveyResponseJS: this.state.surveyResponseJS,
                                                            surveyProgress: this.state.surveyProgress});

  }

  renderListItem = ({item}) => {
    return (
        <TouchableHighlight style={{backgroundColor:'lavender'}} onPress={this.openServiceDetailsPage.bind(this, item)}>
          <View style={{flex: 1, flexDirection: 'column'}}>
            <View style={{flex: 1, flexDirection: 'row', padding:2, justifyContent:'flex-start'}}>
                {
                    item.id!='None' && item.selectedServiceNames.size===0 &&
                    <Icon name="checkbox-passive" size={20} color="grey" style ={{margin:5}}/>
                }
                {
                    item.id!='None' && item.selectedServiceNames.size>0 &&
                    <Icon name="checkbox-active" size={20} color="#66cc94" style ={{margin:5}}/>
                }
                {
                    item.id==='None' &&
                    <Icon name="radio-btn-passive" size={20} color="grey" style ={{margin:5}}/>
                }
                <Text style={{fontSize:20}}> {item.name} </Text>
            </View>
            <Text numberOfLines={1} ellipsizeMode={'tail'} style={{fontSize:14, fontStyle:'italic', padding:2, marginLeft:10, marginRight:5}}>
                {Array.from(item.selectedServiceNames).toString()}
            </Text>
          </View>
        </TouchableHighlight>
    )
  }

  render() {
    return (
    <ScrollView contentContainerStyle={{ backgroundColor:'lavender'}}>

      <View style={{
                flex: 1,
               flexDirection: 'column',
               justifyContent: 'flex-start',
               alignItems: 'stretch',
               margin:5
           }}>


            <Text style={commonStyles.questionStyle}>
              What services could MiMi offer based on your conversation?
            </Text>



        <View style={commonStyles.listContainerStyle}>
          <FlatList
            data={this.state.serviceCategories}
            ItemSeparatorComponent={this.flatListItemSeparator}
            renderItem={this.renderListItem}
            keyExtractor={(item, index) => index.toString()}
            extraData={this.state}
          />
        </View>
      </View>

       <View style={commonStyles.buttonViewStyle}>
          <TouchableHighlight style ={commonStyles.buttonTouchHLStyle}>
              <Button title="Next"
                  color="#20B2AA"
                  onPress={async () =>
                      {
                          //Alert.alert("Hi");
                          await this.showPermissionPage();
                      }
                  }
              />
          </TouchableHighlight>

      </View>

      <DialogInput isDialogVisible={this.state.newCategoryDialogVisible}
          title={"What other service?"}
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
                }}
        />
        <Dialog.Button label="Cancel" onPress={ () => {
                this.setState({noRelevantDialogVisible: false,
                    noRelevantServiceReason: this.state.surveyResponseJS.noRelevantServiceReason
                });
            }}
        />
        <Dialog.Button label="Next" onPress={async () => {
                _surveyResponseJS = this.state.surveyResponseJS;
                _surveyResponseJS.noRelevantServiceReason = this.state.noRelevantServiceReason;
                this.clearServiceSelections();
                logger.info("ServiceMenu","DialogInput.Submit", "Reason for no relevant service: "+this.state.noRelevantServiceReason);

                this.setState({noRelevantDialogVisible: false, surveyResponseJS: _surveyResponseJS});

                if(this.state.surveyResponseJS.noRelevantServiceReason.length>0)
                {
                      //upload partial survey response
                      {
                          this.setState({saveWaitVisible:true});
                          const _appStatus  = await appStatus.loadStatus();
                          logger.info(codeFileName, 'NoRelevantService.SaveButton.onPress', 'Uploading partial response.');
                          const _uploaded = await utilities.uploadData(
                                  {SurveyID: _appStatus.CurrentSurveyID,
                                   Stage: 'No relevant service selected.',
                                   PartialResponse: _surveyResponseJS},
                                  _appStatus.UUID, 'PartialSurveyResponse', codeFileName, 'NextButtonPress');
                           if(!_uploaded)
                           {
                              logger.error(codeFileName, 'NoRelevantService.SaveButton.onPress',
                              `Failed to upload partial response. SurveyID:${_appStatus.CurrentSurveyID}. Stage: No relevant service selected. Response: ${JSON.stringify(_surveyResponseJS)}`);
                           }
                           this.setState({saveWaitVisible:false});
                      }

                    logger.info(codeFileName,'NextButtonPress','Navigating to ContextualQuestion page.')
                    this.props.navigation.navigate('ContextualQuestion',
                                                   {
                                                     surveyResponseJS: this.state.surveyResponseJS,
                                                     surveyProgress: 80
                                                   });
                }
            }}
        />
      </Dialog.Container>

      <ProgressDialog
        visible={this.state.saveWaitVisible}
        title="MiMi"
        message="Saving response. Please, wait..."
      />

      </ScrollView>

    );
  }

  componentWillUnmount()
  {
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
  }

onBackButtonPressAndroid = () =>
{
    //this.handleBackNavigation();
    //Alert.alert("Back pressed!");
    //this.props.navigation.goBack(null);
    return true;
};
}


const styles = StyleSheet.create({

  selectedItemStyle: {
      backgroundColor: "#9dd7fb",
      padding: 10,
      height: 60,
  }

});