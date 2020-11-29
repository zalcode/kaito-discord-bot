import { Message } from "discord.js";


export function getFields(message: Message) {
  return message?.embeds?.[0]?.fields || [];
}
