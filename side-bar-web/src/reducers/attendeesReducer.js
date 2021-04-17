
export const attendeesInitialState = {
  attendees: {},
  attendeeIdToVideoIdMap: {},
  tileIdToVideoIdMap: {},
  tiles: {},
  videoSlots: {
    0: {  // localTile
      videoId: 0,
      attendeeId: null,
      tileId: null,
    },
    1: {
      videoId: 1,
      attendeeId: null,
      tileId: null,
    },
    2: {
      videoId: 2,
      attendeeId: null,
      tileId: null,
    },
    3: {
      videoId: 3,
      attendeeId: null,
      tileId: null,
    }
  },
}

export const AttendeeActionTypes = {
  SET_ATTENDEES: 'SET_ATTENDEES',
  SET_ATTENDEE_PRESENCE: 'SET_ATTENDEE_PRESENCE',
  SET_ATTENDEE_VIDEO_ID: 'SET_ATTENDEE_VIDEO_ID',
  SET_TILE: 'SET_TILE',
  SET_TILE_VIDEO_ID: 'SET_TILE_VIDEO_ID',
  SET_VIDEO_SLOT: 'SET_VIDEO_SLOT',
  RELEASE_VIDEO_TILE: 'RELEASE_VIDEO_TILE',
}

export default function attendeesReducer(state, action) {

  switch (action.type) {
    case AttendeeActionTypes.SET_ATTENDEES: {
      const attendeeIds = Object.keys(action.payload);
      return attendeeIds.reduce((_state, attendeeId) => {
        if (!attendeeId) return _state;
        return {
          ..._state,
          attendees: {
            ..._state.attendees,
            [attendeeId]: {
              ..._state.attendees[attendeeId],
              id: attendeeId,
              chimeAttendeeId: action.payload[attendeeId].chime_attendee_id,
              fullName: action.payload[attendeeId].full_name || '',
              pronouns: action.payload[attendeeId].pronouns || '',
            }
          }
        }
      }, state);
    }
    case AttendeeActionTypes.SET_ATTENDEE_PRESENCE: {
      const attendeeId = action.payload?.attendeeId;
      if (!attendeeId) {
        console.warn(action);
        return state;
      }
      return {
        ...state,
        attendees: {
          ...state.attendees,
          [attendeeId]: {
            ...state.attendees[attendeeId],
            id: attendeeId,
            present: action.payload.present,
            dropped: action.payload.dropped,
          }
        }
      };
    }
    case AttendeeActionTypes.SET_TILE: {
      const tileId = action.payload?.tileId;
      if (!tileId) {
        console.warn(action);
        return state;
      }
      return {
        ...state,
        tiles: {
          ...state.tiles,
          [tileId]: action.payload,
        }
      };
    }
    case AttendeeActionTypes.RELEASE_VIDEO_TILE: {
      const tileId = action.payload;
      const videoId = state.tileIdToVideoIdMap[tileId];
      return {
        ...state,
        tiles: {
          ...state.tiles,
          [tileId]: undefined,
        },
        tileIdToVideoIdMap: {
          ...state.tileIdToVideoIdMap,
          [tileId]: undefined,
        },
        videoSlots: {
          ...state.videoSlots,
          [videoId]: {
            ...state.videoSlots[videoId],
            tileId: undefined,
          }
        }
      }
    }
    case AttendeeActionTypes.SET_VIDEO_SLOT: {
      const { tileId, videoId, attendeeId, } = action.payload;
      if (!state.videoSlots[videoId]) {
        console.warn(action);
        return state;
      }
      if (
        Number.isInteger(state.tileIdToVideoIdMap[tileId]) 
        && state.tileIdToVideoIdMap[tileId] !== videoId
      ) {
        console.warn('RACE CONDITION', action, state.tileIdToVideoIdMap[tileId]);
        return state;
      }
      // console.debug('SET_VIDEO_SLOT', action.payload)
      const video = state.videoSlots[videoId];
      return {
        ...state,
        attendeeIdToVideoIdMap: {
          ...state.attendeeIdToVideoIdMap,
          [attendeeId]: videoId
        },
        tileIdToVideoIdMap: {
          ...state.tileIdToVideoIdMap,
          [tileId]: videoId
        },
        videoSlots: {
          ...state.videoSlots,
          [videoId]: {
            ...video,
            ...action.payload,
          },
        }
      };
    }
    default:
      console.warn('[attendeesReducer] Unknown action type:', action.type);
      return state;
  }
}
