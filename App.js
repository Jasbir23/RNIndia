import React from "react";
import Expo from "expo";
import { StyleSheet, Text, View } from "react-native";
import MainStackRouter from "./src/components/Routers/MainStackRouter";
import MainStore from "./src/DataStore/MainStore";
import * as firebase from "firebase";
var firebaseConfig = {
  apiKey: "AIzaSyAgxIEmgg-WomWOFMaKZH0k38ouGeZMdx4",
  authDomain: "rnblrapp.firebaseapp.com",
  databaseURL: "https://rnblrapp.firebaseio.com",
  projectId: "rnblrapp",
  storageBucket: "rnblrapp.appspot.com",
  messagingSenderId: "269780639340"
};

firebase.initializeApp(firebaseConfig);

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      isReady: false
    };
    // console.ignoredYellowBox = ["Setting a timer"];
  }

  async componentWillMount() {
    await Expo.Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
      Ionicons: require("native-base/Fonts/Ionicons.ttf")
    });
    this.setState({ isReady: true });
  }

  render() {
    if (!this.state.isReady) {
      return <Expo.AppLoading />;
    }
    return (
      <MainStackRouter
        onNavigationStateChange={(prevState, currentState) => {
          firebase.database().ref("Users/").once("value", snapshot => {
            console.log("new users");
            MainStore.setAllUsers(snapshot.val());
          });
          firebase.database().ref("Events/").once("value", snapshot => {
            console.log("new events");
            MainStore.setAllEvents(snapshot.val());
          });
        }}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
