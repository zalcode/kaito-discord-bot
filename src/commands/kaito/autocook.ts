import { Recipe } from "./../../types";
import { Message } from "discord.js";
import { setString, setObject, getObject } from "../../redis";
import autoCook from "../../auto/autoCook";
import { CookAction, Tracker } from "../../types";

export default async function handle(
  message: Message,
  action,
  args: string[] = []
) {
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
    case "add":
      console.log("Add action: ", args);
      if (args.length >= 2) await addAction(message, args);
      break;
    case "change":
      console.log("Change action: ", args);
      if (args.length >= 2) await changeAction(message, args);
      break;
    case "reset":
      const tracker: Tracker = {
        index: 0,
        counter: 0
      };
      await setObject("tracker", tracker);
      message.channel.send("autocook reseted " + JSON.stringify(tracker));
      break;
    default:
      break;
  }
}

async function changeAction(message: Message, args) {
  const [id, count] = args;
  const commands = await getObject<CookAction[]>("cookActions");

  if (commands.find(v => v.id.toString() === id) === undefined) {
    message.channel.send(`ID ${id} is not available in list`);
    return;
  }

  const cookActions = commands
    .map(item => {
      if (item.id.toString() === id) {
        return { ...item, count };
      }

      return item;
    })
    .filter(({ count }) => count > 0);
  await setObject("cookActions", cookActions);
  message.channel.send("Current Cook Actions: " + JSON.stringify(cookActions));
}

async function addAction(message: Message, args) {
  const [id, count]: number[] = args.map(Number);
  const [cookActions = [], recipes] = await Promise.all([
    getObject<CookAction[]>("cookActions"),
    getObject<Recipe[]>("recipes")
  ]);

  if (recipes.find(v => v.id == id) === undefined) {
    message.channel.send(`ID ${id} is not available in recipes`);
    return;
  }

  const filteredAction = cookActions.filter(val => val.id != id);
  const newAction = [...filteredAction, { id, count }];

  await setObject("cookActions", newAction);
  message.channel.send("Current Cook Actions: " + JSON.stringify(newAction));
}
