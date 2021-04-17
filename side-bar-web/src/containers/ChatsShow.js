import React, { useEffect, useMemo, useReducer, useState } from "react";
import { useParams } from "react-router-dom";
import get from "lodash.get";

import SidebarApi from "../lib/sideBarApi";
import LocalStore, { MY_ATTENDEE_ID } from "../lib/localStore";
import {
  createVideoChatSession,
  setMediaSessionDeviceSettings,
  startMeetingSession,
  stopMeetingSession,
  pauseTile,
  unpauseTile,
} from "../lib/videoChat";

import ChatLinkCard from "../components/ChatLinkCard";
import ChatAttendeeCard from "../components/ChatAttendeeCard";
import ChatNonVideoCard from "../components/ChatNonVideoCard";
import ControlPanel from "../components/ControlPanel";
import JoinChat from "../components/JoinChat";
import SimpleMessage from "../components/SimpleMessage";
import MessageWithCTA from "../components/MessageWithCTA";
import Navigation from "../components/Navigation";

import attendeesReducer, { attendeesInitialState, AttendeeActionTypes } from "../reducers/attendeesReducer";

/* Inspired by redux-promise-middleware */
const Status = {
  IDLE: "IDLE",
  BLOCKED: "BLOCKED",
  PENDING: "PENDING",
  FULFILLED: "FULFILLED",
  REJECTED: "REJECTED",
};

const MeetingStatus = {
  IDLE: "IDLE",
  STARTED: "STARTED",
  ENDED: "ENDED",
};

function ChatsShow() {
  const { id } = useParams();

  const [attendeeId, setAttendeeId] = useState(
    LocalStore.getValue(MY_ATTENDEE_ID, "")
  );
  const [currentChat, setCurrentChat] = useState(null);
  const [meetingResponse, setMeetingResponse] = useState(null);
  const [attendeeResponse, setAttendeeResponse] = useState(null);
  const [meetingSession, setMeetingSession] = useState(null);

  const [joinChatStatus, setJoinChatStatus] = useState(
    !attendeeId ? Status.BLOCKED : Status.IDLE
  );
  const [connectChatStatus, setConnectChatStatus] = useState(Status.IDLE);
  const [meetingSessionStatus, setMeetingSessionStatus] = useState(
    MeetingStatus.IDLE
  );

  const [attendeesState, dispatchAttendees] = useReducer(attendeesReducer, attendeesInitialState);
  const [isMuted, setIsMuted] = useState(false);
  const localTileId = null;

  const _onJoinChatSuccess = (response) => {
    if (response.status === 401) {
      setJoinChatStatus(Status.BLOCKED);
      return;
    }
    setCurrentChat(get(response, "body.chat"));
    setAttendeeId(get(response, "body.attendeeId", ""));
    LocalStore.setValue(MY_ATTENDEE_ID, get(response, "body.attendeeId", ""));
    dispatchAttendees({
      type: AttendeeActionTypes.SET_ATTENDEES,
      payload: get(response, "body.attendees", {}),
    });
    setAttendeeResponse(get(response, "body.attendeeResponse", null));
    setMeetingResponse(get(response, "body.meetingResponse", null));
    setJoinChatStatus(Status.FULFILLED);
  };

  /*
    Step 1.
    Automatically request chat records, attendee records, and Chime meeting information
    for the chat using the attendee id in local storage (if available)
    If attendeeId is not present or authorized, request user input
  */
  const _autoJoinChatAsExistingAttendee = () => {
    if (!attendeeId && joinChatStatus !== Status.BLOCKED) {
      setJoinChatStatus(Status.BLOCKED);
      return;
    }
    if (joinChatStatus !== Status.IDLE) return;
    setJoinChatStatus(Status.PENDING);
    SidebarApi.joinChat(id, attendeeId)
      .then((response) => {
        if (response.status === 401) {
          setJoinChatStatus(Status.BLOCKED);
          return;
        }
        setCurrentChat(get(response, "body.chat"));
        setAttendeeId(get(response, "body.attendeeId"));
        LocalStore.setValue(MY_ATTENDEE_ID, attendeeId);
        dispatchAttendees({
          type: AttendeeActionTypes.SET_ATTENDEES,
          payload: get(response, "body.attendees", {}),
        });
        setAttendeeResponse(get(response, "body.attendeeResponse", null));
        setMeetingResponse(get(response, "body.meetingResponse", null));
        setJoinChatStatus(Status.FULFILLED);
      })
      .catch((error) => {
        console.error("join chat error", error);
        setJoinChatStatus(Status.REJECTED);
      });
  };
  useEffect(_autoJoinChatAsExistingAttendee, [id, attendeeId, joinChatStatus]);

  /*
    Step 2.
    Automatically try to instantiate a Chime Meeting session when it becomes available
  */
  const _autoConnectToChimeMeeting = () => {
    if (connectChatStatus !== Status.IDLE) return;
    if (!meetingResponse || !attendeeResponse) return;

    try {
      setConnectChatStatus(Status.PENDING);
      const meetingSession = createVideoChatSession(
        meetingResponse,
        attendeeResponse
      );
      setMeetingSession(meetingSession);
      setConnectChatStatus(Status.FULFILLED);
    } catch (error) {
      console.error("connect chat error", error);
      setConnectChatStatus(Status.REJECTED);
    }
  };
  useEffect(_autoConnectToChimeMeeting, [
    connectChatStatus,
    meetingResponse,
    attendeeResponse,
  ]);

  /*
    Step 3.
    Once a valid Chime meeting is established, user may start/stop audio/video at will
    They may also choose to leave, or if they are the host, end the meeting
  */
  const acquireVideoElement = ({ tileId, boundExternalUserId}) => {
    const existingVideoId = attendeesState.tileIdToVideoIdMap[tileId];
    if (existingVideoId !== undefined && existingVideoId !== null) {
      return document.getElementById(`video-${existingVideoId}`);
    }

    const videoIdToAcquire = Object.values(attendeesState.videoSlots).reduce((videoId, videoSlot) => {
      if (videoId == null) {
        const isFree = !Number.isInteger(videoSlot.tileId);
        if (isFree) {       
          videoId = videoSlot.videoId;
        }
      };

      return videoId;
    }, null);

    if (videoIdToAcquire !== null) {
      const videoElementToAcquire = document.getElementById(`video-${videoIdToAcquire}`)
      dispatchAttendees({
        type: AttendeeActionTypes.SET_VIDEO_SLOT,
        payload: {
          videoId: videoIdToAcquire,
          tileId: tileId,
          attendeeId: boundExternalUserId,
        },
      });
      
      return videoElementToAcquire;
    }

    throw new Error("No video element is available");
  };

  const releaseVideoElement = (tileId) => {
    dispatchAttendees({
      type: AttendeeActionTypes.RELEASE_VIDEO_TILE,
      payload: tileId,
    });
  };

  function onVideoTileDidUpdate(tileState) {
    if (!tileState.boundAttendeeId) return;
    dispatchAttendees({
      type: AttendeeActionTypes.SET_TILE,
      payload: tileState
    });
  };

  const _bindAttendeeTilesToVideoElements = () => {
    Object.values(attendeesState.tiles).forEach((tileState) => {
      if (tileState && !tileState.active) {
        const videoElement = acquireVideoElement(tileState);
        if (!videoElement) {
          console.warn('Cannot bind video tile - video element not found.')
          return;
        }
        meetingSession.audioVideo.bindVideoElement(tileState.tileId, videoElement);
      }
    })
  }
  useEffect(_bindAttendeeTilesToVideoElements, [attendeesState.tiles, meetingSession?.audioVideo]);

  const onVideoTileWasRemoved = (tileId) => {
    releaseVideoElement(tileId);
  };
  const onAudioVideoDidStop = () => {
    setMeetingSessionStatus(MeetingStatus.ENDED);
  };
  const setAttendeePresence = (_attendeeId, present, dropped) => {
    dispatchAttendees({
      type: AttendeeActionTypes.SET_ATTENDEE_PRESENCE,
      payload: {
        attendeeId: _attendeeId,
        present,
        dropped,
      }
    });
  }
  const handleStartMeetingSession = async () => {
    await setMediaSessionDeviceSettings(meetingSession);
    const audioElement = document.getElementById("audie");
    startMeetingSession(meetingSession, audioElement, {
      onAudioVideoDidStart: () =>
        setMeetingSessionStatus(MeetingStatus.STARTED),
      onVideoTileDidUpdate,
      onVideoTileWasRemoved,
      onAudioVideoDidStop,
      onMutedDidChange: (muted) => setIsMuted(muted),
    });

    setAttendeePresence(attendeeId, true, false);
  };

  const handleStopMeetingSession = async () => {
    await stopMeetingSession(meetingSession);
    await SidebarApi.leaveChat(id, attendeeId);
    LocalStore.clearValue(MY_ATTENDEE_ID);
  };

  const toggleVideo = () => {
    if (meetingSessionStatus === MeetingStatus.STARTED) {
      pauseTile(meetingSession, localTileId);
    } else {
      unpauseTile(meetingSession, localTileId);
    }
  }

  const videosConfig = useMemo(() => {
    return Object.values(attendeesState.videoSlots).reduce((memo, videoSlot) => {
      const { videoId, attendeeId, tileId } = videoSlot;
      return memo.concat({
        videoId,
        attendee: attendeesState.attendees[attendeeId],
        tileConfig: attendeesState.tiles[tileId],
        
      })
    }, []);
  }, [
    attendeesState.attendees,
    attendeesState.tiles,
    attendeesState.videoSlots,
  ]);

  const presentAttendeesCount = useMemo(() => {
    return Object.keys(attendeesState.attendees).reduce((count, id) => {
      if (attendeesState.attendees[id].present) {
        count++;
      }
      return count;
    }, 0);
  }, [attendeesState.attendees]);

  if (joinChatStatus === Status.BLOCKED) {
    return (
      <JoinChat
        onSubmit={(data) => SidebarApi.joinChatAsNewAttendee(id, data)}
        onSuccess={(response) => _onJoinChatSuccess(response)}
      />
    );
  }

  let content;
  if (meetingSessionStatus === MeetingStatus.ENDED) {
    content = (
      <MessageWithCTA
        message="You have left the conversation. Thanks for stopping by!"
        label="home"
        to="/"
      />
    );
  } else if (joinChatStatus === Status.PENDING) {
    content = <SimpleMessage message="Loading..." />;
  } else if (joinChatStatus === Status.REJECTED) {
    content = <SimpleMessage message="Chat is not available at this time." />;
  } else if (connectChatStatus === Status.REJECTED) {
    content = (
      <SimpleMessage message="Unable to connect to video. Please try again." />
    );
  } else if (connectChatStatus === Status.PENDING) {
    content = <SimpleMessage message="Connecting..." />;
  } else if (!currentChat && joinChatStatus === Status.FULFILLED) {
    content = (
      <MessageWithCTA
        message="Conversation does not exist."
        label="go back"
        to="/"
      />
    );
  } else {
    content = (
      <div className="flex-1 flex flex-col items-center justify-center pb1 pr1">
        <div className="ChatCard__grid grid grid-col-2">
          {
            Object.values(videosConfig).map(({ videoId, attendee, tileConfig}) => (
              <ChatAttendeeCard
                key={videoId}
                videoId={videoId}
                attendee={attendee}
                tileConfig={tileConfig}
              />
            ))
          }
          {presentAttendeesCount == 0 ? (
            <ChatNonVideoCard
              name={get(attendeesState.attendees, [attendeeId, "fullName"])}
              pronouns={get(attendeesState.attendees, [attendeeId, "pronouns", ])}
            />
          ) : null}
          {presentAttendeesCount < 4 ||
          meetingSessionStatus === MeetingStatus.IDLE ? (
            <ChatLinkCard />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="ChatsShow flex flex-col flex-1 bg-color-tennis">
      <Navigation negative>
        {connectChatStatus === Status.FULFILLED ? (
          <ControlPanel
            onStop={handleStopMeetingSession.bind(this)}
            onStart={handleStartMeetingSession.bind(this)}
            onToggleVideo={toggleVideo}
            onMute={() => console.debug("Mute audio")}
            onUnmute={() => console.debug("Restore audio")}
            onPauseVideo={() => pauseTile(meetingSession, localTileId)}
            onUnpauseVideo={() => unpauseTile(meetingSession, localTileId)}
            isMuted={isMuted}
            isStarted={meetingSessionStatus === MeetingStatus.STARTED}
          />
        ) : null}
      </Navigation>
      <main className="page-inner flex flex-1 flex-col">{content}</main>
      <audio id="audie" />
    </div>
  );
}

export default ChatsShow;
