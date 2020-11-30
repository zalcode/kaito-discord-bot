import {
  CookAction,
  Recipe,
  Tracker,
  KitchenStatus,
  Material
} from "./../types";
import { Collection, Message } from "discord.js";
import {
  filterMessageFromKitchen,
  getContentTime,
  isSuccessCook
} from "../helpers/cook";
import { setString, getString, getObject, setObject } from "../redis";
import { sendMessage } from "../services/api";
import { getFields } from "../helpers/message";

const initTracker: Tracker = {
  index: 0,
  counter: 0
};

export default async function autoCook(message: Message) {
  const isEnable = await getString("autocook");

  if (isEnable !== "true") return;

  const [
    cookActions = [],
    recipes = [],
    tracker = initTracker
  ] = await Promise.all([
    getObject<CookAction[]>("cookActions"),
    getObject<Recipe[]>("recipes"),
    getObject<Tracker>("cookTracker")
  ]);

  if (cookActions.length === 0) {
    message.reply("no cook actions");
    return;
  }

  if (recipes.length === 0) {
    message.reply("no recipes registered");
    return;
  }

  if (cookActions.length <= tracker.index) {
    tracker.index = 0;
  }

  // Take before cook
  const kitchenStatus = await checkKitchen(message);

  if (kitchenStatus.remainingTime > 0) {
    console.log("Kitchen is in used ", kitchenStatus);

    return setTimeout(() => {
      autoCook(message);
    }, kitchenStatus.remainingTime * 1000 + 1000);
  }

  if (kitchenStatus.canCook == false && kitchenStatus.canTake) {
    console.log("Send stake message");

    await sendMessage("stake 1", message.channel.id);
  }

  const menu = cookActions[tracker.index];
  const recipe = recipes.find(r => r.id === menu.id);

  if (recipe === undefined) {
    message.reply(`Recipe for menu ID ${menu.id} is not found in database`);
    return;
  }

  if (menu.count > 0) {
    await sendMessage(`scook ${recipe.name}`, message.channel.id);
    const cookTime = await isSuccessCook(message, recipe.name);

    console.log("Send scook message : ", recipe.name);

    if (cookTime === undefined) {
      console.log("Failed scook ", recipe.name);
      console.log("Kitchen Status ", kitchenStatus);
      return;
    }

    console.log("Cooking time: ", cookTime?.time);

    await buyMaterials(message, recipe.materials);

    kitchenStatus.remainingTime = cookTime.time;
    tracker.counter++;

    if (tracker.counter > menu.count) {
      tracker.index++;
      tracker.counter = 0;
    }
  } else {
    tracker.index++;
  }

  await setObject("cookTracker", tracker);

  setTimeout(() => {
    autoCook(message);
  }, kitchenStatus.remainingTime * 1000 + 1000);
}

function checkKitchen(message: Message): Promise<KitchenStatus> {
  // Check kitchen
  return new Promise(async (resolve, reject) => {
    await sendMessage("skit", message.channel.id);

    message.channel
      .awaitMessages(filterMessageFromKitchen(), {
        max: 2,
        time: 2500
      })
      .then(collections => {
        const reaction = collections.first();
        const result: KitchenStatus = {
          canTake: false,
          canCook: false,
          remainingTime: 0
        };

        if (reaction) {
          const value = getFields(reaction)[0]?.value?.toLowerCase?.() || "";

          if (value.indexOf("sisa waktu") > -1) {
            result.remainingTime = getContentTime(value);
          } else {
            result.canTake = true;
            result.canCook = value.indexOf("ready to cook") > -1;
          }
        }

        resolve(result);
      })
      .catch(reject);
  });
}

async function buyMaterials(message: Message, materials: Material[]) {
  for (let index = 0; index < materials.length; index++) {
    const material = materials[index];
    await sendMessage(
      `sbuy ${material.name} ${material.amount}`,
      message.channel.id
    );
    await sendMessage("y", message.channel.id);
  }
}
