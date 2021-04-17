const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const dotenv = require("dotenv");

dotenv.config();
const IS_DEV = process.env.ENVIRONMENT === "development";
const PORT = process.env.PORT;

console.log(`Starting Sidebar chat application. (IS_DEV=${IS_DEV})`);

const SidebarApi = require("./api");
const api = new SidebarApi();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  next();
});

if (IS_DEV) {
  app.get("/", (request, response) => {
    response.json({ info: "Sidebar API is running locally." });
  });
}

app.get("/api/chats", api.getChats);
app.post("/api/chats", api.createChat);
app.post("/api/chats/:chatId/attendees", api.joinChatAsNewAttendee);
app.put("/api/chats/:chatId/attendees/:attendeeId", api.joinChat);
app.delete("/api/chats/:chatId/attendees/:attendeeId", api.leaveChat);

if (!IS_DEV) {
  console.log("Configuring static routes...");
  app.use(express.static(path.join(__dirname, "build")));
  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}.`);
});
