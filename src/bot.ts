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
            case "change":
              // TODO
              break;
            case "autocook":
              await autocook(message, scondAction, args);
              break;
            case "autowork":
              await autowork(message, scondAction);
              break;
            case "status":
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
