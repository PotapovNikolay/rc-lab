import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  factoryRoot: process.env.FACTORY_ROOT || path.join(__dirname, '..', '..', 'ai-factory-n8n'),
  comfyApi: process.env.COMFY_API || 'http://127.0.0.1:8188',
  comfyOutput: process.env.COMFY_OUTPUT || path.join(process.cwd(), '..', 'ComfyUI', 'output'),
  apiToken: process.env.API_TOKEN || '',
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],

  get libraryPath() {
    return path.join(this.factoryRoot, 'library');
  },
  get queuePath() {
    return path.join(this.factoryRoot, 'queue');
  },
  get outputPath() {
    return path.join(this.factoryRoot, 'output');
  },
  get presetsPath() {
    return path.join(this.factoryRoot, 'presets');
  },
};

if (!config.apiToken) {
  console.warn('WARNING: API_TOKEN is not set. Protected endpoints will reject requests.');
}

if (!config.factoryRoot) {
  console.error('FATAL: FACTORY_ROOT environment variable is required');
  process.exit(1);
}
