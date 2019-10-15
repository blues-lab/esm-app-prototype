import * as RNFS from "react-native-fs";

export const SERVICE_FILE_ASSET = "services.js";
export const SERVICE_FILE_LOCAL = RNFS.DocumentDirectoryPath + "/services.js";

export const SELECTED_SERVICES_FILE =
  RNFS.DocumentDirectoryPath + "/selectedservices.js";

export const SURVEY_STATUS = {
  NOT_AVAILABLE: "NOT_AVAILABLE",
  AVAILABLE: "AVAILABLE",
  ONGOING: "ONGOING"
};

export const SURVEY_ALLOWED_TO_COMPLETE = 2; //allow to complete max n surveys/day

export const MAX_SURVEY_PER_DAY = 5; //create max 5 surveys/day

export const PROMPT_DURATION = 60; //60 minutes

export const USER_SETTINGS_FILE_PATH =
  RNFS.DocumentDirectoryPath + "/usersettings.js";

export const INVITATION_CODE_FILE_PATH =
  RNFS.DocumentDirectoryPath + "/invitationCode.js";

export const APP_STATUS_FILE_PATH =
  RNFS.DocumentDirectoryPath + "/appStatus.js";

export const LOG_FILE_PATH = RNFS.DocumentDirectoryPath + "/log.csv";

export const STUDY_PERIOD = 7; //study will continue over n days

export const EXIT_SURVEY_PERIOD = 3;

export const SENTRY_DSN =
  "https://143bd5c1ffc846b697b84d9dcc01b493@sentry.io/1780950";
