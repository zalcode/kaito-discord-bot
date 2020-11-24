import Discord from "discord.js";
import scook from "./commands/scook";
import swork from "./commands/swork";

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
      // TODO: FOR DEBUGGING
      // if (message.author.bot) {
      //   const embed = message.embeds[0];
      //   if (embed) {
      //     console.log(embed);
      //     console.log(embed.title.indexOf("Dapur"));
      //   }
      // }

      const [command, ...args] = message.content.toLocaleLowerCase().split(" ");

      switch (command) {
        case "scook":
          scook(message, args);
          break;
        case "swork":
          swork(message);
          break;
        default:
          break;
      }
    }
  });

  client.login(botToken);
}
