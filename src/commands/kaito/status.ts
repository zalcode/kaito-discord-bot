import { Message } from "discord.js";
import { getString, getObject } from "../../redis";

export default async function handle(message: Message) {
  const [stop, commands, tracker] = await Promise.all([
    getString("autocook"),
    getString("cookActions"),
    getString("cookTracker")
  ]);

  message.channel.send(
    `
    **Kaito Status**
    Auto Cook\t\t  : ${stop}
    Cooking list\t\t: ${commands}
    Cook Tracker\t : ${tracker}`
  );
}
