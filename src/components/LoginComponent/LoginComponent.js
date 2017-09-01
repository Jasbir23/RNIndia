import React, { Component } from "react";
import Exponent from "expo";
import { observer } from "mobx-react/native";
import {
  Container,
  Header,
  Left,
  Body,
  Right,
  Button,
  Icon,
  Title,
  Content,
  Spinner,
  Text
} from "native-base";
import * as firebase from "firebase";
import MainStore from "../../DataStore/MainStore";

@observer
export default class LoginComponent extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: null
  });
  constructor(props) {
    super(props);
    this.state = {
      isFetching: false
    };
  }
  componentWillMount() {
    firebase.database().ref("Users/").once("value", snapshot => {
      console.log("new users");
      MainStore.setAllUsers(snapshot.val());
    });
    firebase.database().ref("Events/").once("value", snapshot => {
      console.log("new events");
      MainStore.setAllEvents(snapshot.val());
    });
  }

  async logIn() {
    this.setState({
      isFetching: true
    });
    const {
      type,
      token
    } = await Exponent.Facebook.logInWithReadPermissionsAsync(
      "742168645991093",
      {
        permissions: ["public_profile", "email"]
      }
    );
    if (type !== "success") {
      this.setState({
        isFetching: false
      });
    }
    if (type === "success") {
      const found = false;
      const response = await fetch(
        `https://graph.facebook.com/me?fields=name,id,age_range,link,gender,picture,cover,first_name&access_token=${token}`
      );
      const obj = await response.json();
      this.setState({
        loginResponse: obj
      });
      console.log(this.state.loginResponse, "gjyghj");
      Object.keys(MainStore.allUsers).map((item, index) => {
        if (item === this.state.loginResponse.id) {
          console.log("user exists");
          found = true;
          MainStore.setCurrentUserId(item);
          this.props.navigation.navigate("EventsPage");
          this.setState({
            isFetching: false
          });
        }
      });
      if (found === false) {
        console.log(
          "New User",
          this.state.loginResponse,
          this.state.loginResponse.cover
        );
        firebase.database().ref("Users/" + this.state.loginResponse.id).set({
          name: this.state.loginResponse.name === undefined
            ? 0
            : this.state.loginResponse.name,
          id: this.state.loginResponse.id === undefined
            ? 0
            : this.state.loginResponse.id,
          age_range: this.state.loginResponse.age_range === undefined
            ? 0
            : this.state.loginResponse.age_range,
          link: this.state.loginResponse.link === undefined
            ? 0
            : this.state.loginResponse.link,
          gender: this.state.loginResponse.gender === undefined
            ? 0
            : this.state.loginResponse.gender,
          picture: this.state.loginResponse.picture === undefined
            ? 0
            : this.state.loginResponse.picture,
          cover: this.state.loginResponse.cover === undefined
            ? 0
            : this.state.loginResponse.cover,
          first_name: this.state.loginResponse.first_name === undefined
            ? ""
            : this.state.loginResponse.first_name
        });
        console.log("New User");
        MainStore.setCurrentUserId(this.state.loginResponse.id);
        this.props.navigation.navigate("EventsPage");
        this.setState({
          isFetching: false
        });
      }
    }
  }

  render() {
    if (
      MainStore.allUsers === undefined ||
      MainStore.allEvents === undefined ||
      this.state.isFetching
    ) {
      return <Spinner />;
    }
    return (
      <Container>
        <Header>
          <Left />
          <Body>
            <Title>Login/SignUp</Title>
          </Body>
          <Right />
        </Header>
        <Content padder>
          <Button
            full
            dark
            style={{ marginVertical: 10 }}
            onPress={() => {
              MainStore.setCurrentUserId("1427504523999663");
              this.props.navigation.navigate("EventsPage");
            }}
          >
            <Text>LogIn</Text>
          </Button>
          <Button
            full
            primary
            style={{ marginVertical: 10 }}
            onPress={() => this.logIn()}
          >
            <Text>Facebook</Text>
          </Button>
        </Content>
      </Container>
    );
  }
}
