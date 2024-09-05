import sha1 from 'sha1';
import dbClient from '../utils/db';

export default class UsersController {
  static async postNew(req, res) {
    console.log(req.body);
    const email = req.body.email || null;
    const password = req.body.password || null;
    if (email === null) {
      res.status(400).send({ error: 'Missing email' });
    }
    if (password === null) {
      res.status(400).send({ error: 'Missing password' });
    }
    const user = await dbClient.db.collection('users').find({ email });
    if (user) {
      res.status(400).send({ error: 'Already exist' });
    }
    const sha1Password = sha1(password);
    const newUser = await dbClient.usersCollection.insertOne({
      email,
      password: sha1Password,
    });
    res.status(201).send({
      id: newUser.insertedId,
      email,
    });
  }
}
