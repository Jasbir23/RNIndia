import { observable } from "mobx";
class MainStore {
  @observable allUsers = undefined;
  @observable allEvents = undefined;
  @observable currentEventId = {};
  @observable currentUserId = {};

  setCurrentEventId(eveId) {
    console.log("Current Event Set");
    this.currentEventId = eveId;
  }
  setCurrentUserId(user) {
    console.log("Current user ID refreshed");
    this.currentUserId = user;
  }
  setAllEvents(events) {
    console.log("events refreshed");
    this.allEvents = events;
  }
  setAllUsers(users) {
    console.log("users refreshed");
    this.allUsers = users;
  }
}
export default new MainStore();
