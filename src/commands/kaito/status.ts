import { Message } from "discord.js";
import { getString, getObject } from "../../redis";

export default async function handle(message: Message) {
  const [stop, commands, tracker] = await Promise.all([
    getString("autocook"),
    getString("commands"),
    getString("tracker")
  ]);

  message.channel.send(
    `Auto Cook: ${stop}\n\nCommadns: ${commands}\n\nTracker: ${tracker}`
  );
}
