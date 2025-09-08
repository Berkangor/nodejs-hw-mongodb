import { initMongoDB } from './db/initMongoConnection.js';
import { startServer } from './server.js';

await initMongoDB();
startServer(); //because of new version of NODE.JS

// const bootstrap = async () => {
//   await initMongoDB();
//   startServer();
// };

// bootstrap();
