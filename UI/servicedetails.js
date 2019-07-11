import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, 
  TextInput, Alert, FlatList, ScrollView, TouchableHighlight} from 'react-native';
import * as RNFS from 'react-native-fs';
import DialogInput from 'react-native-dialog-input';

import logger from '../controllers/logger';

import commonStyles from './Style'
const serviceFileAsset= 'services.js';
const serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';


const selectionText = "Selected (tap again to remove)";
const codeFileName = "serviceDetails.js"

export default class ServiceDetailsScreen extends React.Component {

  static navigationOptions = {
    title: 'Services',
  };

  state = {
    serviceCategory: {}, //contains the whole category object passed by parent
    serviceCategoryName: '', //contains the category name
    serviceNames: [], //contains parsed services
    isAddServiceDialogVisible:false,
  };

  FlatListItemSeparator = () => 
  {
    return (
      //Item Separator
      <View style={{height: 0.5, width: '100%', backgroundColor: '#C8C8C8'}}/>
    );
  }

  GetItem(item)
  {
    //Function for click on an item
    //Alert.alert(item);
  }

  constructor(props) 
  {
    super(props);
  }

  parseServiceNames(serviceCategory)
  {
    // load service names in array from service category object passed by parent
    _serviceNames = [];
    _services = serviceCategory.services;
    for (var i=0; i< _services.length; i++)
    {
        _serviceNames.push
        (
          { id: _services[i].name,
            name: _services[i].name,
            selected: _services[i].selected,
            description: _services[i].selected ? this.selectionText : "",
            renderStyle: commonStyles.listItemStyle
          }
        );
    }

    return _services;
  }

  componentDidMount()
  {
    const { navigation } = this.props;
    const _serviceCategory = navigation.getParam('serviceCategory', 'NO-SERVICE');
    this.setState({serviceCategory: _serviceCategory,
                   serviceCategoryName: _serviceCategory.name,
                   serviceNames: this.parseServiceNames(_serviceCategory)
                 });
  }

  handleServiceSelection = (selectedServiceName) => {
    _serviceNames = this.state.serviceNames;
    for(var i=0; i< _serviceNames.length; i++)
    {
        if(_serviceNames[i].name == selectedServiceName )
        {
            _serviceNames[i].selected = !_serviceNames[i].selected;

            if (_serviceNames[i].selected)
            {
                _serviceNames[i].description = selectionText;
                _serviceNames[i].renderStyle = styles.selectedItemStyle;
            }
            else
            {
                _serviceNames[i].description = "";
                _serviceNames[i].renderStyle = commonStyles.listItemStyle;
            }

            //call parent component to update service selections
            this.props.navigation.state.params.serviceSelectionHandler(
                        this.state.serviceCategoryName, _serviceNames[i]);

            break;
        }
    }

    logger.info(`${codeFileName}`,"handleServiceSelection",
        `Parameter:${selectedServiceName}.Services:${JSON.stringify(_serviceNames)}`);

    this.setState({serviceNames: _serviceNames});

  }

  renderListItem = ({item}) => {
      return (
          <TouchableHighlight onPress={this.handleServiceSelection.bind(this, item.name)}>
            <View style={item.renderStyle}>
              <Text style={{fontSize:20}}>
                {item.name}
              </Text>
              <Text style={{fontSize:12, fontStyle:'italic', paddingBottom:10, marginBottom:20}}>
                {item.description}
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
              justifyContent: 'flex-start',
              alignItems: 'stretch',
            }}>

            <View style={commonStyles.listContainerStyle}>
              <FlatList
                data={this.state.serviceNames}
                ItemSeparatorComponent={this.FlatListItemSeparator}
                renderItem={this.renderListItem}
                keyExtractor={(item, index) => index.toString()}
                extraData={this.state}
              />
            </View>
            <Button title="Add new"
                onPress={() => {
                                    logger.info(`${codeFileName}`,"AddNewServiceButton.onPress",
                                        'Opening dialog to add new service' );
                                    this.setState({isAddServiceDialogVisible:true});
                               }
                        }
            />

            <DialogInput isDialogVisible={this.state.isAddServiceDialogVisible}
                title={"Enter new service"}
                message={""}
                hintInput ={""}
                submitInput={ (inputText) =>
                  {
                    serviceNames = this.state.serviceNames;
                    serviceNames.push
                    (
                      {id: inputText,
                        value: inputText }
                    );

                    logger.info(`${codeFileName}`,"DialogInput.NewService",
                            `Newly added service name:${inputText}`);
                    this.setState({serviceNames:serviceNames, isAddServiceDialogVisible:false});
                  }
                }
                closeDialog={ () => {
                        logger.info(`${codeFileName}`,"DialogInput.NewService.Close",'Canceled' )
                        this.setState({isAddServiceDialogVisible:false});
                    }}>
            </DialogInput>

          </View>

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