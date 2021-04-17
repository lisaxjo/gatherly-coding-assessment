import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import ChatsShow from "./containers/ChatsShow";
import ChatsNew from "./containers/ChatsNew";

export const RouteMap = {
  ROOT: {
    path: "/",
    exact: true,
    component: () => ChatsNew,
  },
  CHATS_SHOW: {
    path: "/chats/:id",
    exact: false,
    component: () => ChatsShow,
  },
  FALLBACK: {
    path: "*",
    exact: false,
    component: () => ChatsNew,
  },
};

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/chats/:id">
          <ChatsShow key="show"/>
        </Route>
        <Route path="/">
          <ChatsNew />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
