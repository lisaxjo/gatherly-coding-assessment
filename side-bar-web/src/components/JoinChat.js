import React from "react";

import CreateAttendeeForm from "./CreateAttendeeForm";
import Footer from './Footer';
import Navigation from "./Navigation";

const JoinChat = (props) => {
  return (
    <div className="flex flex-col flex-1 bg-color-white">
      <Navigation />
      <main className="page-inner flex flex-col flex-1 items-center justify-center">
        <h1 className="subtitle font-vollkorn color-navy text-center">
          Invitation to Sidebar!
        </h1>

        <div className="flex flex-col md:col-8 lg:col-6 mb6">
          <h2 className="body font-inter color-navy mb1_5 text-center">
            Please enter your info to join the conversation
          </h2>
          <CreateAttendeeForm
            onSubmit={props.onSubmit}
            onSuccess={props.onSuccess}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JoinChat;