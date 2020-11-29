import { Message } from "discord.js";
import autoCook from "../../auto/autoCook";
import autoWork from "../../auto/autoWork";
import { setString, getString, setObject } from "../../redis";
import { Tracker } from "../../types";

export default async function handle(message: Message, action) {
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
    default:
      break;
  }
}
