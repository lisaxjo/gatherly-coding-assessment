const db = require('./db');
const uuid = require("uuid").v4;

module.exports = {
  testConnection: () => {
    db.select('*')
      .from('chats')
      .then(rows => {
        console.log('Db connection initialized. There are currently', rows.length, 'chats in the database,');
      })
      .catch(err => {
        console.error(err)
      });
  },

  queryChate: (onSuccess, onError) => {
    db.select('*')
      .from('chats')
      .orderBy('created_at', 'desc')
      .then(onSuccess)
      .catch(onError);
  },

  queryChatById: (id, onSuccess, onError) => {
    db.select('*')
      .from('chats')
      .where('id', id)
      .then(rows => {
        onSuccess(rows[0]);
      })
      .catch(onError);
  },

  queryAttendeeById: (id, onSuccess, onError) => {
    db.select('*')
      .from('attendees')
      .where('id', id)
      .then(rows => {
        onSuccess(rows[0]);
      })
      .catch(onError);
  },

  queryAttendeesByChatId: (id, onSuccess, onError) => {
    db.select('*')
      .from('attendees')
      .where('chat_id', id)
      .then(onSuccess)
      .catch(onError)
  },

  updateAttendeeChimeAttendeeId: (
    id,
    chimeAttendeeId,
    onSuccess,
    onError
  ) => {
    db('attendees')
      .where('id', id)
      .update({ chime_attendee_id: chimeAttendeeId })
      .then(() => onSuccess(true))
      .catch(onError);
  },

  updateChatChimeMeetingId: (id, chimeMeetingId, onSuccess, onError) => {
    db('chats')
      .where('id', id)
      .update({ chime_meeting_id: chimeMeetingId })
      .then(() => onSuccess(true))
      .catch(onError);
  },

  updateChatHostingAttendeeId: (
    id,
    hostingAttendeeId,
    onSuccess,
    onError
  ) => {
    db('chats')
      .where('id', id)
      .update({ hosting_attendee_id: hostingAttendeeId })
      .then(() => onSuccess(true))
      .catch(onError);
  },

  newChat: (onSuccess, onError) => {
    const chatId = uuid();
    const NOW = new Date();
    db('chats')
      .insert({
        id: chatId,
        created_at: NOW,
        updated_at: NOW,
      })
      .then(() => onSuccess(chatId))
      .catch(onError);
  },

  newAttendee: (chatId, fullName, pronouns, onSuccess, onError) => {
    if (!fullName) {
      const error = new Error("Full name is required.");
      onError(error);
      return;
    }
    const attendeeId = uuid();
    const NOW = new Date();
    db('attendees')
      .insert({
        id: attendeeId,
        chat_id: chatId,
        full_name: fullName,
        pronouns,
        created_at: NOW,
        updated_at: NOW,
      })
      .then(() => onSuccess(attendeeId))
      .catch(onError);
  },

  deleteChat: (id, onSuccess, onError) => {
    db('attendees')
      .where('chat_id', id)
      .del()
      .then(() => {
        db('chats')
          .where('id', id)
          .del()
          .then(() => onSuccess(true))
          .catch(onError)
      })
      .catch(onError);
  },

  deleteAttendee: (id, onSuccess, onError) => {
    db('attendees')
      .where('id', id)
      .where('id', id)
      .del()
      .then(() => onSuccess(true))
      .catch(onError);
  },
}
