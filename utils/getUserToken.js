import redisClient from './redis';

export default async function getCurrentUser(req) {
  const xToken = req.headers['x-token'];
  const key = `auth_${xToken}`;
  try {
    const userId = await redisClient.get(key);
    if (!userId) {
      return null;
    }
    return userId;
  } catch (err) {
    console.log(err);
    return null;
  }
}
