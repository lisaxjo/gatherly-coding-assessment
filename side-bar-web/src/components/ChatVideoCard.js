const ChatVideoCard = (props) => {
  return (
    <div
      className={`ChatCard bg-color-denim relative ${
        props.visible ? "" : "sr-only"
      }`}
    >
      <div className="ChatCard__video absolute flex flex-col hidden">
        <video id={props.videoElementId} className="ChatCard__video" />
      </div>
      {props.paused ? (
        <div className="color-tennis flex h100 flex-col justify-center items-center">
          <p className="subtitle font-vollkorn">{props.name}</p>
          <p>{props.pronouns ? `(${props.pronouns})` : ""}</p>
        </div>
      ) : (
        <div className="ChatCard__label absolute flex justify-end">
          <p className="color-silver bg-color-black border-rounded-0_25 small px_5 py_25">
            {props.name}
            {props.pronouns ? ` (${props.pronouns})` : ""}
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatVideoCard;
