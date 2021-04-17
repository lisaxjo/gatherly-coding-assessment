import React from "react";
import {
  Hearing,
  Visibility,
  VolumeOff,
 } from "@material-ui/icons";

const ControlPanel = (props) => {
  return (
    <>
      <button
        className="Button--hollow mr_5"
        disabled={!props.isStarted || props.isMuted}
        onClick={props.onMute}
      >
        <VolumeOff />
      </button>
      <button
        className="Button--hollow mr_5"
        disabled={!props.isStarted}
        onClick={props.onUnmute}
      >
        <Hearing />
      </button>
      <button
        className="Button--hollow mr_5"
        disabled={!props.isStarted}
        onClick={props.onToggleVideo}
      >
       <Visibility />
      </button>
      <button
        className="Button--hollow mr_5"
        disabled={!props.isStarted}
        onClick={props.onStop}
      >
        leave
      </button>
      <button
        className="Button--hollow"
        disabled={props.isStarted}
        onClick={props.onStart}
      >
        start
      </button>
    </>
  );
};

export default ControlPanel;
