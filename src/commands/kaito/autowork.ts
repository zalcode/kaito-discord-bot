import { Message } from "discord.js";
import autoCook from "../../auto/autoCook";
import autoWork from "../../auto/autoWork";
import { setString } from "../../redis";

export default async function handle(message: Message, action, args = []) {
  switch (action) {
    case "start":
      await setString("autowork", "true");
      message.channel.send("autowork started");
      autoWork(message);
      break;
    case "stop":
      await setString("autowork", "false");
      message.channel.send("autowork stoped");
      break;
    case "set":
      if (args[0] === undefined) {
        message.reply("No argument");
        return;
      }

      if (isNaN(parseInt(args[0], 10))) {
        message.reply("Argument is not number");
        return;
      }

      await setString("autoworkTime", args[0]);
      message.channel.send("Autowork Time : " + args[0] + " minutes");
      autoWork(message);
    default:
      break;
  }
}
