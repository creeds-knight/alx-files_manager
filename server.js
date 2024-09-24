import express from 'express';
// eslint-disable-next-line
import bodyParser from 'body-parser';
import routing from './routes/index';

const app = express();
const port = process.env.PORT || '5000';

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true,
}));
routing(app);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
