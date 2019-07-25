import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert} from 'react-native';
import * as RNFS from 'react-native-fs';
import wifi from 'react-native-android-wifi';
import logger from './logger';

const codeFileName = 'utilities.js';


class Utilities extends Component
{
    serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';

   getWifiName()
   {
       _ssid = '';
       wifi.isEnabled((isEnabled) => {
         if (isEnabled)
         {
           wifi.connectionStatus((isConnected) => {
             if (isConnected) {
                 wifi.getSSID((ssid) => {
                   this.setState({msg: "Connected: "+ssid});
                   _ssid = ssid;
                 });
               } else {
                 this.setState({msg: "Not connected!"});
             }
           });

           this.setState({msg: "Wifi is enabled!"});
         }
         else
         {
           this.setState({msg: "Wifi not enabled!"});
         }
       });
       return _ssid;
   }


    async writeJSONFile(content, fileName, callerClass, callerFunc)
    {
        //if there is an existing file, create a backup first

         if (await RNFS.exists(fileName))
         {
             logger.info(`${callerClass}`, `${callerFunc}-->writeJSONFile`, 'File already exists.');

             RNFS.copyFile(fileName, fileName+'.backup')
                 .then( (success) => {
                     logger.info(`${callerClass}`, `${callerFunc}-->writeJSONFile`, 'Backed up existing file.');

                     RNFS.writeFile(fileName, JSON.stringify(content))
                         .then( (success) => {
                             logger.info(`${callerClass}`, `${callerFunc}-->writeJSONFile`, 'Created new file.');
                               RNFS.unlink(fileName+'.backup')
                                   .then(() => {
                                     logger.info(`${callerClass}`, `${callerFunc}-->writeJSONFile`, 'Deleted old file.');
                                   })
                                   // `unlink` will throw an error, if the item to unlink does not exist
                                   .catch((err) => {
                                      logger.error(`${callerClass}`, `${callerFunc}-->writeJSONFile`, 'Failed to delete backup file:'+error.message);
                                   });
                         })
                         .catch( (error)=>{
                             logger.error(`${callerClass}`, `${callerFunc}-->writeJSONFile`,'Error in creating new file:'+error.message+'. Restoring backup.');

                             RNFS.copyFile(fileName+'.backup', fileName)
                                 .then( (success)=> {
                                     logger.info(`${callerClass}`, `${callerFunc}-->writeJSONFile`, 'Restored backup file.');
                                 })
                                 .catch( (error)=>{
                                     logger.error(`${callerClass}`, `${callerFunc}-->writeJSONFile`, 'Failed to Restore backup file:'+error.message);
                                 })

                         })
                 })
                 .catch( (error) => {
                     logger.error(`${codeFileName}`, `${callerFunc}-->writeJSONFile`, 'Error backing up file:'+error.message);
                 })
         }
         else
         {
            RNFS.writeFile(fileName, JSON.stringify(content))
                 .then( (success) => {
                     logger.info(`${callerClass}`, `${callerFunc}-->writeJSONFile`, 'Created new file: '+fileName);
                 })
                 .catch( (error)=>{
                      logger.error(`${callerClass}`, `${callerFunc}-->writeJSONFile`, 'Failed to create file:'+error.message);
                  })
         }
    }

    async readJSONFile(filePath, callerClass, callerFunc)
    {

         if (await RNFS.exists(filePath))
         {
            logger.info(`${callerClass}`, `${callerFunc}-->readJSONFile`, 'Reading file:'+filePath);
             RNFS.readFile(filePath)
                 .then((_fileContent) => {
                    logger.info(`${callerClass}`, `${callerFunc}-->readJSONFile`, 'Successfully read file.');
                     return _fileContent;
                 })
                 .catch( (error)=>{
                       logger.error(`${callerClass}`, `${callerFunc}-->readJSONFile`, 'Failed to read file:'+error.message);
                   })

         }
         else
         {
            logger.info(`${callerClass}`, `${callerFunc}-->readJSONFile`, 'Reading file:'+filePath+' does not exist');
         }

         return null;
    }

    readServiceFile()
    {
        _serviceCategories=[];

        RNFS.readFile(this.serviceFileLocal)
            .then((_fileContent) => {

              logger.info(`${codeFileName}`,"ReadServiceFile", 'Successfully read:'+this.serviceFileLocal);

              _serviceCategoriesJS = JSON.parse(_fileContent).serviceCategories;
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
                    services: _services
                  }
                );
              }

              logger.info(`${codeFileName}`,"ReadServiceFile", 'Number of categories found:'+_serviceCategories.length);

              return _serviceCategories;
            })
            .catch((err) => {
              logger.info(`${codeFileName}`,"ReadServiceFile", 'Failed to read:'+this.serviceFileLocal+". Err:"+err.message);
              return _serviceCategories;
            })

    }


}
const utilities = new Utilities();
export default utilities;