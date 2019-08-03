import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, AsyncStorage, Alert} from 'react-native';
import * as RNFS from 'react-native-fs';
import wifi from 'react-native-android-wifi';
import logger from './logger';

import {VERSION_NUMBER} from './constants'

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

   async fileExists(path, fileName, callerClass, callerFunc)
   {
        logger.info(`${callerClass}`, `${callerFunc}-->fileExists`, 'Checking if file exists:'+fileName);
        if (await RNFS.exists(path))
        {
            return true;
        }
        return false;

   }

    async writeJSONFile(content, fileName, callerClass, callerFunc)
    {
        //NOTE: send JSON object to write, DO NOT stringify

        //if there is an existing file, create a backup first
         if (await RNFS.exists(fileName))
         {
             logger.info(`${callerClass}`, `${callerFunc}-->writeJSONFile`, 'File already exists.');

             RNFS.copyFile(fileName, fileName+'.backup')
                 .then( (success) => // 1S
                 {
                     logger.info(`${callerClass}`, `${callerFunc}-->writeJSONFile`, 'Created backup copy of the file.');

                     RNFS.writeFile(fileName, JSON.stringify(content))
                         .then( (success) => // 2S
                         {
                             logger.info(`${callerClass}`, `${callerFunc}-->writeJSONFile`, 'Wrote new content in the original file.');

                             RNFS.writeFile(fileName, JSON.stringify(content))
                                 .then( (success) => // 2S
                                 {
                                       logger.info(`${callerClass}`, `${callerFunc}-->writeJSONFile`, 'Created new file.');
                                       RNFS.unlink(fileName+'.backup')
                                           .then(() => // 3S
                                           {
                                             logger.info(`${callerClass}`, `${callerFunc}-->writeJSONFile`, 'Deleted backup file.');
                                           })
                                           // `unlink` will throw an error, if the item to unlink does not exist
                                           .catch((error) => //3E
                                           {
                                              logger.error(`${callerClass}`, `${callerFunc}-->writeJSONFile`, 'Failed to delete backup file:'+error.message);
                                           });
                                 })
                                 .catch( (error)=> // 2E
                                 {
                                     logger.error(`${callerClass}`, `${callerFunc}-->writeJSONFile`,'Error in creating new file:'+error.message+'. Restoring backup.');

                                     RNFS.copyFile(fileName+'.backup', fileName)
                                         .then( (success)=> //4S
                                         {
                                             logger.info(`${callerClass}`, `${callerFunc}-->writeJSONFile`, 'Restored backup file.');
                                         })
                                         .catch( (error)=> //4E
                                         {
                                             logger.error(`${callerClass}`, `${callerFunc}-->writeJSONFile`, 'Failed to Restore backup file:'+error.message);
                                         })


                                 })

                         })
                         .catch( (error)=> // 2E
                         {
                             logger.error(`${callerClass}`, `${callerFunc}-->writeJSONFile`,'Error in creating new file:'+error.message+'. Restoring backup.');
                         })
                 })
                 .catch( (error) => // 1E
                 {
                     logger.error(`${callerClass}`, `${callerFunc}-->writeJSONFile`, 'Error backing up file:'+error.message);
                 })
         }
         else
         {
            RNFS.writeFile(fileName, JSON.stringify(content))
                 .then( (success) =>
                 {
                     logger.info(`${callerClass}`, `${callerFunc}-->writeJSONFile`, 'Created new file: '+fileName);
                 })
                 .catch( (error)=>
                 {
                      logger.error(`${callerClass}`, `${callerFunc}-->writeJSONFile`, 'Failed to create file:'+error.message);
                 })
         }
    }

    readJSONFile(filePath, callerClass, callerFunc)
    {

        RNFS.exists(filePath)
            .then( (exists) =>
            {
                if (exists)
                {
                     logger.info(callerClass, callerFunc+"-->readJSONFile", 'Reading file:'+filePath);
                     RNFS.readFile(filePath)
                         .then((_fileContent) =>
                         {
                             logger.info(callerClass, callerFunc+"-->readJSONFile", 'Successfully read file:'+_fileContent);
                             return _fileContent;
                         })
                         .catch( (error)=>
                         {
                               logger.error(callerClass, callerFunc+"-->readJSONFile", 'Failed to read file:'+error.message);
                         })
                }
                else
                {
                     logger.error(callerClass, callerFunc+"-->readJSONFile", 'Reading file:'+filePath+' does not exist');
                }
            });

            logger.info(callerClass, callerFunc+"-->readJSONFile", 'Returning null');
         return null;
    }

    readServiceFile()
    {
        _serviceCategories=[];

        RNFS.readFile(this.serviceFileLocal)
            .then((_fileContent) => {

              logger.info(`${callerClass}`,"ReadServiceFile", 'Successfully read:'+this.serviceFileLocal);

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

              logger.info(`${callerClass}`,"ReadServiceFile", 'Number of categories found:'+_serviceCategories.length);

              return _serviceCategories;
            })
            .catch((err) => {
              logger.info(`${callerClass}`,"ReadServiceFile", 'Failed to read:'+this.serviceFileLocal+". Err:"+err.message);
              return _serviceCategories;
            })

    }

    async uploadData(data, uuid, type, callerClass, callerFunc)
    {

          logger.info(callerClass, callerFunc+"-->uploadData", 'Uploading data. UUID:'+uuid);

          try
          {
               let response = await fetch
               (
                  'https://mimi.research.icsi.institute/save/',
                  {
                    method: 'POST',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(
                    {
                      "uid": uuid,
                      "client": VERSION_NUMBER,
                      "key": type,
                      "value": JSON.stringify(data)
                    }),
                  }
               );

                logger.info(callerClass, callerFunc+"-->uploadData", 'Server response:'+JSON.stringify(response));
          }
          catch (error)
          {
            logger.error(callerClass, callerFunc+"-->uploadData", 'Error uploading data:'+error.message);
          }
    }


}
const utilities = new Utilities();
export default utilities;