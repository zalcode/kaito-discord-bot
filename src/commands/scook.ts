import { Collection, EmbedField, Message, MessageEmbed } from "discord.js";
import autoCook from "../auto/autoCook";
import { isSuccessCook } from "../helpers/cook";
import { client } from "../redis";
import { sendMessage } from "../services/api";

async function handle(message: Message, args: string[]) {
  if (message.author.bot || args.length === 0) return;

  const cook = await isSuccessCook(message, args[0]);

  if (cook === undefined) return;

  setTimeout(() => {
    autoCook(message);
  }, cook.time);
}

export default handle;
