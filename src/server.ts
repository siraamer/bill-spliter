import express from 'express';
import MountRoutes from './routes';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import Logging from './library/logging';
import ErrorMiddleware from './controllers/errorController';

const router = express();

const DB = process.env.DB_URI;
mongoose
  .connect(DB as string)
  .then((conn) => {
    Logging.info(`Database Connected On: ${conn.connection.host}`);
    StartServer();
  })
  .catch((error) => {
    Logging.error(`Something Bad Happen: ${error}`);
  });

const StartServer = () => {
  router.use((req, res, next) => {
    /** Log the Request */
    Logging.info(
      `Incomming -> Method [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`
    );
    res.on('finish', () => {
      Logging.info(
        `Incomming -> Method [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`
      );
    });
    next();
  });
  router.use(express.urlencoded({ extended: true }));
  router.use(express.json());
  /** Some Rules */
  router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, x-Requested-With, Control-Type, Accept, Authorization'
    );
    if (req.method == 'OPTIONS') {
      res.header(
        'Access-Control-Allow-Methods',
        'PUT, POST, PATCH, DELETE, GET'
      );
      return res.status(200).json({});
    }
    next();
  });
  /** Routes */
  MountRoutes(router);
  /** Error Handling */
  router.all('*', (req, res, next) => {
    res.status(404).json({
      message: 'There is no route with this name.',
    });
  });
  router.use(ErrorMiddleware);
  const Port = 1200;
  router.listen(Port, () => {
    Logging.info(`Server is Running On Port ${Port}`);
  });
};
