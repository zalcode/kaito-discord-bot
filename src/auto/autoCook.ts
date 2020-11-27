import { Message } from "discord.js";
import { getObject, setObject } from "../redis";
import { sendMessage } from "../services/api";

type Tracker = {
  currentIndex: number;
  counter: number;
};

type Material = {
  name: string;
  amount: number;
};

type CookCommand = {
  menu: string;
  materials: Material[];
  maxCook: number;
};

export default async function autoCook(message: Message) {
  let trackerExecution = {};
  const cookCommands = await getObject<CookCommand[]>("commands");
  const tracker = await getObject<Tracker>("tracker");

  sendMessage("stake 1", message.channel.id);

  const { currentIndex = 0, counter = 0 } = tracker || {};
  const { menu, materials, maxCook } = cookCommands?.[currentIndex];

  if (currentIndex === cookCommands.length - 1 && counter === maxCook) {
    sendMessage("swork", message.channel.id);
  }

  sendMessage(`scook ${menu}`, message.channel.id);

  for (let index = 0; index < materials.length; index++) {
    const material = materials[index];
    sendMessage(`sbuy ${material.name} ${material.amount}`, message.channel.id);
    sendMessage("y", message.channel.id);
  }

  if (counter >= maxCook) {
    trackerExecution = {
      currentIndex:
        currentIndex === cookCommands.length - 1 ? 0 : currentIndex + 1,
      counter: 0
    };
  } else {
    trackerExecution = { currentIndex, counter: counter + 1 };
  }

  setObject("tracker", trackerExecution);
}
