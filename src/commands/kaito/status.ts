import { Recipe } from "./../../types";
import { Message } from "discord.js";
import { getString, getObject } from "../../redis";

export default async function handle(message: Message) {
  const [
    stop,
    commands,
    tracker,
    autoworkTime,
    recipes = []
  ] = await Promise.all([
    getString("autocook"),
    getString("cookActions"),
    getString("cookTracker"),
    getString("autoworkTime"),
    getObject<Recipe[]>("recipes")
  ]);

  const strRecipes = recipes
    .map(r => {
      return `- ID: ${r.id}\t Name: ${r.name}`;
    })
    .join("\n");

  message.channel.send(
    `
    **Kaito Status**
    Auto Cook\t\t  : ${stop}
    Cooking list\t\t: ${commands}
    Cook Tracker\t : ${tracker}
    Autowork Interval\t : ${autoworkTime}
    \n
    **Menu**
    ${strRecipes}`
  );
}
