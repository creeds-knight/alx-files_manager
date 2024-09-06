import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisclient from '../utils/redis';

export default class UsersController {
  static async getMe(req, res) {
    // console.log(req.headers);
    const xToken = req.headers['x-token'];
    const key = `auth_${xToken}`;
    // console.log(`auth_token: ${key}`);
    try {
      const userId = await redisclient.get(key);
      // console.log(userId);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const query = { _id: new ObjectId(userId) };
      const user = await dbClient.client.db().collection('users').findOne(query);
      const { _id, email } = user;
      const returnObj = {
        id: _id,
        email,
      };
      return res.status(200).json(returnObj);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async postNew(req, res) {
    // console.log(req.body);
    const email = req.body.email || null;
    const password = req.body.password || null;
    if (email === null) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (password === null) {
      return res.status(400).json({ error: 'Missing password' });
    }
    const users = dbClient.client.db().collection('users');
    try {
      const user = await users.findOne({ email });
      if (user) {
        return res.status(400).json({ error: 'Already exist' });
      }
      const sha1Password = sha1(password);
      const newUser = await users.insertOne({
        email,
        password: sha1Password,
      });
      return res.status(201).json({ id: newUser.insertedId, email });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
