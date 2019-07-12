import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert} from 'react-native';
import * as RNFS from 'react-native-fs';

import logger from './logger';

const codeFileName = 'fileUtil.js';


class FileUtil extends Component
{
    serviceFileLocal = RNFS.DocumentDirectoryPath+'/services.js';

    writeJSON(content, fileName, callerClass, callerFunc)
    {
         RNFS.copyFile(fileName, fileName+'.backup')
             .then( (success) => {
                 logger.info(`${callerClass}`, 'writeServiceFile', 'Backed up service file.');

                 RNFS.writeFile(fileName, JSON.stringify(content))
                     .then( (success) => {
                         logger.info(`${callerClass}`, `${callerFunc}`, 'Saved service in file.');
                           RNFS.unlink(fileName+'.backup')
                               .then(() => {
                                 logger.info(`${callerClass}`, `${callerFunc}`, 'Deleted backup service file.');
                               })
                               // `unlink` will throw an error, if the item to unlink does not exist
                               .catch((err) => {
                                 logger.error(`${callerClass}`, `${callerFunc}`, 'Error in deleting backup service file:'+error.message);
                               });
                     })
                     .catch( (error)=>{
                         logger.error(`${callerClass}`, `${callerFunc}`, 'Error in saving service file:'+error.message+'. Restoring backup file');
                         RNFS.copyFile(fileName+'.backup', fileName)
                             .then( (success)=> {
                                 logger.info(`${callerClass}`, `${callerFunc}`, 'Restored backup service file.');
                             })
                             .catch( (error)=>{
                                 logger.error(`${callerClass}`, `${callerFunc}`, 'Failed to Restore backup service file:'+error.message);
                             })

                     })
             })
             .catch( (error) => {
                 logger.error(`${codeFileName}`, 'saveState',
                     'Error backing up status file:'+error.message);
             })
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
const fileUtil = new FileUtil();
export default fileUtil;