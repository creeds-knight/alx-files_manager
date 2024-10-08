import mongodb from 'mongodb';

class DBClient {
/**
 * This class creates a mongo db instance
 */
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}/${database}`;

    this.client = new mongodb.MongoClient(url, { useUnifiedTopology: true });
    this.client.connect()
      .then()
      .catch((err) => console.error('Could not connect to MongoDB', err));
  }

  isAlive() {
    return this.client.topology.isConnected();
  }

  async nbUsers() {
    return this.client.db().collection('users').countDocuments();
  }

  async nbFiles() {
    return this.client.db().collection('files').countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
