import addMilliseconds from "date-fns/addMilliseconds";
import isBefore from "date-fns/isBefore";
import { Message } from "discord.js";
import {
  CookAction,
  Recipe,
  Tracker,
  KitchenStatus,
  Material
} from "./../types";
import {
  filterMessageFromKitchen,
  getContentTime,
  isSuccessCook
} from "../helpers/cook";
import { getString, getObject, setObject } from "../redis";
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

  // Take before cook
  const kitchenStatus = await checkKitchen(message);

  for (let index = 0; index < kitchenStatus.length; index++) {
    if (cookActions.length <= tracker.index) {
      tracker.index = 0;
    }

    const ks = kitchenStatus[index];
    const menu = cookActions[tracker.index];

    if (menu) {
      const recipe = recipes.find(r => r.id === menu.id);

      if (recipe === undefined) {
        message.reply(`Recipe for menu ID ${menu.id} is not found in database`);
      } else {
        await doCooking(message, ks, tracker, menu, recipe);
      }
    } else {
      console.log("Menu not found");
      console.log("Kitchen Status: ", ks);
      console.log("Cook actions: ", cookActions);
      console.log("Tracker: ", tracker);
    }
  }
}

const timeOutValue = {
  value: null,
  time: null
};

const nextTime = milisecond => {
  return addMilliseconds(new Date(), milisecond);
};

const timeOut = (callback, milisecond) => {
  const nextDate = nextTime(milisecond);
  if (timeOutValue.value === null || isBefore(nextDate, timeOutValue.time)) {
    if (timeOutValue.value !== null) {
      clearTimeout(timeOutValue.value);
    }

    timeOutValue.time = nextDate;
    timeOutValue.value = setTimeout(() => {
      timeOutValue.value = null;
      callback();
    }, milisecond);
  }
};

async function doCooking(
  message: Message,
  kitchenStatus: KitchenStatus,
  tracker,
  menu,
  recipe
) {
  if (kitchenStatus.remainingTime > 0) {
    console.log("Kitchen is in used ", kitchenStatus);

    return timeOut(() => {
      autoCook(message);
    }, kitchenStatus.remainingTime * 1000 + 1000);
  }

  if (kitchenStatus.canCook === false && kitchenStatus.canTake) {
    console.log("Send stake message");

    await sendMessage(`stake ${kitchenStatus.number}`, message.channel.id);
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

    setTimeout(async () => {
      await sendMessage(`stake ${kitchenStatus.number}`, message.channel.id);
    }, cookTime.time * 1000 + 1000);

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

  timeOut(() => {
    autoCook(message);
  }, kitchenStatus.remainingTime * 1000 + 1000);
}

function checkKitchen(message: Message): Promise<KitchenStatus[]> {
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
        const defaultStatus: KitchenStatus = {
          number: 1,
          canTake: false,
          canCook: false,
          remainingTime: 0
        };

        const result: KitchenStatus[] = [];

        if (reaction) {
          const fields = getFields(reaction);
          for (let index = 0; index < fields.length; index++) {
            const field = fields[index];
            const value = field.value.toLowerCase();
            if (value.indexOf("sisa waktu") > -1) {
              result[index] = {
                ...defaultStatus,
                number: index + 1,
                remainingTime: getContentTime(value)
              };
            } else {
              result[index] = {
                ...defaultStatus,
                number: index + 1,
                canTake: true,
                canCook: value.indexOf("ready to cook") > -1
              };
            }
          }
        }

        resolve(result.sort((a, b) => Number(a.canTake) - Number(b.canTake)));
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
