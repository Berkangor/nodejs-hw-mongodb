import { setupServer } from './server.js';
import initMongoConnection from './db/initMongoConnection.js'; // ✅ default import

const bootstrap = async () => {
  try {
    await initMongoConnection();
    setupServer();
    console.log('🚀 Server started successfully');
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
};

bootstrap();
