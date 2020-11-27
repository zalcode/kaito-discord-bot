import { Tedis } from "tedis";
import { ConnectionString } from "connection-string";

const connection = new ConnectionString(process.env.REDIS_URL);

const host = connection.hosts?.[0];

if (host === undefined) {
  throw Error("no redis connection");
}

const client = new Tedis({
  host: host.name,
  port: host.port,
  password: connection.password
});

async function setObject(key, obj: {}) {
  await client.set(key, JSON.stringify(obj));
}

async function getObject<T>(key) {
  try {
    const result = await client.get(key);
    const obj: T = JSON.parse(result.toString());

    return obj;
  } catch (error) {
    return undefined;
  }
}

export { setObject, getObject, client };
