import * as RNFS from 'react-native-fs';


export const SURVEY_STATUS =  {NOT_AVAILABLE: "NOT_AVAILABLE", AVAILABLE:"AVAILABLE", ONGOING:"ONGOING", COMPLETED:"COMPLETED"}

export const MAX_SURVEY_PER_DAY = 5; //create max 5 surveys/day

export const  SURVEY_ALLOWED_TO_COMPLETE = 1; //allow to complete max 1 surveys/day

export const PROMPT_DURATION = 60; //60 minutes

export const USER_SETTINGS_FILE_PATH = RNFS.DocumentDirectoryPath+'/usersettings.js';

export const APP_STATUS_FILE_PATH = RNFS.DocumentDirectoryPath+'/appStatus.js';

export const LOG_FILE_PATH = RNFS.DocumentDirectoryPath+'/log.csv';


export const VERSION_NUMBER = '1.0.0';