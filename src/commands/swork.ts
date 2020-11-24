import { Message, Collection, MessageEmbed } from "discord.js";

function filterMessage(message: Message) {
  if (message.author.bot && message.embeds.length > 0) {
    let embed: MessageEmbed | undefined = message.embeds[0];

    return embed && embed.title.indexOf("Working Time") > -1;
  }
  return false;
}

function handle(message: Message) {
  if (message.author.bot) return;
  message.channel
    .awaitMessages(filterMessage, {
      max: 2,
      time: 2000
    })
    .then((collected: Collection<string, Message>) => {
      const col = collected.first();
      if (col) {
        message.reply(
          `kamu sudah bekerja, nanti akan di ingatkan setelah 5 menit`
        );
        setTimeout(() => {
          message.reply("waktunya bekerja");
        }, 5 * 60 * 1000 + 1000);
      }
    });
}

export default handle;
