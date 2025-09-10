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

async function ensureSwaggerDoc() {
  if (!swaggerDoc) {
    const raw = await fs.readFile(swaggerPath, 'utf-8');
    swaggerDoc = JSON.parse(raw);
  }
  return swaggerDoc;
}

// Ham JSON (isteğe bağlı ama faydalı): GET /api-docs.json
router.get('/api-docs.json', async (req, res) => {
  try {
    const doc = await ensureSwaggerDoc();
    res.json(doc);
  } catch {
    res.status(500).json({
      status: 500,
      message: 'Swagger document not found. Did you run "npm run build-docs" (or build on Render)?',
      data: {},
    });
  }
});

// UI: GET /api-docs
router.use(
  '/api-docs',
  swaggerUi.serve,
  async (req, res) => {
    try {
      const doc = await ensureSwaggerDoc();
      // generateHTML ile dinamik besliyoruz
      return res.send(swaggerUi.generateHTML(doc, { explorer: true }));
    } catch {
      return res.status(500).json({
        status: 500,
        message: 'Swagger document not found. Did you run "npm run build-docs" (or build on Render)?',
        data: {},
      });
    }
  },
);

export default router;
