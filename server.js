import express from 'express';
// eslint-disable-next-line
import bodyParser from 'body-parser';
import routing from './routes/index';

const app = express();
const port = process.env.PORT || '5000';

app.use(bodyParser.json());
routing(app);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
