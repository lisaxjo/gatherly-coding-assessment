import React from "react";
import { Link } from "react-router-dom";

const Navigation = (props) => {
  return (
    <div className="flex justify-between items-center pt1 px2">
      <Link
        to="/"
        className="Button--link subheading font-vollkorn color-navy"
      >
        side/bar
      </Link>
      <div className="flex flex-1 justify-end">{props.children}</div>
    </div>
  );
};

export default Navigation;
