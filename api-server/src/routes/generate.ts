import { Router } from 'express';
import { generationService } from '../services/generationService';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { config } from '../config';
import { QueueFile } from '../types';

const router = Router();

// Import broadcast functions - will be set by index.ts
let startStatusBroadcast: (() => void) | null = null;

export function setStatusBroadcastFunctions(start: () => void) {
  startStatusBroadcast = start;
}

// POST /api/generate
router.post('/generate', async (req, res, next) => {
  try {
    // Read queue from file
    const queuePath = path.join(config.queuePath, 'job.yaml');
    const content = await fs.readFile(queuePath, 'utf-8');
    const queue = yaml.load(content) as QueueFile;

    const generationId = await generationService.startGeneration(queue);

    // Start WebSocket status broadcasting
    if (startStatusBroadcast) {
      startStatusBroadcast();
    }

    res.json({
      generation_id: generationId,
      status: 'started',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/generate/status
router.get('/generate/status', async (req, res, next) => {
  try {
    const status = generationService.getStatus();
    res.json(status);
  } catch (error) {
    next(error);
  }
});

// POST /api/generate/stop
router.post('/generate/stop', async (req, res, next) => {
  try {
    await generationService.stopGeneration();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
