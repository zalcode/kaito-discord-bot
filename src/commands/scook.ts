import { Collection, EmbedField, Message, MessageEmbed } from "discord.js";

function calcTime(acc: number, value: string, index: number, arr: string[]) {
  return acc + Number(value) * Math.pow(60, arr.length - index - 1);
}

function parseStringTime(stringTime: string) {
  return stringTime.split(":").reduceRight(calcTime, 0);
}

function filterMessageAfterCook(message: Message) {
  if (message.author.bot && message.embeds.length > 0) {
    let embed: MessageEmbed | undefined = message.embeds[0];
    if (embed && embed.fields.length > 0) {
      const field: EmbedField | undefined = embed.fields[0];
      return field && field.value.indexOf("Waktu") >= 0;
    }
  }
  return false;
}

function getTimeFromMEssage(content: string) {
  const result = content.match(/(([0-9]+):([0-9]+):([0-9]+))/gm);

  return result.length > 0 ? result[0] : "";
}

function handle(message: Message) {
  if (message.author.bot) return;
  message.channel
    .awaitMessages(filterMessageAfterCook, {
      max: 2,
      time: 2000
    })
    .then((collected: Collection<string, Message>) => {
      const col = collected.first();
      if (col) {
        const text = getTimeFromMEssage(col.embeds[0].fields[0].value);
        const time = parseStringTime(text);

        if (time > 0) {
          setTimeout(() => {
            message.reply("waktunya take masakan");
          }, time * 1000 + 1000);

          message.reply(
            `Sepertinya kamu sedang masak, nanti akan di ingatkan setelah ${time} detik`
          );
        }
      }
    });
}

export default handle;
