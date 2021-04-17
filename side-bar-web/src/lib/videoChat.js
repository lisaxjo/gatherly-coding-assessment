import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  DefaultModality,
  LogLevel,
  MeetingSessionConfiguration,
  MeetingSessionStatusCode,
} from "amazon-chime-sdk-js";
import get from "lodash.get";

export const createVideoChatSession = (meetingResponse, attendeeResponse) => {
  const configuration = new MeetingSessionConfiguration(
    meetingResponse,
    attendeeResponse
  );
  const logger = new ConsoleLogger("MyLogger", LogLevel.INFO);
  const deviceController = new DefaultDeviceController(logger);
  const meetingSession = new DefaultMeetingSession(
    configuration,
    logger,
    deviceController
  );
  return meetingSession;
};

export const setMediaSessionDeviceSettings = async (meetingSession) => {
  /* This method assumes defaults. An improvement could allow users to choose from the list */
  const audioInputDevices = await meetingSession.audioVideo.listAudioInputDevices();
  const audioOutputDevices = await meetingSession.audioVideo.listAudioOutputDevices();
  const videoInputDevices = await meetingSession.audioVideo.listVideoInputDevices();

  await meetingSession.audioVideo.chooseAudioInputDevice(
    get(audioInputDevices, "[0].deviceId")
  );
  await meetingSession.audioVideo.chooseAudioOutputDevice(
    get(audioOutputDevices, "[0].deviceId")
  );
  await meetingSession.audioVideo.chooseVideoInputDevice(
    get(videoInputDevices, "[0].deviceId")
  );
};

/* TODO pass listeners to the observer */
export const startMeetingSession = async (
  meetingSession,
  htmlAudioElement,
  observerCallbacks
) => {
  const {
    onAudioVideoDidStart,
    onVideoTileDidUpdate,
    onVideoTileWasRemoved,
    onAudioVideoDidStop,
  } = observerCallbacks;

  meetingSession.audioVideo.bindAudioElement(htmlAudioElement);

  const audioVideoObserver = {
    audioVideoDidStart: () => {
      console.log("audioVideoDidStart");
      onAudioVideoDidStart();
    },
    audioVideoDidStop: (sessionStatus) => {
      const sessionStatusCode = sessionStatus.statusCode();
      if (sessionStatusCode === MeetingSessionStatusCode.Left) {
        console.log("You left the session");
      } else {
        console.log("Stopped with a session status code: ", sessionStatusCode);
      }
      onAudioVideoDidStop(sessionStatus);
    },
    audioVideoDidStartConnecting: (reconnecting) => {
      console.log("audioVideoDidStartConnecting", reconnecting);
    },
    remoteVideoSourcesDidChange: (videoSources) => {
      console.log("remoteVideoSourcesDidChange");
      videoSources.forEach((videoSource) => {
        const { attendee } = videoSource;
        console.log(
          `An attendee (${attendee.attendeeId} ${attendee.externalUserId}) is sending video`
        );
      });
    },
    videoAvailabilityDidChange: (availability) => {
      console.debug("videoAvailabilityDidChange", availability);
    },
    videoTileDidUpdate: (tileState) => {
      onVideoTileDidUpdate(tileState);
    },
    videoTileWasRemoved: (tileId) => {
      onVideoTileWasRemoved(tileId);
    },
  };

  meetingSession.audioVideo.addObserver(audioVideoObserver);

  await meetingSession.audioVideo.start();
  await meetingSession.audioVideo.startLocalVideoTile();

  return meetingSession;
};

export const startMeetingSessionVideo = (meetingSession) => {
  meetingSession.audioVideo.startLocalVideoTile();
};

export const stopMeetingSessionVideo = (meetingSession) => {
  meetingSession.audioVideo.stopLocalVideoTile();
  meetingSession.audioVideo.removeLocalVideoTile();
};

export const pauseTile = async (meetingSession, tileId) => {
  await meetingSession.audioVideo.pauseVideoTile(tileId);
  await meetingSession.audioVideo.chooseVideoInputDevice(null);
};
export const unpauseTile = async (meetingSession, tileId) => {
  await meetingSession.audioVideo.unpauseVideoTile(tileId);
};

export const stopMeetingSession = (meetingSession) => {
  // Teardown meeting session for this user only
  // To terminate the entire meeting for everyone, use an HTTP call to the Chime DeleteMeeting API
  meetingSession.audioVideo.stop();
};
