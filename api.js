const awsChime = require("./lib/awsChime");
const DatabaseQuery = require("./db/queries");
class SidebarApi {
  constructor() {
    DatabaseQuery.testConnection();
    this.awsChime = new awsChime();
    console.log("Connecting to video chat provider... SUCCESS");
  }

  getChats = (request, response) => {
    DatabaseQuery.queryChats(
      (chats) => {
        const data = {
          chats,
        };
        response.status(200).json(data);
      },
      (error) => {
        this._handleError("getChats::_queryChatById", response, error);
      }
    );
  };

  createChat = async (request, response) => {
    console.log("createChat::INIT", JSON.stringify(request.body));
    DatabaseQuery.newChat(
      (chatId) => {
        const { fullName, pronouns } = request.body;
        DatabaseQuery.newAttendee(
          chatId,
          fullName,
          pronouns,
          (attendeeId) => {
            DatabaseQuery.updateChatHostingAttendeeId(
              chatId,
              attendeeId,
              () => {
                const data = {
                  chatId,
                  hostingAttendeeId: attendeeId,
                };
                console.log("createChat::SUCCESS", data);
                response.status(201).send(data);
              },
              (error) => {
                this._handleError(
                  "createChat::_updateChatHostingAttendeeId",
                  response,
                  error
                );
              }
            );
          },
          (error) => {
            this._handleError("createChat::_newAttendee", response, error);
          }
        );
      },
      (error) => {
        this._handleError("createChat::_newChat", response, error);
      }
    );
  };

  joinChat = (request, response) => {
    console.log("joinChat::INIT", JSON.stringify(request.params));
    const { chatId, attendeeId } = request.params;

    DatabaseQuery.queryChatById(
      chatId,
      (chat) => {
        if (!chat) {
          response.status(404).send("Chat not found");
          return;
        }
        DatabaseQuery.queryAttendeeById(
          attendeeId,
          (attendee) => {
            if (!attendee || attendee.chat_id !== chatId) {
              response.status(401).send("Attendee not found");
              return;
            }
            console.log("Joining chat as existing attendee...");
            this._handleJoinChatResponse(
              chat,
              attendeeId,
              attendee.chime_attendee_id,
              response
            );
          },
          (error) => {
            this._handleError("joinChat::_queryAttendeeById", response, error);
          }
        );
      },
      (error) => {
        this._handleError("joinChat::_queryChatById", response, error);
      }
    );
  };

  joinChatAsNewAttendee = (request, response) => {
    console.log(
      "joinChatAsNewAttendee::INIT",
      request.params,
      JSON.stringify(request.body)
    );
    const { chatId } = request.params;
    const { fullName, pronouns = "They/them" } = request.body;

    DatabaseQuery.queryChatById(
      chatId,
      (chat) => {
        if (!chat || !chat.id) {
          this._handleError(
            "joinChatAsNewAttendee",
            response,
            new Error("Chat not found")
          );
        }

        DatabaseQuery.newAttendee(
          chat.id,
          fullName,
          pronouns,
          (attendeeId) => {
            DatabaseQuery.queryAttendeeById(
              attendeeId,
              (attendee) => {
                console.log("Joining chat as new attendee...");
                this._handleJoinChatResponse(
                  chat,
                  attendeeId,
                  attendee.chime_attendee_id,
                  response
                );
              },
              (error) => {
                this._handleError(
                  "joinChatAsNewAttendee::_queryAttendeeById",
                  response,
                  error
                );
              }
            );
          },
          (error) => {
            this._handleError(
              "joinChatAsNewAttendee::_newAttendee",
              response,
              error
            );
          }
        );
      },
      (error) => {
        this._handleError(
          "joinChatAsNewAttendee::_queryChatById",
          response,
          error
        );
      }
    );
  };

  leaveChat = (request, response) => {
    console.log("leaveChat::INIT", JSON.stringify(request.params));
    const { chatId, attendeeId } = request.params;
    if (!chatId || !attendeeId) {
      this._handleError("leaveChat", response, "Invalid params");
      return;
    }

    DatabaseQuery.queryChatById(
      chatId,
      (chat) => {
        if (!chat) {
          response.status(404).send("Chat not found");
          return;
        }
        const isHost = chat.hosting_attendee_id === attendeeId;
        const chimeMeetingId = chat.chime_meeting_id;
        if (isHost) {
          this._handleDeleteChat(chatId, chimeMeetingId, response);
        } else {
          this._handleDeleteAttendee(
            chatId,
            attendeeId,
            chimeMeetingId,
            response
          );
        }
      },
      (error) => this._handleError("leaveChat", response, error)
    );
  };

  _handleDeleteChat = async (chatId, chimeMeetingId, response) => {
    try {
      await this.awsChime.deleteMeeting(chimeMeetingId);
    } catch (error) {
      this._handleError(
        "_handleDeleteChat::awsChat.deleteMeeting",
        response,
        error
      );
      return;
    }

    DatabaseQuery.deleteChat(
      chatId,
      () => {
        console.log(`Chat ${chatId} deleted by hosting attendee.`);
        response.status(204);
      },
      (error) =>
        this._handleError("_handleDeleteChat::_deleteChat", response, error)
    );
  };

  _handleDeleteAttendee = (chatId, attendeeId, chimeMeetingId, response) => {
    DatabaseQuery.queryAttendeesByChatId(
      chatId,
      async (attendees) => {
        const attendee = attendees.some(
          (attendee) => attendee.id === attendeeId
        );
        if (!attendee) {
          this._handleError(
            "_handleDeleteAttendee::_queryAttendeesByChatId",
            response,
            "Attendee does not belong to chat"
          );
          return;
        }

        try {
          await this.awsChime.deleteAttendee(
            chimeMeetingId,
            attendee.chimeAttendeeId
          );
        } catch (error) {
          this._handleError(
            "_handleDeleteAttendee::awsChat::deleteAttendee",
            response,
            error
          );
          return;
        }

        DatabaseQuery.deleteAttendee(
          attendeeId,
          async () => {
            console.log(
              `Attendee with id ${attendeeId} has left the chat ${chatId}`
            );
            response.status(204);
          },
          (error) =>
            this._handleError(
              "_handleDeleteAttendee::_deleteAttendee",
              response,
              error
            )
        );
      },
      (error) => {
        this._handleError("_handleDeleteAttendee", response, error);
      }
    );
  };

  _handleJoinChatResponse = async (
    chat,
    attendeeId,
    chimeAttendeeId,
    response
  ) => {
    const meetingResponse = await this.awsChime.fetchOrCreateMeeting(
      chat.chime_meeting_id,
      chat.id
    );
    const chimeMeetingId = meetingResponse.Meeting.MeetingId;

    DatabaseQuery.updateChatChimeMeetingId(
      chat.id,
      chimeMeetingId,
      async () => {
        chat.chime_meeting_id = chimeMeetingId;
        const attendeeResponse = await this.awsChime.fetchOrCreateMeetingAttendee(
          chimeMeetingId,
          chimeAttendeeId,
          attendeeId
        );
        DatabaseQuery.updateAttendeeChimeAttendeeId(
          attendeeId,
          attendeeResponse.Attendee.AttendeeId,
          () => {
            DatabaseQuery.queryAttendeesByChatId(
              chat.id,
              (attendees) => {
                const data = {
                  chat,
                  attendeeId,
                  attendees: this._makeListMap(attendees, "id"),
                  meetingResponse,
                  attendeeResponse,
                };
                response.status(200).send(data);
              },
              (error) => {
                this._handleError(
                  "_handleJoinChatResponse::_queryAttendeesByChatId",
                  response,
                  error
                );
              }
            );
          },
          (error) => {
            this._handleError(
              "_handleJoinChatResponse::_updateAttendeeChimeAttendeeId",
              response,
              error
            );
          }
        );
      },
      (error) => {
        this._handleError(
          "_handleJoinChatResponse::_updateChatChimeMeetingId",
          response,
          error
        );
      }
    );
  };

  // private
  _handleError = (tag = "", response, error) => {
    console.error(`ERROR: (${tag})`, error.toString());
    response.status(500).json("Server Error.");
  };

  _makeListMap = (arr, primaryKey) => {
    return arr.reduce((map, item) => {
      if (item && item.hasOwnProperty(primaryKey)) {
        map[item[primaryKey]] = item;
      }
      return map;
    }, {});
  };
}

module.exports = SidebarApi;
