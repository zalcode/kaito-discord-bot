import axios from "axios";
import rateLimit from "axios-rate-limit";

const http = rateLimit(axios.create(), {
  maxRequests: 1,
  perMilliseconds: 2000
});

function getEnv() {
  return {
    superProperty: process.env.SUPER_PROPERTY,
    token: process.env.TOKEN
  };
}

function createConfig() {
  const { token, superProperty } = getEnv();

  return {
    headers: {
      accept: "*/*",
      "accept-language": "en-US",
      authorization: token,
      "content-type": "application/json",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-super-properties": superProperty
    }
  };
}

export function sendMessage(content, channelId) {
  return http.post(
    `https://discord.com/api/v8/channels/${channelId}/messages`,
    {
      content,
      tts: false
    },
    createConfig()
  );
}
