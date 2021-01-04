import { Message } from "discord.js";
import { getContentTime } from "../helpers/cook";
import { getString } from "../redis";
import { sendMessage } from "../services/api";

let timeoutValue = null;

const customClearTimeOut = () => {
  if (timeoutValue) {
    clearTimeout(timeoutValue);
    timeoutValue = null;
  }
};

const customTimeOut = (callback, mm) => {
  if (timeoutValue) {
    customClearTimeOut();
  }

  timeoutValue = setTimeout(() => {
    callback();
    customClearTimeOut();
  }, mm);
};

export default async function autoWork(message: Message) {
  const isEnable = await getString("autowork");

  if (isEnable !== "true") return;

  const autoworkTime = await getString("autoworkTime");

  await sendMessage("swork", message.channel.id);

  const collections = await message.channel.awaitMessages(filterPenjualan, {
    max: 2,
    time: 2000
  });

  const msg = collections.first();

  if (msg) {
    if (timeoutValue) {
      customClearTimeOut();
    }

    if (msg.content?.indexOf?.("Cooldown") > -1) {
      const time = getContentTime(msg.content);
      if (time > 0) {
        console.log("autowork will start after: ", time);
        customTimeOut(() => {
          autoWork(message);
        }, time * 1000 + 1000);
      }
    } else {
      const minute =
        typeof autoworkTime === "string"
          ? parseInt(autoworkTime, 10)
          : autoworkTime;
      const resolveMinute = minute < 5 ? 5 : minute;

      message.channel.send(
        "autowork will start after: " + resolveMinute + " minutes"
      );

      customTimeOut(() => {
        autoWork(message);
      }, resolveMinute * 60 * 1000 + 1000);
    }
  } else {
    console.log("auto work message not found");
    console.log(collections);
  }
}

function filterPenjualan(message: Message) {
  if (!message.author.bot) return false;

  return (
    message.content.indexOf("Display kamu kosong") > -1 ||
    message.content.indexOf("Cooldown") > -1 ||
    message.embeds?.[0]?.description?.toLowerCase?.()?.indexOf("menu terjual") >
      -1
  );
}
