const getEnv = (key) => {
  const envVar = process.env[key];
  if (!envVar)
    throw new ReferenceError(`Environment Variable (${key}) Not Found`);
  return envVar;
};

const Config = {
  DEVELOPMENT: process.env.NODE_ENV === "development",
  PRODUCTION: process.env.NODE_ENV === "production",
  HOST: getEnv("REACT_APP_HOST"),
  AUTHOR_NAME: "Anonymous Antelope",
  AUTHOR_HOMEPAGE_URL: "https://www.gatherly.io/",
};

export default Config;
