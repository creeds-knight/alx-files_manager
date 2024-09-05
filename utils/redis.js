import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  /**
     * This class creates a new instance of the RedisClient
     */
  constructor () {
    // Initialising the redis client connection
    this.client = createClient();
    this.connectionStatus = true;
    this.client.on('error', (error) => {
      console.error('Redis client failed to connect: ', error.message);
      this.connectionStatus = false;
    });
    this.client.on('connect', () => {
      console.log('Redis client connected successfully');
      this.connectionStatus = true;
    });
  }

  isAlive () {
    /**
     * This returns the current status of the redis connection
     */
    return this.connectionStatus;
  }

  async get (key) {
    /**
     *  takes a string key as argument and returns the Redis value stored for this key
     */
    return promisify(this.client.GET).bind(this.client.key);
  }

  async set (key, value, duration) {
    /**
     * that takes a string key, a value and a duration in second as arguments to store it in Redis
     */
    await promisify(this.client.SETEX).bind(this.client)(key, value, duration);
  }

  async del (key) {
    /**
     * Remove the value of a given key
     */
    await promisify(this.client.DEL).bind(this.client)(key);
  }
}
const redisclient = new RedisClient();
export default redisclient;
