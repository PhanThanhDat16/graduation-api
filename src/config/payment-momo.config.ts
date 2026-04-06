import dotenv from "dotenv";

dotenv.config();

interface Config {
  momo: {
    partnerCode: string;
    accessKey: string;
    secretKey: string;
    endpoint: string;
    returnUrl: string;
    notifyUrl: string;
  };
  mongo: {
    uri: string;
  };
  port: number;
}

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// config momo
const config: Config = {
  momo: {
    partnerCode: getEnvVar("MOMO_PARTNER_CODE"),
    accessKey: getEnvVar("MOMO_ACCESS_KEY"),
    secretKey: getEnvVar("MOMO_SECRET_KEY"),
    endpoint: getEnvVar("MOMO_ENDPOINT"),
    returnUrl: getEnvVar("MOMO_RETURN_URL"),
    notifyUrl: getEnvVar("MOMO_NOTIFY_URL"),
  },
  mongo: {
    uri: getEnvVar("MONGODB_URL"),
  },
  port: parseInt(process.env.PORT || "3000", 10),
};

export default config;
