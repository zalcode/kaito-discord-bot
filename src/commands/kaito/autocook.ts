import { Message } from "discord.js";
import { setString, setObject, getObject } from "../../redis";
import autoCook, { Tracker } from "../../auto/autoCook";

export default async function handle(message: Message, action) {
  switch (action) {
    case "start":
      await setString("autocook", "true");
      message.channel.send("autocook started");
      autoCook(message);
      break;
    case "stop":
      await setString("autocook", "false");
      message.channel.send("autocook stoped");
      break;
    case "reset":
      const tracker: Tracker = {
        currentIndex: 0,
        counter: 0
      };
      await setObject("tracker", tracker);
      const newTracker: Tracker = await getObject("tracker");
      message.channel.send("autocook reseted " + JSON.stringify(newTracker));
      break;
    default:
      break;
  }
}
