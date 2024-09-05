import mongodb from 'mongodb';

class DBClient {
/**
 * This class creates a mongo db instance
 */
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    this.client = new mongodb.MongoClient(url, { useUnifiedTopology: true });
    this.client.connect().then(() => {
      this.db = this.client.db(database);
    });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return this.client.db.collection('users').countDocuments();
  }

  async nbFiles() {
    return this.client.db.collection('files').countDocuments();
  }

  async usersCollection() {
    return this.client.db.collection('users');
  }
}

const dbClient = new DBClient();
export default dbClient;
