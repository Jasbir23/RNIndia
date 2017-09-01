import React, { Component } from "react";
import LoginComponent from "../LoginComponent/LoginComponent";
import { StackNavigator } from "react-navigation";
import EventsPage from "../LandingPage/EventsPage";
import EventDetails from "../EventDetails/EventDetails";
export default (MainStackRouter = StackNavigator({
  LoginComponent: { screen: LoginComponent },
  EventsPage: { screen: EventsPage },
  EventDetails: { screen: EventDetails }
}));
