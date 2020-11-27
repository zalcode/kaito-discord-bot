import { Collection, EmbedField, Message, MessageEmbed } from "discord.js";

type CookTime = {
  time: number;
};

function calcTime(acc: number, value: string, index: number, arr: string[]) {
  return acc + Number(value) * Math.pow(60, arr.length - index - 1);
}

function parseStringTime(stringTime: string) {
  return stringTime.split(":").reduceRight(calcTime, 0);
}

function getCookTime(content: string) {
  const result = content.match(/(([0-9]+):([0-9]+):([0-9]+))/gm);

  return result.length > 0 ? parseStringTime(result[0]) : 0;
}

function filterMessageAfterCook(cookName) {
  return function(message: Message) {
    if (message.author.bot && message.embeds.length > 0) {
      let embed: MessageEmbed | undefined = message.embeds[0];
      if (embed && embed.fields.length > 0) {
        const field: EmbedField | undefined = embed.fields[0];
        if (field && field.value) {
          const value = field.value.toLowerCase();
          return value.indexOf("waktu") >= 0 && value.indexOf(cookName) >= 0;
        }
      }
    }
    return false;
  };
}

export function isSuccessCook(message: Message, cookName): Promise<CookTime> {
  return message.channel
    .awaitMessages(filterMessageAfterCook(cookName), {
      max: 2,
      time: 2000
    })
    .then(async (collected: Collection<string, Message>) => {
      const col = collected.first();
      if (col) {
        const value = col?.embeds?.[0].fields?.[0]?.value;
        const time = getCookTime(value);

        return {
          time
        };
      }

      return undefined;
    });
}
