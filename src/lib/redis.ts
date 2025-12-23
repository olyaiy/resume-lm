import { Redis as UpstashRedis } from "@upstash/redis";
import IORedis from "ioredis";

/**
 * Unified Redis client interface that works with both local Redis (ioredis)
 * and cloud Redis (Upstash). Set USE_LOCAL_REDIS=true to use local Redis.
 */
interface RedisClient {
  hgetall(key: string): Promise<Record<string, string> | null>;
  hset(key: string, data: Record<string, string>): Promise<number | "OK">;
  expire(key: string, seconds: number): Promise<number | boolean>;
}

const useLocalRedis = process.env.USE_LOCAL_REDIS === "true";

function createRedisClient(): RedisClient {
  if (useLocalRedis && process.env.REDIS_URL) {
    const client = new IORedis(process.env.REDIS_URL);
    return {
      hgetall: (key) => client.hgetall(key).then(r => Object.keys(r).length ? r : null),
      hset: (key, data) => client.hset(key, data),
      expire: (key, seconds) => client.expire(key, seconds).then(r => r === 1),
    };
  }

  const client = new UpstashRedis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  return client as unknown as RedisClient;
}

const redis = createRedisClient();
export default redis;
