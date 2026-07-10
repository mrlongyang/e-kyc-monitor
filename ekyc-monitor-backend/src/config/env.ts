import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || "4000",

  // Database
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: process.env.DB_PORT || "3306",
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "ekyc_monitor",

  // SSH
  SSH_HOST: process.env.SSH_HOST || "",
  SSH_PORT: Number(process.env.SSH_PORT || 22),
  SSH_USERNAME: process.env.SSH_USERNAME || "",
  SSH_PASSWORD: process.env.SSH_PASSWORD || "",
  SSH_WORKDIR: process.env.SSH_WORKDIR || "",
};

// Debug (temporary)
console.log("================================");
console.log("SSH_HOST:", env.SSH_HOST);
console.log("SSH_PORT:", env.SSH_PORT);
console.log("SSH_USERNAME:", env.SSH_USERNAME);
console.log("SSH_PASSWORD_LENGTH:", env.SSH_PASSWORD.length);
console.log("SSH_WORKDIR:", env.SSH_WORKDIR);
console.log("================================");