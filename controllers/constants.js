import * as RNFS from 'react-native-fs';


export const SURVEY_STATUS =  {NOT_AVAILABLE: "NOT_AVAILABLE", AVAILABLE:"AVAILABLE", ONGOING:"ONGOING", COMPLETED:"COMPLETED"}

export const MAX_NOTIFICATION_NUM = 5;

export const VALID_SURVEY_PERIOD = 60; //60 minutes

export const USER_SETTINGS_FILE_PATH = RNFS.DocumentDirectoryPath+'/usersettings.js';