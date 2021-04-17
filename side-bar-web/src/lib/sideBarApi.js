import config from "./config";

const SidebarApi = {
  createChat: async (data) => {
    if (!data.fullName) {
      throw new Error("Full name is required");
    }
    const response = await fetch(`${config.HOST}/api/chats/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const body = await response.json();
    return {
      ...response,
      body,
    };
  },
  joinChatAsNewAttendee: async (chatId, data) => {
    const response = await fetch(
      `${config.HOST}/api/chats/${chatId}/attendees/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    return {
      ...response,
      body: await response.json(),
    };
  },
  joinChat: async (chatId, attendeeId) => {
    if (!attendeeId) throw new Error("Attendee is required to join chat");
    try {
      const response = await fetch(
        `${config.HOST}/api/chats/${chatId}/attendees/${attendeeId}`,
        {
          method: "PUT",
        }
      );

      if (response.status === 401) {
        return {
          status: 401,
          body: "Unauthorized: Could not join chat as provided attendee",
        };
      }

      return {
        ...response,
        body: await response.json(),
      };
    } catch (error) {
      throw error;
    }
  },
  leaveChat: async (chatId, attendeeId) => {
    if (!chatId) {
      throw new Error("chatId is required");
    }
    if (!attendeeId) {
      throw new Error("attendeeId is required");
    }
    const response = await fetch(
      `${config.HOST}/api/chats/${chatId}/attendees/${attendeeId}`,
      {
        method: "DELETE",
      }
    );
    return {
      ...response,
      body: await response.json(),
    };
  },
};

export default SidebarApi;
