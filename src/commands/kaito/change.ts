import { CookAction } from "../../types";
import { Message } from "discord.js";
import { getObject } from "../../redis";

// kaito change <id> <count>
export default async function handle(message: Message, args: string[] = []) {
  const [action, name, value] = args;

  const commands = await getObject<CookAction[]>("cookActions");

  switch (action) {
    case 'remove':

      break;

    default:
      break;
  }
}
