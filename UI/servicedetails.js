import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, 
  TextInput, Alert, FlatList, ScrollView, TouchableHighlight} from 'react-native';
import * as RNFS from 'react-native-fs';
import DialogInput from 'react-native-dialog-input';

import commonStyles from './Style'
const serviceFileAsset= 'services.js';
const serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';


const selectionText = "Selected (tap again to remove)";

export default class ServiceDetailsScreen extends React.Component {

  static navigationOptions = {
    title: 'Services',
  };

  state = {
    serviceCategoryJS: {},
    serviceNames: [],
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

  parseServiceNames(servicesJS)
  {
    // load service names in array from JSON object passed by parent
    _serviceNames = []
    for (var i=0; i< servicesJS.length; i++)
    {
        _serviceNames.push
        (
          { id: servicesJS[i].serviceName,
            name: servicesJS[i].serviceName,
            selected: servicesJS[i].selected,
            description: servicesJS[i].selected ? this.selectionText : "",
            renderStyle: commonStyles.listItemStyle
          }
        );
    }

    return _serviceNames;
  }

  componentDidMount()
  {
    const { navigation } = this.props;
    const _serviceCategoryJS = navigation.getParam('serviceCategory', 'NO-SERVICE');
    this.setState({serviceCategoryJS: _serviceCategoryJS,
                   serviceCategoryName: _serviceCategoryJS.categoryName,
                   serviceNames: this.parseServiceNames(_serviceCategoryJS.services)
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
            this.props.navigation.state.params.serviceSelectionHandler(_serviceNames[i]);

            break;
        }
    }

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
                onPress={() => this.setState({isAddServiceDialogVisible:true})}
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

                    this.setState({serviceNames:serviceNames, isAddServiceDialogVisible:false});
                  }
                }
                closeDialog={ () => {this.setState({isAddServiceDialogVisible:false})}}>
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