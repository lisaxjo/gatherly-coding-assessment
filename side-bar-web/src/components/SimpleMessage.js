const SimpleMessage = ({ message }) => {
  return (
    <div className="flex flex-col flex-1 justify-center">
      <p className="text-center body color-lilac mb4">{message}</p>
    </div>
  );
};

export default SimpleMessage;
