import { Link } from "react-router-dom";

const MessageWithCTA = ({ message, onPress, to = "/#", label }) => {
  return (
    <div className="flex flex-col flex-1 justify-center items-center">
      <p className="text-center body color-lilac mb2">{message}</p>
      {onPress ? (
        <button className="Button--hollow" onClick={onPress}>
          {label}
        </button>
      ) : (
        <Link className="Button--hollow flex items-center" to={to}>
          {label}
        </Link>
      )}
    </div>
  );
};

export default MessageWithCTA;
