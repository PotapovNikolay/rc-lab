import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import sharp from 'sharp';
import { config } from '../config';
import { OutputListResponse, OutputMetadata } from '../types';

const router = Router();

// GET /api/output
router.get('/output', async (req, res, next) => {
  try {
    const outputPath = config.outputPath;
    const groups: OutputListResponse['groups'] = [];
    let totalCount = 0;

    // Scan output/{style}/{character}/ directories
    const styles = await fs.readdir(outputPath);

    for (const style of styles) {
      const stylePath = path.join(outputPath, style);
      const stat = await fs.stat(stylePath);
      if (!stat.isDirectory()) continue;

      const characters = await fs.readdir(stylePath);

      for (const character of characters) {
        const characterPath = path.join(stylePath, character);
        const charStat = await fs.stat(characterPath);
        if (!charStat.isDirectory()) continue;

        const files = await fs.readdir(characterPath);
        const pngFiles = files.filter(f => f.endsWith('.png'));
        const count = pngFiles.length;
        totalCount += count;

        if (count > 0) {
          // Get latest file timestamp
          const latest = await fs.stat(path.join(characterPath, pngFiles[0]));

          groups.push({
            style,
            character,
            count,
            latest: latest.mtime.toISOString(),
          });
        }
      }
    }

    res.json({
      total: totalCount,
      groups,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/output/:style/:character
router.get('/output/:style/:character', async (req, res, next) => {
  try {
    const { style, character } = req.params;
    const characterPath = path.join(config.outputPath, style, character);

    const files = await fs.readdir(characterPath);
    const pngFiles = files.filter(f => f.endsWith('.png'));

    const results = await Promise.all(
      pngFiles.map(async filename => {
        const metaFilename = filename.replace('.png', '.yaml');
        const metaPath = path.join(characterPath, metaFilename);

        let metadata: OutputMetadata | null = null;
        try {
          const metaContent = await fs.readFile(metaPath, 'utf-8');
          metadata = yaml.load(metaContent) as OutputMetadata;
        } catch (error) {
          // Metadata file not found
        }

        return {
          filename,
          metadata,
        };
      })
    );

    res.json(results);
  } catch (error) {
    next(error);
  }
});

// GET /api/output/image/:style/:character/:filename
router.get('/output/image/:style/:character/:filename', async (req, res, next) => {
  try {
    const { style, character, filename } = req.params;
    const thumb = req.query.thumb === '1';

    const imagePath = path.join(config.outputPath, style, character, filename);

    if (thumb) {
      // Generate thumbnail
      const buffer = await sharp(imagePath)
        .resize(300, 300, { fit: 'inside' })
        .png()
        .toBuffer();

      res.set('Content-Type', 'image/png');
      res.set('Cache-Control', 'public, max-age=86400');
      res.send(buffer);
    } else {
      // Send full image
      const buffer = await fs.readFile(imagePath);
      res.set('Content-Type', 'image/png');
      res.set('Cache-Control', 'public, max-age=86400');
      res.send(buffer);
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/output/meta/:style/:character/:filename
router.get('/output/meta/:style/:character/:filename', async (req, res, next) => {
  try {
    const { style, character, filename } = req.params;
    const metaFilename = filename.replace('.png', '.yaml');
    const metaPath = path.join(config.outputPath, style, character, metaFilename);

    const content = await fs.readFile(metaPath, 'utf-8');
    const metadata = yaml.load(content) as OutputMetadata;

    res.json(metadata);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/output/:style/:character/:filename
router.delete('/output/:style/:character/:filename', async (req, res, next) => {
  try {
    const { style, character, filename } = req.params;
    const imagePath = path.join(config.outputPath, style, character, filename);
    const metaFilename = filename.replace('.png', '.yaml');
    const metaPath = path.join(config.outputPath, style, character, metaFilename);

    // Delete both image and metadata
    await fs.unlink(imagePath);
    try {
      await fs.unlink(metaPath);
    } catch (error) {
      // Metadata file may not exist
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
