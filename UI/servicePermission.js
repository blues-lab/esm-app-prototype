import React, {Component} from 'react';
import { Platform, StyleSheet, Text, View, Button,
        TextInput, Alert, FlatList, Modal, ScrollView,
        TouchableHighlight, BackHandler} from 'react-native';
import * as RNFS from 'react-native-fs';
//import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';
import { RadioButton } from 'react-native-paper';
import DialogInput from 'react-native-dialog-input';

import logger from '../controllers/logger';

const codeFileName="servicePermission.js";
const serviceFileAsset= 'services.js';
const serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';

import commonStyle from './Style'
import ToolBar from './toolbar'

const fullShare= 'fullShare';
const partialShare= 'partialShare';
const noShare = 'noShare';

 var radioOptions = [
    {label: 'Yes, I will allow access to any relevant parts of the conversation', value: fullShare },
    {label: 'I will only allow access if I could censor certain parts of the relevant conversation', value: partialShare },
    {label: 'No, I will not allow access to any relevant parts of the conversation', value: noShare}
  ];

export default class ServicePermissionScreen extends React.Component
{

// static navigationOptions = {
//      headerLeft: null,
//      headerTitle: <ToolBar title="Permission" progress={70}/>
//    };
static navigationOptions = ({ navigation }) => {
    return {
        headerLeft: null,
        headerTitle: <ToolBar title="Permission" progress={navigation.state.params.surveyProgress}/>,
    };
  };

  state= {  serviceName:"NO-SERVICE",
            sharingDecision:fullShare,
            whyNoShare: '',
            whyPartShare: '',
            partsToRedact:'',
            value: fullShare,
         }


  constructor(props) 
  {
    super(props);
  }

  componentDidMount()
  {
      const { navigation } = this.props;
      const _categoryName = navigation.getParam('serviceCategoryName', 'NO-SERVICE');
      const _serviceName = navigation.getParam('serviceName', 'NO-SERVICE');

    this.setState({categoryName: _categoryName, serviceName: _serviceName});
  }

  saveResponse()
  {
       _permissionResponse= {
          "ServiceCategory": this.state.categoryName,
          "ServiceName": this.state.serviceName,
          "Sharing": this.state.value,
          "PartsToRedact": this.state.partsToRedact,
          "WhyPartShare": this.state.whyPartShare,
          "WhyNoShare": this.state.whyNoShare,
       }
       logger.info(`${codeFileName}`,'saveResponse',"Response: "+JSON.stringify(_permissionResponse));
       //this.props.callBack(_permissionResponse);
       this.props.navigation.state.params.permissionResponseHandler(_permissionResponse);
       this.props.navigation.goBack(null);
  }

  render() {
    return (

    <ScrollView>
      <View style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginRight:10,
          marginLeft:10,
          backgroundColor:'lavendar',
          }}>

          <Text style={[commonStyle.questionStyle,{fontSize:22}]}>

            Would you allow MiMi to access the relevant parts of
            the conversation to provide you the service "{this.state.serviceName}"?
          </Text>
          <View style={{flex:1, flexDirection:'column', justifyContent:'center', alignItems:'flex-start', margin:10}}>
          <RadioButton.Group
               onValueChange={value => this.setState({ value})}
               value={this.state.value}
             >
               <View style={{flex:1, flexDirection:'row', justifyContent:'flex-start',alignItems:'flex-start'}}>
                 <RadioButton value='fullShare' />
                 <Text style={{fontSize:20}}>
                    Yes, I will allow access to any relevant parts of the conversation.
                 </Text>
               </View>
               <View style={{flex:1, flexDirection:'row', justifyContent:'flex-start',alignItems:'flex-start'}}>
                 <RadioButton value='partialShare'/>
                 <Text style={{fontSize:20}}>
                    I will only allow access if I could censor certain parts of the relevant conversation.
                 </Text>
               </View>
               <View style={{flex:1, flexDirection:'row', justifyContent:'flex-start',alignItems:'center'}}>
                <RadioButton value='noShare'/>
                <Text style={{fontSize:20}}>
                    No, I will not allow access to any relevant parts of the conversation.
                </Text>
              </View>
          </RadioButton.Group>
          </View>

          { (this.state.value == partialShare) &&
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={commonStyle.questionStyle}>
                    What parts would you not allow the device to access?
                </Text>
                <TextInput multiline={true} numberOfLines={4} style={commonStyle.inputStyle}
                    onChangeText={(text) => this.setState({ partsToRedact: text })}
                    value={this.state.partsToRedact}
                />

                <Text style={commonStyle.questionStyle}>
                    Why would you not allow the device to access these parts?
                </Text>
                 <TextInput multiline={true} numberOfLines={4} style={commonStyle.inputStyle}
                    onChangeText={(text) => this.setState({ whyPartShare: text })}
                    value={this.state.whyPartShare}
                />
            </View>
          }

          { (this.state.value == noShare) &&
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={commonStyle.questionStyle}>
                    Why would you not allow to access the relevant conversation?
                </Text>
                <TextInput multiline={true} numberOfLines={4} style={commonStyle.inputStyle}
                    onChangeText={(text) => this.setState({ whyNoShare: text })}
                    value={this.state.whyNoShare}
                />
            </View>
          }
      </View>

      <View style={commonStyle.buttonViewStyle}>
          <TouchableHighlight style ={commonStyle.buttonTouchHLStyle}>
            <Button
              onPress={() => {
                    this.saveResponse();
                    //this.props.navigation.goBack();
                }
              }
              title="Next"
              color="#20B2AA"
              accessibilityLabel="Next"
            />
          </TouchableHighlight>
      </View>

    </ScrollView>

    );
  }
}

const styles = StyleSheet.create({

});