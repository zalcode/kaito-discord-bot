import { Collection, EmbedField, Message, MessageEmbed } from "discord.js";
import { getFields } from "./message";

type CookTime = {
  time: number;
};

export function calcTime(
  acc: number,
  value: string,
  index: number,
  arr: string[]
) {
  return acc + Number(value) * Math.pow(60, arr.length - index - 1);
}

export function parseStringTime(stringTime: string) {
  return stringTime.split(":").reduceRight(calcTime, 0);
}

export function getContentTime(content: string) {
  const result = content.match(/(([0-9]+):([0-9]+):([0-9]+))/gm);

  return result.length > 0 ? parseStringTime(result[0]) : 0;
}

export function filterMessageFromKitchen() {
  return function(message: Message) {
    if (!message?.author?.bot) return false;
    const value = getFields(message)[0]?.value?.toLowerCase?.();

    return (
      value &&
      (value.indexOf("sisa waktu") > -1 ||
        value.indexOf("ready to cook") > -1 ||
        value.indexOf(":gosong:") > -1 ||
        value.indexOf("gosong dalam waktu") > -1)
    );
  };
}

export function filterMessageAfterCook(cookName) {
  return function(message: Message) {
    if (message.author.bot && message.embeds.length > 0) {
      let embed: MessageEmbed | undefined = message.embeds[0];
      if (embed && embed.fields.length > 0) {
        const field: EmbedField | undefined = embed.fields[0];
        if (field && field.value) {
          const value = field.value.toLowerCase();
          return (
            value.indexOf("waktu") >= 0 &&
            value.indexOf(cookName.toLowerCase()) >= 0
          );
        }
      }
    }
    return false;
  };
}

export function isSuccessCook(
  message: Message,
  cookName: string
): Promise<CookTime> {
  return message.channel
    .awaitMessages(filterMessageAfterCook(cookName), {
      max: 2,
      time: 2000
    })
    .then(async (collected: Collection<string, Message>) => {
      const col = collected.first();
      if (col) {
        const value = col?.embeds?.[0].fields?.[0]?.value;
        const time = getContentTime(value);

        return {
          time
        };
      }

      return undefined;
    });
}
