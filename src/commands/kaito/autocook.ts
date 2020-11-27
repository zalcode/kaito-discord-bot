import { Message } from "discord.js";
import { client } from "../../redis";
import autoCook from "../../auto/autoCook";

export default async function handle(message: Message, action) {
  switch (action) {
    case "start":
      await client.set("autocook", "true");
      message.channel.send("autocook start");
      autoCook(message);
      break;
    case "stop":
      await client.set("autocook", "false");
      message.channel.send("autocook stop");
      break;
    default:
      break;
  }
}
