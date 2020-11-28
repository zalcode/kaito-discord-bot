import Discord from "discord.js";
import autocook from "./commands/kaito/autocook";
import status from "./commands/kaito/status";
import { getString } from "./redis";

const channelId = process.env.CHANNEL_ID;
const botToken = process.env.BOT_TOKEN;

export const client = new Discord.Client();

export function startBot() {
  if (!botToken) {
    throw Error("TOKEN EMPTY");
  }

  client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

  client.on("message", async function(message) {
    if (channelId && message.channel.id === channelId) {
      const [
        command,
        action,
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
              await autocook(message, args?.[0]);
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
