import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { config } from '../config';
import { QueueFile, QueueEstimate } from '../types';

const router = Router();

// GET /api/queue
router.get('/queue', async (req, res, next) => {
  try {
    const queuePath = path.join(config.queuePath, 'job.yaml');
    const content = await fs.readFile(queuePath, 'utf-8');
    const data = yaml.load(content) as QueueFile;
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// POST /api/queue
router.post('/queue', async (req, res, next) => {
  try {
    const queueData: QueueFile = req.body;
    const queuePath = path.join(config.queuePath, 'job.yaml');

    const yamlContent = yaml.dump(queueData, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });

    await fs.writeFile(queuePath, yamlContent, 'utf-8');
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/queue/estimate
router.get('/queue/estimate', async (req, res, next) => {
  try {
    const queuePath = path.join(config.queuePath, 'job.yaml');
    const content = await fs.readFile(queuePath, 'utf-8');
    const data = yaml.load(content) as QueueFile;

    let totalCombinations = 0;

    for (const job of data.jobs) {
      const outfitCount = Array.isArray(job.outfit) ? job.outfit.length : 1;
      const cameraCount = Array.isArray(job.camera) ? job.camera.length : 1;
      const poseCount = Array.isArray(job.pose) ? job.pose.length : 1;
      const expressionCount = Array.isArray(job.expression) ? job.expression.length : 1;
      const backgroundCount = Array.isArray(job.background) ? job.background.length : 1;

      const combinations = outfitCount * cameraCount * poseCount * expressionCount * backgroundCount;
      totalCombinations += combinations;
    }

    const totalImages = totalCombinations * data.settings.drafts_per_combination;
    const estimatedMinutes = Math.ceil(totalImages * 0.5); // Estimate 30 seconds per image

    const estimate: QueueEstimate = {
      total_jobs: data.jobs.length,
      total_combinations: totalCombinations,
      total_images: totalImages,
      estimated_minutes: estimatedMinutes,
    };

    res.json(estimate);
  } catch (error) {
    next(error);
  }
});

export default router;
