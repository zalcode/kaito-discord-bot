import { TedisPool } from "tedis";
import { ConnectionString } from "connection-string";

const connection = new ConnectionString(process.env.REDIS_URL);

const host = connection.hosts?.[0];

if (host === undefined) {
  throw Error("no redis connection");
}

const tedispool = new TedisPool({
  host: host.name,
  port: host.port,
  password: connection.password
});

const getTedis = async () => await tedispool.getTedis();

async function setObject(key, obj: {}) {
  try {
    const tedis = await getTedis();

    await tedis.set(key, JSON.stringify(obj));
  } catch (error) {
    console.log(error);
  }
}

async function getObject<T>(key) {
  try {
    const tedis = await getTedis();
    const result = await tedis.get(key);
    const obj: T = JSON.parse(result.toString());

    return obj;
  } catch (error) {
    console.log(error);
    return undefined;
  }
}

async function setString(key, value: string) {
  try {
    const tedis = await getTedis();

    await tedis.set(key, value);
  } catch (error) {
    console.log(error);
  }
}

async function getString<T>(key) {
  try {
    const tedis = await getTedis();
    return await tedis.get(key);
  } catch (error) {
    console.log(error);
    return undefined;
  }
}

export { getString, setString, setObject, getObject, getTedis };
