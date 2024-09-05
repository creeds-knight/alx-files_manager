import express from 'express';
import routing from './routes/index';

const app = express();
const port = process.env.PORT || '5000';

routing(app);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
