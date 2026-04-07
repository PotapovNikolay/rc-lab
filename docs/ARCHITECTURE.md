# Architecture

## Flow

1. The UI reads runtime settings and library data from the API.
2. The API loads YAML definitions from `ai-factory-n8n/library`.
3. Queue or preset data is transformed into generation tasks.
4. Prompt assembly builds the final workflow payload for ComfyUI.
5. Generated files are exposed back through the API for gallery browsing.

## Services

- `ai-factory-ui`: operator-facing dashboard
- `api-server`: file orchestration, auth, and API surface
- `ai-factory-n8n`: content library and queue source
- `ComfyUI`: image generation runtime
- `n8n`: optional automation and workflow runner
