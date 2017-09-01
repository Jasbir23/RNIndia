import React from "react";
import {
  View,
  Dimensions,
  Image,
  WebView,
  Animated,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform
} from "react-native";
import {
  Container,
  Title,
  Body,
  Content,
  Header,
  Left,
  Right,
  Spinner,
  Text,
  Button,
  Icon,
  Footer,
  FooterTab,
  Input,
  Item,
  Card,
  CardItem,
  Thumbnail
} from "native-base";
import * as firebase from "firebase";
import MainStore from "../../DataStore/MainStore";
import { observer } from "mobx-react/native";
const { width, height } = Dimensions.get("window");

@observer
export default class EventDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userLikeStatus: false,
      commentBoxY: new Animated.Value(100),
      isCommentBoxOpen: true,
      commentEntered: ""
    };
  }
  static navigationOptions = ({ navigation }) => ({
    header: null
  });
  componentDidMount() {
    this.getInitialStatus(MainStore.allEvents[MainStore.currentEventId]);
  }
  returnCommentBox(eve) {
    const boxMov = this.state.commentBoxY.interpolate({
      inputRange: [0, 100],
      outputRange: [0, height]
    });
    return (
      <Animated.View
        style={{
          height: height,
          width: width,
          top: height,
          zIndex: Platform.OS === "ios" ? 10 : null,
          elevation: Platform.OS === "ios" ? null : 10,
          top: 0,
          position: "absolute",
          transform: [{ translateY: boxMov }]
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: height,
            width: width
          }}
          onPress={() => this.commentPressed()}
        >
          <TextInput
            placeholder="Write a comment"
            multiline={true}
            numberOfLines={3}
            style={{
              height: 120,
              width: width,
              backgroundColor: "grey",
              borderRadius: 20,
              padding: 20,
              fontSize: 20
            }}
            value={this.state.commentEntered}
            onChangeText={val => this.setState({ commentEntered: val })}
          />
          <Button
            rounded
            primary
            style={{ alignSelf: "center", marginVertical: 10 }}
            onPress={() => this.commentSubmit()}
          >
            <Text>Submit</Text>
          </Button>
        </TouchableOpacity>
      </Animated.View>
    );
  }
  commentSubmit() {
    firebase
      .database()
      .ref(
        "Events/" +
          MainStore.currentEventId +
          "/comments/" +
          Math.floor(Math.random() * 100000)
      )
      .set({
        comment: this.state.commentEntered,
        user: MainStore.currentUserId
      });
    firebase.database().ref("Users/").once("value", snapshot => {
      console.log("new users");
      MainStore.setAllUsers(snapshot.val());
    });
    firebase.database().ref("Events/").once("value", snapshot => {
      console.log("new events");
      MainStore.setAllEvents(snapshot.val());
    });
    this.setState({
      commentEntered: ""
    });
    this.commentPressed();
  }
  getInitialStatus(eventObj) {
    if (eventObj.likes === undefined) {
      this.setState({
        userLikeStatus: false
      });
    } else if (eventObj.likes !== undefined) {
      const found = false;
      Object.keys(eventObj.likes).map((item, index) => {
        if (item === MainStore.currentUserId) {
          this.setState({
            userLikeStatus: true
          });
          found = true;
        }
      });
      if (found === false) {
        this.setState({
          userLikeStatus: false
        });
      }
    }
  }
  likePressed(eventObj) {
    if (this.state.userLikeStatus) {
      this.unlike();
    } else if (!this.state.userLikeStatus) {
      this.like();
    }
    this.setState({
      userLikeStatus: !this.state.userLikeStatus
    });
  }
  like() {
    firebase
      .database()
      .ref(
        "Users/" +
          MainStore.currentUserId +
          "/likes/" +
          MainStore.currentEventId
      )
      .set({
        liked: true
      });
    firebase
      .database()
      .ref(
        "Events/" +
          MainStore.currentEventId +
          "/likes/" +
          MainStore.currentUserId
      )
      .set({
        liked: true
      });
    firebase.database().ref("Users/").once("value", snapshot => {
      console.log("new users");
      MainStore.setAllUsers(snapshot.val());
    });
    firebase.database().ref("Events/").once("value", snapshot => {
      console.log("new events");
      MainStore.setAllEvents(snapshot.val());
    });
  }
  unlike() {
    firebase
      .database()
      .ref(
        "Users/" +
          MainStore.currentUserId +
          "/likes/" +
          MainStore.currentEventId
      )
      .remove();
    firebase
      .database()
      .ref(
        "Events/" +
          MainStore.currentEventId +
          "/likes/" +
          MainStore.currentUserId
      )
      .remove();
    firebase.database().ref("Users/").once("value", snapshot => {
      console.log("new users");
      MainStore.setAllUsers(snapshot.val());
    });
    firebase.database().ref("Events/").once("value", snapshot => {
      console.log("new events");
      MainStore.setAllEvents(snapshot.val());
    });
  }
  commentPressed() {
    if (!this.state.isCommentBoxOpen) {
      Animated.timing(this.state.commentBoxY, {
        toValue: 100,
        duration: 200
      }).start();
    } else if (this.state.isCommentBoxOpen) {
      Animated.timing(this.state.commentBoxY, {
        toValue: 0,
        duration: 200
      }).start();
    }
    this.setState({
      isCommentBoxOpen: !this.state.isCommentBoxOpen
    });
  }
  renderComments(eventObj) {
    if (eventObj.comments === undefined) {
      return <Card><CardItem><Text>No comments</Text></CardItem></Card>;
    } else if (eventObj.comments !== undefined) {
      return (
        <View>
          {Object.keys(eventObj.comments).map((item, index) => {
            return (
              <Card key={index}>
                <CardItem>
                  <Left>
                    <Thumbnail
                      source={{
                        uri: MainStore.allUsers[eventObj.comments[item].user]
                          .picture.data.url
                      }}
                    />
                    <Body>
                      <Text>{eventObj.comments[item].comment}</Text>
                      <View style={{ flexDirection: "row" }}>
                        <Icon
                          active
                          style={{
                            fontSize: 18,
                            marginRight: 6,
                            color: "rgb(164, 164, 165)"
                          }}
                          note
                          name="person"
                        />
                        <Text style={{ marginTop: 1 }} note>
                          {
                            MainStore.allUsers[eventObj.comments[item].user]
                              .name
                          }
                        </Text>
                      </View>
                    </Body>
                  </Left>
                </CardItem>
              </Card>
            );
          })}
        </View>
      );
    }
  }
  render() {
    const eventObj = MainStore.allEvents[MainStore.currentEventId];
    if (eventObj === undefined) {
      return (
        <Container>
          <Text>Oops,there was a problem</Text>
          <Button full dark onPress={() => this.props.navigation.goBack()} />
        </Container>
      );
    }
    return (
      <Container>
        <Header>
          <Left>
            <Button transparent onPress={() => this.props.navigation.goBack()}>
              <Icon name="arrow-back" />
            </Button>
          </Left>
          <Body>
            <Title>EventDetails</Title>
          </Body>
          <Right />
        </Header>
        <ScrollView>
          {Object.keys(eventObj.description).map((item, index) => {
            if (eventObj.description[item].type === "text") {
              return this.renderText(eventObj.description[item].value, index);
            }
            if (eventObj.description[item].type === "image") {
              return this.renderImage(eventObj.description[item].value, index);
            }
            if (eventObj.description[item].type === "video") {
              return this.renderVideo(eventObj.description[item].value, index);
            }
          })}
          <View style={{ flex: 1 }}>
            {this.renderComments(eventObj)}
          </View>
        </ScrollView>
        <Footer>
          <FooterTab>
            <Button
              vertical
              dark={this.state.userLikeStatus}
              onPress={() => {
                this.likePressed(eventObj);
              }}
            >
              <Icon
                name="medal"
                active={this.state.userLikeStatus}
                style={{
                  color: this.state.userLikeStatus ? "white" : "grey"
                }}
              />
              <Text
                style={{
                  color: this.state.userLikeStatus ? "white" : "grey",
                  fontWeight: "bold"
                }}
              >
                Medal
              </Text>
            </Button>
            <Button vertical onPress={() => this.commentPressed()}>
              <Icon name="chatboxes" active={this.state.isCommentBoxOpen} />
              <Text>Comment</Text>
            </Button>
          </FooterTab>
        </Footer>

        {this.returnCommentBox(eventObj)}
      </Container>
    );
  }
  renderText(text, index) {
    return (
      <View
        key={index}
        style={{
          padding: 10,
          marginVertical: 10
        }}
      >
        <Text>{text}</Text>
      </View>
    );
  }
  renderImage(image, index) {
    return (
      <View
        key={index}
        style={{ height: 200, width: width, marginVertical: 10 }}
      >
        <Image
          source={{
            uri: image
          }}
          style={{ height: 200, width: width, flex: 1 }}
        />
      </View>
    );
  }
  renderVideo(video, index) {
    return (
      <View
        key={index}
        style={{
          marginVertical: 10,
          height: 220
        }}
      >
        <WebView
          source={{
            uri: video
          }}
          scrollEnabled={false}
          style={{
            height: 220
          }}
        />
      </View>
    );
  }
}
