import AppController from '../controllers/AppController';

const routing = (app) => {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
};

export default routing;
