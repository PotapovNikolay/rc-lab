# WebSocket Notes

The API can expose generation progress over WebSocket in addition to REST polling.

Recommended production posture:

- validate tokens before accepting a socket
- keep payloads limited to progress and status metadata
- avoid pushing raw prompts or sensitive machine paths to clients
