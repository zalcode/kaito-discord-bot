import Discord from "discord.js";
import scook from "./commands/scook";
import swork from "./commands/swork";
import autocook from "./commands/kaito/autocook";
import status from "./commands/kaito/status";

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

  client.on("message", function(message) {
    if (channelId && message.channel.id === channelId) {
      const [
        command,
        action,
        ...args
      ] = message.content.toLocaleLowerCase().split(" ");

      switch (command) {
        case "kaito":
          switch (action) {
            case "change":
              // TODO
              break;
            case "autocook":
              autocook(message, args?.[0]);
              break;
            case "status":
              status(message);
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
