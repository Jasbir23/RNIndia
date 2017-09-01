import React from "react";
import * as firebase from "firebase";
import MainStore from "../../DataStore/MainStore";
import { Image, ScrollView, View } from "react-native";
import { observer } from "mobx-react/native";
import {
  Container,
  Body,
  Content,
  Header,
  Left,
  Right,
  Icon,
  Title,
  Input,
  Item,
  Label,
  Button,
  Text,
  Card,
  CardItem,
  Thumbnail,
  Spinner
} from "native-base";

@observer
export default class EventsPage extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    header: null
  });
  render() {
    if (MainStore.allEvents === undefined || MainStore.allUsers === undefined) {
      return <Spinner />;
    }
    return (
      <ScrollView
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 20,
          paddingHorizontal: 10
        }}
      >
        {Object.keys(MainStore.allEvents).map((item, index) => {
          return this.renderRow(MainStore.allEvents[item], index);
        })}
      </ScrollView>
    );
  }

  requested(eve) {
    console.log("requested", eve);
    firebase
      .database()
      .ref("Users/" + MainStore.currentUserId + "/eventRequest/" + eve.id)
      .set({
        status: "requested"
      });
    firebase
      .database()
      .ref("Events/" + eve.id + "/receivedRequests/" + MainStore.currentUserId)
      .set({
        status: "requested"
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

  returnStatusForUser(eve) {
    let userStatus = undefined;
    if (eve.receivedRequests === undefined) {
      userStatus = "request";
    } else if (eve.receivedRequests !== undefined) {
      Object.keys(eve.receivedRequests).map((item, index) => {
        if (item === MainStore.currentUserId) {
          userStatus = eve.receivedRequests[item].status;
        }
      });
      if (userStatus === undefined) {
        userStatus = "request";
      }
    }
    if (eve.isPast) {
      return <Button rounded dark><Text>{eve.attended} Attended</Text></Button>;
    } else if (!eve.isPast) {
      if (eve.isHouseful) {
        return <Button rounded dark><Text>HOUSE FULL</Text></Button>;
      } else if (!eve.isHouseful) {
        switch (userStatus) {
          case "request":
            return (
              <Button
                rounded
                primary
                onPress={() => {
                  this.requested(eve);
                }}
              >
                <Text>REQUEST</Text>
              </Button>
            );

            break;
          case "requested":
            return <Button rounded dark><Text>REQUESTED</Text></Button>;

            break;
          case "attending":
            return <Button rounded dark><Text>ATTENDING</Text></Button>;

            break;
          case "denied":
            return <Button rounded dark><Text>HOUSE FULL</Text></Button>;

            break;
          default:
            return (
              <Button
                rounded
                primary
                onPress={() => {
                  this.requested(eve);
                }}
              >
                <Text>REQUEST</Text>
              </Button>
            );
        }
      }
    }
  }

  renderRow(rowData, i) {
    return (
      <Card key={i}>
        <CardItem
          button
          onPress={() => {
            MainStore.setCurrentEventId(rowData.id);
            this.props.navigation.navigate("EventDetails");
          }}
        >
          <Left>
            <Thumbnail
              source={{
                uri: "http://angular.github.io/react-native-renderer/assets/react.png"
              }}
            />
            <Body>
              <Text>{rowData.name}</Text>
              <View style={{ flexDirection: "row" }}>
                <Icon
                  active
                  style={{
                    fontSize: 18,
                    marginRight: 6,
                    color: "rgb(164, 164, 165)"
                  }}
                  note
                  name="home"
                />
                <Text style={{ marginTop: 1 }} note>{rowData.location}</Text>
              </View>
            </Body>
          </Left>
        </CardItem>
        <CardItem
          cardBody
          button
          onPress={() => {
            MainStore.setCurrentEventId(rowData.id);
            this.props.navigation.navigate("EventDetails");
          }}
        >
          <Image
            source={{
              uri: rowData.coverPic
            }}
            style={{ height: 200, width: null, flex: 1 }}
          />
        </CardItem>
        <CardItem>
          <Left style={{ flex: 1.4 }}>
            <Icon name="calendar" />
            <Text>{rowData.date.dd}/{rowData.date.mm}/{rowData.date.yyyy}</Text>
          </Left>
          <Right style={{ flex: 1.4 }}>
            {this.returnStatusForUser(rowData)}
          </Right>
        </CardItem>
      </Card>
    );
  }
}
