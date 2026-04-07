# API Server

Express + TypeScript backend for the portfolio version of AI Factory Lab.

## Responsibilities

- Serve health and status endpoints
- Read and update the file-based prompt library
- Manage queue files and generation state
- Proxy generation requests to ComfyUI
- Serve generated output metadata and thumbnails

## Environment

```env
PORT=3001
FACTORY_ROOT=../ai-factory-n8n
COMFY_API=http://127.0.0.1:8188
COMFY_OUTPUT=../ComfyUI/output
API_TOKEN=replace_with_a_random_token
ALLOWED_ORIGINS=http://localhost:3000
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
