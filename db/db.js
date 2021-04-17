const path = require('path');
const dbPath = path.resolve(__dirname, './database.sqlite');

const db = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: dbPath,
  },
  useNullAsDefault: true
});

db.schema
  .hasTable('chats')
  .then((exists) => {
    if (!exists) {
      return db.schema.createTable('chats', (table)  => {
        table.string('id').primary();
        table.string('chime_meeting_id');
        table.string('hosting_attendee_id');
        table.integer('started_at');
        table.integer('created_at');
        table.integer('updated_at');
      })
      .then(() => {
        console.log('created chats table');
      })
      .catch((error) => {
        console.error(`Error creating chats table: ${error}`)
      })
    }
  }
);

db.schema
  .hasTable('attendees')
  .then((exists) => {
    if (!exists) {
      return db.schema.createTable('attendees', (table)  => {
        table.string('id').primary();
        table.string('chat_id').references('id').inTable('chats');
        table.string('full_name');
        table.string('pronouns');
        table.string('chime_attendee_id');
        table.string('chime_attendee_token');
        table.integer('joined_at');
        table.integer('left_at');
        table.integer('created_at');
        table.integer('updated_at');
      })
      .then(() => {
       console.log('created attendees table');
      })
      .catch((error) => {
        console.error(`Error creating attendees table: ${error}`)
      })
    }
  }
);

module.exports = db;