const ChatNonVideoCard = (props) => {
  return (
    <div className="ChatCard flex flex-col items-center justify-center color-navy bg-color-parchment relative">
      <p className="subtitle font-vollkorn">{props.name}</p>
      <p>{props.pronouns ? `(${props.pronouns})` : ""}</p>
    </div>
  );
};

export default ChatNonVideoCard;
