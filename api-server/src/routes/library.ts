import { Router } from 'express';
import { yamlService } from '../services/yamlService';
import { ComponentType } from '../types';

const router = Router();

const VALID_TYPES: ComponentType[] = [
  'styles',
  'characters',
  'cameras',
  'outfits',
  'poses',
  'expressions',
  'backgrounds',
];

// GET /api/library/base_model
router.get('/library/base_model', async (req, res, next) => {
  try {
    const data = await yamlService.readBaseModel();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// PUT /api/library/base_model
router.put('/library/base_model', async (req, res, next) => {
  try {
    await yamlService.writeBaseModel(req.body);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/library/:type
router.get('/library/:type', async (req, res, next) => {
  try {
    const type = req.params.type as ComponentType;

    if (!VALID_TYPES.includes(type)) {
      res.status(400).json({ error: 'Invalid component type' });
      return;
    }

    const data = await yamlService.readAllFromFolder(type);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/library/:type/:id
router.get('/library/:type/:id', async (req, res, next) => {
  try {
    const type = req.params.type as ComponentType;
    const id = req.params.id;

    if (!VALID_TYPES.includes(type)) {
      res.status(400).json({ error: 'Invalid component type' });
      return;
    }

    const data = await yamlService.getItem(type, id);
    if (!data) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// POST /api/library/:type
router.post('/library/:type', async (req, res, next) => {
  try {
    const type = req.params.type as ComponentType;
    const { id, ...data } = req.body;

    if (!VALID_TYPES.includes(type)) {
      res.status(400).json({ error: 'Invalid component type' });
      return;
    }

    if (!id) {
      res.status(400).json({ error: 'ID is required' });
      return;
    }

    await yamlService.createItem(type, id, data);
    res.json({ success: true, id });
  } catch (error) {
    next(error);
  }
});

// PUT /api/library/:type/:id
router.put('/library/:type/:id', async (req, res, next) => {
  try {
    const type = req.params.type as ComponentType;
    const id = req.params.id;

    if (!VALID_TYPES.includes(type)) {
      res.status(400).json({ error: 'Invalid component type' });
      return;
    }

    await yamlService.updateItem(type, id, req.body);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/library/:type/:id
router.delete('/library/:type/:id', async (req, res, next) => {
  try {
    const type = req.params.type as ComponentType;
    const id = req.params.id;

    if (!VALID_TYPES.includes(type)) {
      res.status(400).json({ error: 'Invalid component type' });
      return;
    }

    await yamlService.deleteItem(type, id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
