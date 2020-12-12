import Discord from "discord.js";
import { hunt } from "./commands/hunt";
import autocook from "./commands/kaito/autocook";
import autowork from "./commands/kaito/autowork";
import status from "./commands/kaito/status";
import { getString, setString } from "./redis";
import { sendMessage } from "./services/api";

const channelId = process.env.CHANNEL_ID;
const username = process.env.USERNAME;
const botToken = process.env.BOT_TOKEN;
let isStartBomPokemon = true;
let intervalPokemon = 5000;
let intervalValue = null;

export const client = new Discord.Client();

export function startBot() {
  if (!botToken) {
    throw Error("TOKEN EMPTY");
  }

  client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const hunt = await getString("hunt");
    const jail = await getString("jail");

    if (hunt === "true" && jail !== "true") {
      await sendMessage("kaito hunt", channelId);
    }
  });

  client.on("message", async function(message) {
    if (message.author.username === username) {
      const [
        command,
        action,
        scondAction,
        ...args
      ] = message.content.toLocaleLowerCase().split(" ");

      try {
        const username = await getString("username");
        if (message.author.username !== username) return;
      } catch (error) {
        console.log(error);
        return;
      }

      switch (command) {
        case "kaito":
          switch (action) {
            case "pstart":
              isStartBomPokemon = true;
              message.reply("Starting pokemon spam");
              break;
            case "pstop":
              isStartBomPokemon = false;
              message.reply("Stoping pokemon spam");
              break;
            case "pi":
              intervalPokemon = parseInt(scondAction, 10);
              if (intervalPokemon < 1000)
                return message.reply("dont set less than 1 second");

              if (intervalValue) {
                clearInterval(intervalValue);
              }
              intervalValue = setInterval(bomPokemona, intervalPokemon);
              break;
            case "autocook":
            case "ac":
              await autocook(message, scondAction, args);
              break;
            case "autowork":
            case "aw":
              await autowork(message, scondAction, args);
              break;
            case "status":
            case "st":
              await status(message);
              break;
            case "hunt":
              switch (scondAction) {
                case "stop":
                  await setString("hunt", "false");
                  message.channel.send("stoping hunt");
                  break;
                case "start":
                default:
                  await setString("hunt", "true");
                  message.channel.send("starting hunt");
                  await hunt(message);
                  break;
              }
              break;
          }
          break;
        default:
          break;
      }
    }
  });

  client.login(botToken);
}

intervalValue = setInterval(bomPokemona, intervalPokemon);

const randomText = ["Cinccino", "Boldore", "Clawitzer", "Dragonite", "Claydol"];

const randomInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

async function bomPokemona() {
  try {
    if (isStartBomPokemon === false) return;

    const _response = await sendMessage(
      randomText[randomInteger(1, 5) - 1] || "i want xp",
      "716390832034414688"
    );
  } catch (error) {
    console.log(error.response?.data);
  }
}
