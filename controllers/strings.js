import { format } from "./utilities";
/* Unsorted */

export const INVITATION_CODE_FAIL =
  "There was an error saving your invitation code. Please try again later.";

export const SAVE_CHANGES_PROMPT = "Do you want to save changes?";

export const SURVEY_EXPIRED =
  "Sorry, the current survey expired. We will notify you once new surveys become available.";
export const SURVEY_EXPIRED_HEADER = "Survey expired!";

export const ANSWER_TO_CONTINUE = "Please answer all questions to continue.";

export const NEXT_BUTTON = "Next";

/* Permissions */

export const LOCATION_SHARE_PROMPT =
  "To receive surveys, please enable location sharing and WiFi.";

export const WIFI_PERMISSION_MSG =
  "We will not collect or store your location data." +
  " However, for the app to send you surveys only when you are at home, we need you to:\n" +
  " • grant the app location permission\n" +
  " • keep location sharing enabled at home throughout the study.";

export const HOME_WIFI_NOT_CONNECTED =
  "We will only send surveys when you are connected to your home WiFi." +
  " We will check again when you are connected to WiFi network.";

export const HOME_WIFI_PROMPT = wifiName =>
  'Is "' + wifiName + '" your home WiFi?';

export const NOT_HOME_WIFI =
  "Got it. We'll ask again when you connect to another network.";

/* Home screen */
export const MIMI_ADVERTISEMENT =
  "Imagine that ALVA is a voice assistant that's always listening. That means it's always ready to help and provide services/suggestions based on conversations you have with other people in your home. You don't even need to say its name!\n\nThe surveys in this app help improve ALVA's design. You'll receive a notification when a new survey becomes available.\n\nFor now, ALVA is just a simulation (so it won't actually listen to your conversations or offer suggestions). Nevertheless, please answer the surveys as if ALVA was a real product.";
export const NO_SURVEY_AVAILABLE = "No survey available right now. Hang tight!";
export const TRY_LATER_BUTTON = "Ok, try later!";

/* Invitation code processing */
export const ENTER_INVITE_CODE = "Please enter your invitation code";
export const INVALID_INVITE =
  "The code you entered is invalid. Please try again.";
export const INVITE_REQUIRED = "An invitation code is required to continue.";

/* Initial prompt */
export const NEW_SURVEY_HEADER = "New survey!";
export const CONVERSATION_PROMPT = "Have you had a conversation recently?";
export const NO_CONVERSATION_HEADER = "Thank you!";
export const NO_CONVERSATION = "We will try again later.";
export const TAKE_NEW_SURVEY = "Take the new survey!";

/* Saving messages that appear between screens and at the end */
export const SAVING_WAIT = "Saving response. Please wait...";
export const SAVING_HEADER = "ALVA";

/* Texts for settings page*/
export const DONT_DISTURB =
  "If there is a specific time of day you don't want to receive surveys, " +
  "please indicate it below.";
export const DONT_DISTURB_AFTER = "Do not show notifications after";
export const DONT_DISTURB_BEFORE = "And before";

export const SETTINGS_SAVED_FIRST_TIME =
  "Your settings have been saved. We will prompt you when a new survey becomes available.";
export const SETTINGS_SAVED = "Settings saved.";
/* Notifications */
export const NEW_SURVEY_AVAILABLE = "New survey available!";
export const SURVEY_TIME = remainingTime =>
  "Complete within " + remainingTime + " minutes to get $1!";
export const ONGOING_SURVEY = "Survey is still available!";
export const FINAL_SURVEY_AVAILABLE = "Final survey available!";
export const FINAL_SURVEY_TIME = remainingDays =>
  "Complete within " + remainingDays + " days to get $1!";

/* Conversation topic */
export const TALKING_ABOUT_HEADER = "Conversation topic";
export const TALKING_ABOUT = "What were you talking about?";
export const TALKING_ABOUT_SKIP_HINT = "Enter 'Prefer not to answer' to skip";
export const TALKING_ABOUT_REQUIRED =
  "Please enter conversation topic to continue.";

/* Questions about relevant services*/
export const PROMPT_SCREEN_TITLE = "ALVA"; // TODO: I don't think this is actually seen anywhere?
export const IMAGINE_TEXT = format(
  "Imagine that ALVA, the always-on voice assistant, was able to offer you services that were **relevant to the conversation you just had.**"
);
export const IMAGINE_NEXT = "Ok, I've thought about services ALVA could offer";

export const SELECT_RELEVANT_SERVICES = format(
  "What services could ALVA offer **based on the conversation you just had**? (They don't have to be services you would want or use.)"
);

export const OTHER_SERVICE_PROMPT = "What other service?";

export const WHY_NO_RELEVANT =
  "Please explain why no service would be relevant in this situation.";

/* Questions about access */
export const WOULD_ALLOW_1 = format(
  "Would you allow ALVA to access the **relevant parts** of the conversation you just had to"
);

export const ACCESS_ALLOW = format(
  "Yes, I would **allow access** to any parts of the conversation that were relevant to this service."
);
export const ACCESS_PARTIAL = format(
  "I'd allow access to **some parts** of the conversation, but I'd **deny access** to other parts, even though they are relevant."
);
export const ACCESS_DENY = format(
  "No, I would **deny** access to **all parts** of the conversation, even those that are relevant to this service."
);

export const RESTRICT_WHICH =
  "To which specific parts of your conversation would you restrict ALVA's access?";
export const RESTRICT_WHY =
  "Why would you restrict the device's access to these parts of your conversation?";

export const WHY_DENY =
  "Why would you completely deny access to the conversation?";

export const ACCESS_SELECTION_REQUIRED_HEADER = "Error";
export const ACCESS_SELECTION_REQUIRED = "Please select an option to continue.";

export const DATA_RETENTION_QUESTION_TRANSCRIPT = format(
  "Would you want ALVA to store a transcript of this conversation, " +
    "**so you can check that it provided the services correctly**?"
);
export const DATA_RETENTION_QUESTION_LENGTH = format(
  "How long would you want ALVA to store the " +
    "audio recording of this conversation **for the purpose of improving its functionality**?"
);
export const DATA_RETENTION_TRANSCRIPT_OPTIONS = [
  "Yes, keep the transcript for my review",
  "No, don't keep the transcript for my review",
  "Other"
];
export const DATA_RETENTION_LENGTH_OPTIONS = [
  "Store until the service has been provided",
  "Store until I request to delete it",
  "Store for a specific amount of time",
  "Other"
];
export const EXPLAIN_SPECIFIC_RETENTION_POLICY =
  "For how long should ALVA store the audio recording, and why?";
export const PLEASE_EXPLAIN = "Please explain";

/* Contextual questions */
export const CONTEXT_INTRO =
  "Please answer a few questions about the conversation you just had.";
export const CONTEXT_WHERE = "Where were you talking?";
export const CONTEXT_WHERE_LOCATIONS = [
  "Bedroom",
  "Living room",
  "Garden",
  "Kitchen",
  "Garage",
  "Bathroom",
  "Patio/balcony/terrace",
  "Office",
  "Other"
];
export const CONTEXT_WHERE_SELECT_ALL = "Select all that apply.";
export const CONTEXT_WHERE_OTHER = "Enter the location where you were talking:";
export const CONTEXT_WHERE_OTHER_SUBMIT = "Save";
export const CONTEXT_COULD_HEAR =
  "How many people could hear the conversation but did not participate in it?";
export const CONTEXT_HOW_MANY_TALKING =
  "Not including yourself, how many people were talking?";
export const CONTEXT_RELATE = "Who are they? (Select all that apply.)";
export const CONTEXT_RELATE_OTHER =
  "What is your relationship with this person?";
export const CONTEXT_RELATE_OTHER_SUBMIT = "Save";
export const CONTEXT_PRESENT =
  "Was everyone talking physically present (e.g., rather than talking over the phone)?";
export const NO_LOCATION_SELECTED_ERROR =
  "Please select conversation location to continue.";
export const NO_RELATION_SELECTED_ERROR =
  "Please select relationships with the conversation participants to continue.";

export const CHILDREN_ADOLESCENT = [
  "Of the people who were talking, were there any:",
  "Children (0-12 years old):",
  "Adolescents (13-17 years old):"
];

/* Survey completion */
export const SURVEY_DONE_HEADER = "Congratulations!";
export const SURVEY_DONE_NO_BONUS = "You have earned $1!";
export const SURVEY_DONE_BONUS =
  "You have earned $1! Keep on going! If you don't miss any daily surveys, you'll get a bonus at the end!";

//********* Exit survey related texts ************//

export const EXIT_SURVEY_INTRO = _remainingDays =>
  "Thank you for participating in the daily surveys!\n" +
  "There is one more survey you can take and earn $1!\n\n" +
  "You have " +
  _remainingDays +
  " days to complete this survey.";

export const EXIT_SURVEY_CONSENT =
  "Welcome to the final part of the study! \n\n" +
  "In this survey, we will ask questions about the importance of " +
  "the services that you have selected in the past weeks.\n\n" +
  "This survey will take 8-10 minutes and you will receive $1 for completing it.";

export const SERVICE_USEFULNESS = serviceName =>
  "How useful is the service '" + serviceName + "' to you?";

export const MODEL1_FEATURES = [
  "• used to provide the relevant services",
  "• stored until the relevant service is provided",
  "• processed and analyzed directly on the device",
  "• processed and analyzed by algorithms"
];

export const MODEL2_FEATURES = [
  "• used to provide the relevant services and personalized offers from companies other than the manufacturer of the device",
  "• stored forever",
  "• processed and analyzed after being sent over the Internet to the manufacturer’s server",
  "• processed and analyzed by humans"
];

export const SINGLE_MODEL_INTRO_TEXT =
  "Suppose you could actually buy a real version of ALVA, which " +
  "offered the services you suggested during the past week. It would also have additional features." +
  " To provide them, audio recordings are:";
export const BOTH_MODEL_INTRO_TEXT =
  "Suppose you could actually buy a real version of ALVA, which" +
  " offered the services you suggested during the past week as well as additional features. Imagine" +
  " there are two models of ALVA.";

export const EXPLAIN_WHY_NO_SERVICES =
  "Please explain in a few sentences why you did not find any services relevant.";

export const EXIT_SURVEY_DONE_HEADER = "Congratulations!";
export const EXIT_SURVEY_DONE = "You have earned $1!";

//********* End exit survey related texts ************//

export const FINAL_THANK = "Thank you for participating in our study!";
export const FINAL_THANK_EXTENDED =
  "Thank you for participating in our study! Please feel free to uninstall this app.";

export const CONTACT_TEXT =
  "If you have any questions or comments, contact us at";
export const CONTACT_EMAIL = "researchlab@icsi.berkeley.edu";

export const ERROR_MESSAGE_HEADER = "Error";
export const SAVING_ERROR_MESSAGE =
  "An error occurred saving your response. Please send an email to " +
  CONTACT_EMAIL +
  " with the error log.";
export const LOADING_ERROR_MESSAGE =
  "An error occurred loading data from file. Please send an email to " +
  CONTACT_EMAIL +
  " with the error log.";
export const SEND_ERROR_EMAIL = "Send email";

/* Services */
export const SERVICES = [
  {
    services: [
      { serviceName: "Call/text/email a family member/friend" },
      { serviceName: "Call/text/email for work" },
      { serviceName: "Call a store/restaurant/office" },
      { serviceName: "Call doctor/hospital" },
      { serviceName: "Call the police/emergency service" }
    ],
    categoryName: "Call/email/text"
  },
  {
    services: [
      {
        serviceName:
          "Add an already-scheduled meeting or event to your calendar"
      },
      { serviceName: "Schedule a get-together with friends/family" },
      { serviceName: "Schedule doctor's/medical appointment" },
      { serviceName: "Schedule a meeting with a colleague" },
      {
        serviceName:
          "Schedule personal care appointment (hair, nails, spa, etc.)"
      }
    ],
    categoryName: "Schedule appointment or add event"
  },
  {
    services: [
      { serviceName: "Remind about a to-do item" },
      { serviceName: "Remind about a calendar event" },
      { serviceName: "Remind to call/text/email someone" },
      { serviceName: "Remind about a meeting" },
      { serviceName: "Remind to take medication" },
      { serviceName: "Remind about doctor's/medical appointment" },
      { serviceName: "Remind to avoid some food/drink" }
    ],
    categoryName: "Set a reminder"
  },
  {
    services: [
      { serviceName: "Order food" },
      { serviceName: "Buy groceries" },
      { serviceName: "Buy household item(s)" },
      { serviceName: "Buy a gift" },
      { serviceName: "Buy clothes" },
      { serviceName: "Buy book" },
      { serviceName: "Book flight/hotel/rent car" },
      { serviceName: "Call a taxi/rideshare" }
    ],
    categoryName: "Purchase a product/service"
  },
  {
    services: [
      {
        serviceName:
          "Search for health/disease/medical condition related information"
      },
      { serviceName: "Search for restaurant(s)" },
      { serviceName: "Search for address or location" },
      { serviceName: "Search for food recipe" },
      { serviceName: "Search for song/artist/lyric" },
      {
        serviceName:
          "Search contact information for a store/restaurant/office/business"
      },
      { serviceName: "Search for meanings of a word/term/phrase" },
      {
        serviceName:
          "Search for promo code/discount offer for some product/service"
      },
      { serviceName: "Search for travel info (flights/hotels/rental cars)" },
      { serviceName: "Search for weather information at a location" },
      { serviceName: "Search for the nearest hospital/pharmacy" },
      { serviceName: "Search for job opportunities" }
    ],
    categoryName: "Search for information"
  },
  {
    services: [
      { serviceName: "Add task to a to-do list" },
      {
        serviceName:
          "Keep track of medication/exercise/other recurrent activities "
      },
      {
        serviceName:
          "Keep track of information mentioned in the conversation (such as dates, names, phone numbers)"
      },
      {
        serviceName:
          "Keep track of opinions/preferences expressed in this conversation"
      },
      {
        serviceName:
          "Keep track of the price of some item and notify when a lower price is available"
      },
      { serviceName: "Track a package and confirm when delivered" },
      { serviceName: "Keep track of travel schedules" }
    ],
    categoryName: "Remember or keep track of information"
  },
  {
    services: [
      { serviceName: "Start/stop music" },
      { serviceName: "Turn on/off the TV" },
      { serviceName: "Turn on/off the light" },
      { serviceName: "Adjust heating/cooling" },
      { serviceName: "Turn on/off the oven" },
      { serviceName: "Open/close garage door" }
    ],
    categoryName: "Smart home services"
  },
  {
    services: [
      { serviceName: "Recommend a restaurant/food delivery store" },
      { serviceName: "Suggest a store/item" },
      { serviceName: "Recommend music, movie, or other media" },
      { serviceName: "Recommend activities/happenings nearby" },
      { serviceName: "Recommend the optimal route for a destination" },
      { serviceName: "Recommend medication and place to find it" },
      { serviceName: "Recommend dietary plan" }
    ],
    categoryName: "Recommend product/service"
  }
];
