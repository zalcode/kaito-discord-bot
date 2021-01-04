import { Message } from "discord.js";
import autoCook from "../auto/autoCook";
import { isSuccessCook } from "../helpers/cook";

async function handle(message: Message, args: string[]) {
  if (message.author.bot) return;

  const cook = await isSuccessCook(message, args[0]);

  if (cook === undefined) {
    console.log("Cook not found");
    console.log(args, cook, message.embeds?.[0]?.fields);
    return;
  }

  if (cook.time > 0) {
    setTimeout(() => {
      message.reply(
        `**${cook.cookName}** sudah matang. Segera angkat sebelum gosong.`
      );
    }, cook.time * 1000 + 1000);

    message.channel.send(
      `**${message?.author?.username}**, sepertinya kamu masak **${cook.cookName}**,
      nanti akan diingatkan setelah ${cook.time} detik`
    );
  }
}

export default handle;
