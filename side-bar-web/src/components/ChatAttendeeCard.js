import React from "react";
import get from "lodash.get";

const ChatAttendeeCard = ({ videoId, tileConfig, attendee }) => {
  const isLocal = get(tileConfig, "localTile");
  const pronouns = isLocal ? 'me' : attendee?.pronouns;
  const isVisible = !!attendee && attendee.present;
  const isPaused = get(tileConfig, "paused");
  const isActive = get(tileConfig, "active");
  const showNameplate = !isPaused && isActive;
  
  return (
    <div
      className={`ChatCard bg-color-parchment relative ${
        isVisible ? "" : "sr-only"
      }`}
    >
      <div className="ChatCard__video absolute flex flex-col hidden">
        <video id={`video-${videoId}`} className="ChatCard__video" />
      </div>
      {!showNameplate ? (
        <div className="color-navy flex h100 flex-col justify-center items-center">
          <p className="subtitle font-vollkorn">{attendee?.fullName || ""}</p>
          <p>{pronouns ? `(${pronouns})` : ""}</p>
        </div>
      ) : (
        <div className="ChatCard__label absolute flex justify-end">
          <p className="color-parchment bg-color-black border-rounded-0_25 small px_5 py_25">
            {attendee?.fullName || "Anonymous"}
            {pronouns ? ` (${pronouns})` : ""}
          </p>
        </div>
      )}
    </div>
  );
 }

 export default ChatAttendeeCard;