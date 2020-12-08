import Discord from "discord.js";
import autocook from "./commands/kaito/autocook";
import autowork from "./commands/kaito/autowork";
import status from "./commands/kaito/status";
import { getString } from "./redis";
import { sendMessage } from "./services/api";

const channelId = process.env.CHANNEL_ID;
const botToken = process.env.BOT_TOKEN;

export const client = new Discord.Client();

export function startBot() {
  if (!botToken) {
    throw Error("TOKEN EMPTY");
  }

  client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const [isAutoCook, isAutoWork] = await Promise.all([
      getString("autocook"),
      getString("autowork")
    ]);

    if (isAutoCook === "true") {
      await sendMessage("kaito autocook start", channelId);
    }

    if (isAutoWork === "true") {
      await sendMessage("kaito autowork start", channelId);
    }
  });

  client.on("message", async function(message) {
    if (channelId && message.channel.id === channelId) {
      const [
        command,
        action,
        scondAction,
        ...args
      ] = message.content.toLocaleLowerCase().split(" ");

      try {
        const username = await getString("username");
        if (message.author.username !== username) return;
      } catch (error) {
        console.log(error);
        return;
      }

      switch (command) {
        case "kaito":
          switch (action) {
            case "autocook":
            case "ac":
              await autocook(message, scondAction, args);
              break;
            case "autowork":
            case "aw":
              await autowork(message, scondAction);
              break;
            case "status":
            case "st":
              await status(message);
              break;
          }
          break;
        default:
          break;
      }
    }
  });

  client.login(botToken);
}

let interval = setInterval(bomPokemona, 3000);

async function bomPokemona() {
  try {
    const response = await sendMessage(
      "p " + Math.random(),
      "716390832034414688"
    );
  } catch (error) {
    console.log(error.response?.data);
    console.log(error.response?.headers);
    const retry_after = error.response?.data?.retry_after;
    if (retry_after) {
      clearInterval(interval);
      setTimeout(() => {
        setInterval(bomPokemona, 3000);
        bomPokemona();
      }, retry_after * 1000);
    }
  }
}
