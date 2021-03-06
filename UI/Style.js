import { StyleSheet } from "react-native";

export default StyleSheet.create({
  longtextStyle: {
    //color: 'black',
    fontFamily: "Times New Roman",
    backgroundColor: "#a7f1e9",
    fontSize: 20,
    borderColor: "black",
    paddingRight: 20,
    paddingLeft: 20,
    paddingTop: 5,
    paddingBottom: 5,
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 5,
    marginTop: 10
  },
  listContainerStyle: {
    //elevation: 30,
    justifyContent: "center",
    flex: 1,
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 1,
    marginTop: 5,
    //borderWidth:1,
    //backgroundColor:"lightcyan",
    paddingBottom: 2,
    paddingTop: 2
  },
  listItemStyle: {
    padding: 10,
    height: 60
  },
  buttonTouchHLStyle: {
    height: 40,
    width: 160,
    borderRadius: 10,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 2,
    marginBottom: 2
  },
  longTextView: {
    elevation: 10,
    backgroundColor: "#a7f1e9",
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 5,
    marginTop: 10
  },
  questionStyle: {
    color: "black",
    fontFamily: "Times New Roman",
    //fontWeight: 'bold',
    fontSize: 22,
    borderColor: "black",
    paddingRight: 20,
    paddingLeft: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 5
    //backgroundColor:'#a7f1e9',
  },

  radioFrameStyle: {
    //justifyContent: 'center',
    //flex: 1,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    marginTop: 15,
    paddingLeft: 30,
    paddingRight: 40,
    fontSize: 16
  },
  inputStyle: {
    height: 100,
    width: 300,
    alignItems: "center",
    borderColor: "gray",
    borderWidth: 1,
    paddingRight: 20,
    paddingLeft: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 5,
    backgroundColor: "white",
    textAlignVertical: "top"
  },
  buttonViewStyle: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 2
  },
  multiLineTextStyle: {
    backgroundColor: "white",
    height: 100,
    width: 200,
    borderColor: "gray",
    borderWidth: 1
  },
  verticalViewStyle: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center"
    //backgroundColor:'lightcyan',
  },

  insideVerticalViewStyle: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center"
  },

  horizontalViewStyle: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
    //backgroundColor: "lightcyan"
  },

  pageHeaderStyle: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
  },

  dividerStyle: {
    flex: 1,
    flexDirection: "column",
    borderBottomColor: "black",
    paddingBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth
  }
});
