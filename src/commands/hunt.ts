import { Message } from "discord.js";
import { getString, setString } from "../redis";
import { sendMessage } from "../services/api";

const username = process.env.USERNAME;

async function hunt(message: Message) {
  const isHunt = await getString("hunt");
  const isJail = await getString("jail");

  if (isHunt === "false") {
    return;
  }

  if (isJail === "true") {
    message.reply("you are in the jail");
    return;
  }

  await sendMessage("rpg cd", message.channel.id);
  const collections = await message.channel.awaitMessages(isCooldownPost, {
    max: 1,
    time: 4000
  });

  const result = collections.first();

  if (result) {
    if (isEpicGuard(result)) {
      await setString("hunt", "false");
      await setString("jail", "true");
      message.reply("there is epic guard");
      try {
        const isRelease = await hasRelease(message);
        if (isRelease) {
          await setString("hunt", "false");
          await hunt(message);
          return;
        }
      } catch (error) {}
    } else {
      const cd = getCommandsCooldown(result.embeds?.[0]?.fields);
      if (cd.hunt === undefined) {
        await sendMessage("rpg hunt", message.channel.id);
        await checkNextMessages(message);
        setTimeout(async () => {
          await hunt(message);
        }, 63 * 1000);
      } else {
        message.channel.send("hunt will start after " + cd.hunt / 1000 + "s");
        setTimeout(async () => {
          await hunt(message);
        }, cd.hunt || 0);
      }
    }
  }
}

async function checkNextMessages(message) {
  try {
    const results = await message.channel.awaitMessages(
      ({ author, content }) => {
        return (
          isEpicGuard(message) ||
          (author.username === "EPIC RPG" && isHunting(username, content))
        );
      },
      {
        max: 1,
        time: 3000
      }
    );
    const result = results.first();

    if (result) {
      if (isEpicGuard(result)) {
        await setString("hunt", "false");
        await setString("jail", "true");
        message.reply("there is epic guard");
        try {
          const isRelease = await hasRelease(message);
          if (isRelease) {
            await setString("hunt", "false");
            await setString("jail", "false");
            return;
          }
        } catch (error) {}
      }
      if (isHunting(username, result.content)) {
        const [remainingHP, maxHP] = getRemainingHPFromContent(result.content);
        if (
          remainingHP == 0 ||
          (remainingHP < maxHP && (maxHP / remainingHP) * 100 <= 50)
        ) {
          await sendMessage("rpg heal", message.channel.id);
        }
      }
      if (hasLootbox(username, result.content)) {
        await sendMessage("rpg open", message.channel.id);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

function isHunting(username = "", content = "") {
  const regexHandleByUser = new RegExp(
    `\\*\\*${username}\\*\\* found and killed`,
    "g"
  );

  return regexHandleByUser.test(content);
}

function hasLootbox(username = "", content = "") {
  const regexHandleByUser = new RegExp(
    `\\*\\*${username}\\*\\* got (.*) lootbox`,
    "g"
  );

  return regexHandleByUser.test(content);
}

function getRemainingHPFromContent(content = "") {
  const test = content.match(/remaining HP is (.*)/);

  if (test && test.length > 1 && typeof test[1] === "string") {
    const hp = test[1].split("/").map(Number);
    if (hp.length > 1) {
      return hp;
    }
  }
  const isLost = /(lost fighting)/g.test(content);
  if (isLost) return [0, 0];

  return [];
}

function isCooldownPost(message: Message) {
  if (isEpicGuard(message)) return true;

  if (
    !message.author.bot ||
    message.author.username !== "EPIC RPG" ||
    message.embeds.length === 0
  ) {
    return false;
  }

  return (
    message.embeds?.[0]?.author?.name?.indexOf?.(`${username}'s cooldowns`) > -1
  );
}

// CREDIT: https://stackoverflow.com/a/51671987/11376743
function parseTime(s) {
  var tokens = { d: 8.64e7, h: 3.6e6, m: 6e4, s: 1e3 };
  var buff: any = "";
  return s.split("").reduce(function(ms, c) {
    c in tokens ? (ms += buff * tokens[c]) && (buff = "") : (buff += c);
    return ms;
  }, 0);
}

function getCommandsCooldown(fields = []) {
  const regex = /(Daily|Weekly|Lootbox|Vote|Hunt|Adventure|Training|Duel|Quest \| Epic quest|Chop \| Fish \| Pickup \| Mine|Arena|Dungeon \| Miniboss)\`\*\*\s\(\**((\d+d \d+h \d+m \d+s)|(\d+h \d+m \d+s)|(\d+m \d+s))\**/gm;

  // TODO: THIS IS NOT SAFE CODE
  return fields.reduce(
    (result, field) =>
      Object.assign(
        result,
        [...field.value.matchAll(regex)].reduce((result, v) => {
          const r = v.filter(r => r !== undefined);
          const key = r[1].split(" | ")[0].toLowerCase();
          const value = parseTime(r[r.length - 1].replace(/\s/g, ""));
          return Object.assign(result, { [key]: value });
        }, {})
      ),
    {}
  );
}

function isEpicGuard({ mentions, author, content }: Message) {
  return (
    mentions.users.find(u => u.username === username) !== undefined &&
    author.bot &&
    author.username === "EPIC RPG" &&
    (/EPIC GUARD/g.test(content) || /, you are in the/g.test(content))
  );
}

async function hasRelease(message: Message) {
  let hasTypeJail = false;
  let hasTypeProtest = false;
  let hasGuardRelease = false;
  const regexHandleByUser = new RegExp(
    `Everything seems fine \\*\\*${username}\\*\\*, keep playing`,
    "g"
  );

  const collections = await message.channel.awaitMessages(
    ({ author, content }) => {
      if (author.username === "EPIC RPG") {
        if (regexHandleByUser.test(content)) {
          return true;
        }

        if (hasGuardRelease === false) {
          hasGuardRelease = /Fine, i will let you go/g.test(content);
        }
      } else if (author.username === username) {
        if (hasTypeJail === false) {
          hasTypeJail = /rpg jail/g.test(content.trim().toLowerCase());
        }
        if (hasTypeProtest === false) {
          hasTypeProtest = /protest/g.test(content.trim().toLowerCase());
        }
      }
      return hasGuardRelease && hasTypeJail && hasTypeProtest;
    },
    {
      max: 1
    }
  );

  return collections.first();
}

export { hunt };
