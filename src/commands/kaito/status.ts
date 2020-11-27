import { Message } from "discord.js";
import { client, getObject } from "../../redis";

export default async function handle(message: Message) {
  const [stop, commands, tracker] = await Promise.all([
    client.get("autocook"),
    client.get("commands"),
    client.get("tracker")
  ]);

  message.channel.send(
    `Auto Cook: ${stop}\n\nCommadns: ${commands}\n\nTracker: ${tracker}`
  );
}
