import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class AuthController {
  static async getConnect(req, res) {
    const token = req.headers.authorization || null;

    const base64string = token.split(' ')[1];
    const decoded = Buffer.from(base64string, 'base64').toString('utf8');
    const [email, password] = decoded.split(':', 2);

    const users = dbClient.client.db().collection('users');

    try {
      const query = {
        email,
        password: sha1(password),
      };
      const user = await users.findOne(query);
      // console.log(`email: ${email}, password: ${password}`);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const uuidString = uuidv4().toString();
      const key = `auth_${uuidString}`;
      await redisClient.set(key, user._id.toString(), 86400); // 24 hrs => 86400 secs

      res.status(200);
      return res.json({ token: uuidString });
    } catch (err) {
      return res.status(500).json({ err: err.message });
    }
  }

  static async getDisconnect(req, res) {
    const xToken = req.headers['x-token'];
    const key = `auth_${xToken}`;
    try {
      const userId = await redisClient.get(key);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await redisClient.del(key);
      res.status(204);
      return res.end();
    } catch (err) {
      return res.status(500).json({ err: err.message });
    }
  }
}
