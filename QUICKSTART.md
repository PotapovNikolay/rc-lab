# Quickstart

## 1. Install dependencies

```powershell
cd api-server
npm install

cd ..\ai-factory-ui
npm install
```

## 2. Configure the API server

Create `api-server/.env` manually.

Required values:

```env
PORT=3001
FACTORY_ROOT=../ai-factory-n8n
COMFY_API=http://127.0.0.1:8188
COMFY_OUTPUT=../ComfyUI/output
API_TOKEN=replace_with_a_random_token
ALLOWED_ORIGINS=http://localhost:3000
```

## 3. Configure the UI

Create `ai-factory-ui/.env.local` manually.

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_TOKEN=replace_with_the_same_token
API_BASE_URL=http://localhost:3001
```

## 4. Start services

```powershell
cd api-server
npm run dev
```

```powershell
cd ai-factory-ui
npm run dev
```

## 5. Open the app

- UI: `http://localhost:3000`
- API health: `http://localhost:3001/api/health`

## Notes

- `FACTORY_ROOT` points to the demo library in `ai-factory-n8n`.
- `API_TOKEN` is an access gate for personal deployments, not a secret safe to embed in a public client.
- Generated images are intentionally excluded from version control.
