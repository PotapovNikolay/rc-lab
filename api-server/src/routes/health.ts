import { Router } from 'express';
import fs from 'fs/promises';
import { config } from '../config';
import { comfyService } from '../services/comfyService';
import { HealthResponse } from '../types';

const router = Router();

router.get('/health', async (req, res, next) => {
  try {
    const health: HealthResponse = {
      api: 'ok',
      filesystem: 'ok',
      comfyui: 'error',
      comfyui_queue: 0,
    };

    // Check filesystem
    try {
      await fs.access(config.libraryPath);
    } catch (error) {
      health.filesystem = 'error';
    }

    // Check ComfyUI
    try {
      const comfyHealth = await comfyService.checkHealth();
      if (comfyHealth.available) {
        health.comfyui = 'ok';
        health.comfyui_memory = comfyHealth.memory;
        health.comfyui_queue = await comfyService.getQueue();
      }
    } catch (error) {
      health.comfyui = 'error';
    }

    res.json(health);
  } catch (error) {
    next(error);
  }
});

export default router;
