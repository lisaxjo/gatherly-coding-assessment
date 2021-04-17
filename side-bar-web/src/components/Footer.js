import React from "react";

import config from "../lib/config";

const Navigation = () => {
  return (
    <div
      className="flex tiny font-inter color-tennis justify-center py_5"
    >
      <p className="mr_5">
        made by{" "}
        <a
          className="Button--link inherit-visited font-inter-bold"
          href={config.AUTHOR_HOMEPAGE_URL}
          target="_blank"
          rel="noreferrer"
        >
          {config.AUTHOR_NAME}
        </a>{" "}
        in 2020
      </p>
    </div>
  );
};

export default Navigation;
