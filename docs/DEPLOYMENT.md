# Deployment Notes

## Local-first assumption

This repository is prepared for local development first. If you deploy it publicly:

- keep generated output out of git
- treat the client token as an access gate, not a secret
- move real authentication behind a proxy or access layer
- restrict CORS to trusted origins

## Minimum deployment split

- Host `api-server` on a private VM or container close to ComfyUI
- Host the UI separately as a static or server-rendered app
- Mount the workflow workspace and ComfyUI output on persistent storage
