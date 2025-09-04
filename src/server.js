import express from 'express';
import cors from 'cors';
import contactsRouter from './routes/contacts.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import router from './routes/index.js';

export const setupServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  
  app.use('/contacts', contactsRouter);
    

  app.use(router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};