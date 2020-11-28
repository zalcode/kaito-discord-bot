import { TedisPool, Tedis } from "tedis";
import { ConnectionString } from "connection-string";

const connection = new ConnectionString(process.env.REDIS_URL);

const host = connection.hosts?.[0];

if (host === undefined) {
  throw Error("no redis connection");
}

const getTedis = async () =>
  new Tedis({
    host: host.name,
    port: host.port,
    password: connection.password
  });

async function setString(key, value: string) {
  try {
    const tedis = await getTedis();

    await tedis.set(key, value);
    tedis.close();
  } catch (error) {
    console.log(error);
  }
}

async function getString<T>(key) {
  try {
    const tedis = await getTedis();
    return await tedis.get(key).then(value => {
      tedis.close();
      return value;
    });
  } catch (error) {
    console.log(error);
    return undefined;
  }
}

async function setObject(key, obj: {}) {
  try {
    await setString(key, JSON.stringify(obj));
  } catch (error) {
    console.log(error);
  }
}

async function getObject<T>(key) {
  try {
    const result = await getString(key);
    const obj: T = JSON.parse(result.toString());

    return obj;
  } catch (error) {
    console.log(error);
    return undefined;
  }
}

export { getString, setString, setObject, getObject, getTedis };
