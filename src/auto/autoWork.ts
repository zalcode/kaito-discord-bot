import { Message } from "discord.js";
import { getContentTime } from "../helpers/cook";
import { getString } from "../redis";
import { sendMessage } from "../services/api";

export default async function autoWork(message: Message) {
  const isEnable = await getString("autowork");

  if (isEnable !== "true") return;

  await sendMessage("swork", message.channel.id);

  const collections = await message.channel.awaitMessages(filterPenjualan, {
    max: 2,
    time: 2000
  });

  const msg = collections.first();

  if (msg) {
    if (msg.content && msg.content.indexOf("Cooldown") > -1) {
      const time = getContentTime(msg.content);
      if (time > 0) {
        setTimeout(() => {
          autoWork(message);
        }, time * 1000 + 1000);
      }
    } else {
      setTimeout(() => {
        autoWork(message);
      }, 5 * 60 * 1000 + 1000);
    }
  }
}

function filterPenjualan(message: Message) {
  if (!message.author.bot) return false;

  return (
    message.content.indexOf("Cooldown") > -1 ||
    message.embeds?.[0].fields?.[0]?.value
      ?.toLowerCase?.()
      ?.indexOf("menu terjual") > -1
  );
}
