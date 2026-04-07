# Architecture

## Flow

1. The UI reads runtime settings and library data from the API.
2. The API loads YAML definitions from the local workflow workspace.
3. Queue or preset data is transformed into generation tasks.
4. Prompt assembly builds the final workflow payload for ComfyUI.
5. Generated files are exposed back through the API for gallery browsing.

## Services

- `ui`: operator-facing dashboard
- `api-server`: file orchestration, auth, and API surface
- `workflow workspace`: queue source and file-based content structure
- `ComfyUI`: image generation runtime
- `n8n`: optional automation and workflow runner
