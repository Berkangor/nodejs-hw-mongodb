import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerPath = path.resolve(__dirname, '../../docs/swagger.json');

let swaggerDoc = null;

router.use(async (req, res, next) => {
  try {
    if (!swaggerDoc) {
      const raw = await fs.readFile(swaggerPath, 'utf-8');
      swaggerDoc = JSON.parse(raw);
    }
    next();
  } catch {
    // docs/swagger.json yoksa anlaşılır mesaj ver
    return res.status(500).json({
      status: 500,
      message: 'Swagger document not found. Did you run "npm run build-docs"?',
      data: {},
    });
  }
});

router.use('/', swaggerUi.serve, (req, res) => {
  return res.send(swaggerUi.generateHTML(swaggerDoc, { explorer: true }));
});

export default router;
