import 'dotenv/config';
import { initMongoDB } from './db/initMongoConnection.js';
import { startServer } from './server.js';

try {
  await initMongoDB();
  startServer(); // HTTP server'ı başlatır
} catch (e) {
  console.error('Failed to start server:', e);
  process.exit(1);
}

// (opsiyonel) Process-level güvenlik
process.on('unhandledRejection', (err) => {
  console.error('unhandledRejection:', err);
});
process.on('uncaughtException', (err) => {
  console.error('uncaughtException:', err);
});
