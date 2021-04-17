import React from "react";
import { useHistory } from "react-router-dom";
import get from "lodash.get";

import SidebarApi from "../lib/sideBarApi";
import LocalStore, { MY_ATTENDEE_ID } from "../lib/localStore";
import CreateAttendeeForm from "../components/CreateAttendeeForm";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

const ChatsNew = () => {
  const history = useHistory();
  const onSuccess = (response) => {
    const chatId = get(response, "body.chatId");
    const attendeeId = get(response, "body.hostingAttendeeId");
    if (!chatId) throw new Error("Chat not created");
    if (!attendeeId) throw new Error("Hosting Attendee not created");
    LocalStore.setValue(MY_ATTENDEE_ID, attendeeId);
    history.push(`/chats/${chatId}`);
  };

  return (
    <div className="ChatsNew flex flex-col flex-1 bg-color-parchment">
      <Navigation />
      <main className="page-inner flex flex-col flex-1 items-center justify-center">
        <h1 className="title font-vollkorn color-tennis mb1 text-center">
          ready to sidebar?
        </h1>
        <div className="flex flex-col md:col-8 lg:col-6 mb6">
          <CreateAttendeeForm
            onSubmit={(data) => SidebarApi.createChat(data)}
            onSuccess={onSuccess}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChatsNew;
