const AWS = require("aws-sdk/global");
const Chime = require("aws-sdk/clients/chime");
const dotenv = require("dotenv");
dotenv.config();
const uuid = require("uuid").v4;

const AWS_CHIME_REGION = "us-east-1"; // Must be us-east-1 for chime api
const AWS_CHIME_ENDPOINT = "https://service.chime.aws.amazon.com";

class AwsChime {
  constructor() {
    this._authenticate();
    this.chime = new Chime({ region: AWS_CHIME_REGION });
    this.chime.endpoint = new AWS.Endpoint(AWS_CHIME_ENDPOINT);
  }

  async fetchOrCreateMeeting (meetingId, externalMeetingId) {
    if (meetingId) {
      const existingMeeting = await this._fetchMeeting(meetingId);
      console.log(existingMeeting);
      if (existingMeeting) {
        console.log("Existing Chime meeting found with id ", meetingId);
        return existingMeeting;
      }
    }
    console.log("creating Chime meeting", externalMeetingId);
    return await this._createMeeting(externalMeetingId);
  };

  async fetchOrCreateMeetingAttendee  (
    meetingId,
    attendeeId,
    externalAttendeeId
  ) {
    if (meetingId) {
      const existingAttendee = await this._fetchMeetingAttendee(
        meetingId,
        attendeeId
      );
      if (existingAttendee) {
        console.log("Existing Chime attendee found with id ", attendeeId);
        return existingAttendee;
      }
    }
    console.log(
      "creating Chime attendee",
      externalAttendeeId,
      "for meeting",
      meetingId
    );
    return await this._createMeetingAttendee(meetingId, externalAttendeeId);
  };

  async deleteMeeting  (meetingId){
    await this.chime.deleteMeeting({ MeetingId: meetingId });
  };

  async deleteAttendee  (meetingId, attendeeId) {
    await this.chime.deleteAttendee({
      MeetingId: meetingId,
      AttendeeId: attendeeId,
    });
  };

  // private
  _authenticate () {
    try {
      AWS.config.credentials = new AWS.Credentials(
        process.env.AWS_ACCESS_KEY,
        process.env.AWS_SECRET_KEY
      );
    } catch (err) {
      console.log("AWS Auth failed: ", err);
      throw err;
    }
  };

  async _createMeeting  (_externalMeetingId)  {
    const externalMeetingId = _externalMeetingId || uuid();
    const meetingResponse = await this.chime
      .createMeeting({
        ClientRequestToken: uuid(),
        ExternalMeetingId: externalMeetingId, // Link the meeting to a doc managed by your application.
        MediaRegion: AWS_CHIME_REGION,
      })
      .promise();

    console.log("New Chime meeting created", meetingResponse);
    return meetingResponse;
  };

  async _createMeetingAttendee  (meetingId, _externalAttendeeId) {
    const externalAttendeeId = _externalAttendeeId || uuid();
    const attendeeResponse = await this.chime
      .createAttendee({
        MeetingId: meetingId,
        ExternalUserId: externalAttendeeId,
      })
      .promise();

    console.log("New Chime attendee created", attendeeResponse);
    return attendeeResponse;
  };

  async _fetchMeeting  (meetingId) {
    try {
      console.log("Fetch meeting with id", meetingId);
      return await this.chime.getMeeting({ MeetingId: meetingId }).promise();
    } catch (err) {
      if (err.code != "NotFound") {
        console.error("Error fetching chime meeting", meetingId, err);
      }
      return null;
    }
  };

  async _fetchMeetingAttendee (meetingId, attendeeId) {
    try {
      console.log(
        "Fetch attendee with id",
        attendeeId,
        "for meeting",
        meetingId
      );
      return await this.chime
        .getAttendee({
          MeetingId: meetingId,
          AttendeeId: attendeeId,
        })
        .promise();
    } catch (err) {
      if (err.code != "NotFound") {
        console.error("Error fetching chime attendee", meetingId, err);
      }
      return null;
    }
  };
}

module.exports = AwsChime;
