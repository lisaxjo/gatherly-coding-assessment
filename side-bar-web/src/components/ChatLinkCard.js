import React, { useState, useEffect } from "react";

import copyToClipboard from "../utils/copyToClipboard";

const ChatLinkCard = ({ id }) => {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/chats/${id}`;
  const onClick = () => {
    copyToClipboard(url);
    setCopied(true);
  };

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 5000);
    }
  }, [copied]);

  return (
    <div className="ChatCard flex flex-col justify-center bg-color-navy">
      <p className="heading font-vollkorn color-parchment mb2 text-center">
        Invite someone to your sidebar:
      </p>
      <div className="flex">
        <input
          id="myInput"
          type="text"
          className="Form__input flex-1 mr_5"
          value={url}
          disabled
        />
        <button className="Button--tertiary" onClick={onClick}>
          {copied ? "copied!" : "copy link"}
        </button>
      </div>
    </div>
  );
};

export default ChatLinkCard;
