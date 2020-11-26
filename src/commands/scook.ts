import { Collection, EmbedField, Message, MessageEmbed } from "discord.js";

function calcTime(acc: number, value: string, index: number, arr: string[]) {
  return acc + Number(value) * Math.pow(60, arr.length - index - 1);
}

function parseStringTime(stringTime: string) {
  return stringTime.split(":").reduceRight(calcTime, 0);
}

const filterMessageAfterCook = args => (message: Message) => {
  if (args.length > 0 && message.author.bot && message.embeds.length > 0) {
    let embed: MessageEmbed | undefined = message.embeds[0];
    if (embed && embed.fields.length > 0) {
      const field: EmbedField | undefined = embed.fields[0];
      if (field && field.value) {
        const value = field.value.toLowerCase();
        return value.indexOf("waktu") >= 0 && value.indexOf(args[0]) >= 0;
      }
    }
  }
  return false;
};

function getTimeFromMEssage(content: string) {
  const result = content.match(/(([0-9]+):([0-9]+):([0-9]+))/gm);

  return result.length > 0 ? result[0] : "";
}

function getMenuName(text: string) {
  const result = text.match(/\*([a-zA-Z\s]+)\s/);

  return result?.[1];
}

function handle(message: Message, args: string[]) {
  if (message.author.bot) return;
  message.channel
    .awaitMessages(filterMessageAfterCook(args), {
      max: 2,
      time: 2000
    })
    .then((collected: Collection<string, Message>) => {
      const col = collected.first();
      if (col) {
        const value = col?.embeds?.[0].fields?.[0]?.value;
        const text = getTimeFromMEssage(value);
        const cookName = getMenuName(value);
        const time = parseStringTime(text);

        if (time > 0) {
          setTimeout(() => {
            message.reply(
              `**${cookName}** sudah matang. Segera angkat sebelum gosong.`
            );
          }, time * 1000 + 1000);

          message.channel.send(
            `**${message?.author?.username}**, sepertinya kamu masak **${cookName}**, nanti akan diingatkan setelah ${time} detik`
          );
        }
      }
    });
}

export default handle;
