# Structure Spec

## Base model

`library/base_model.yaml` stores the default checkpoint, sampler settings, and global positive and negative prompt fragments.

## Component files

Each component file contains one or more YAML objects keyed by an ID.

Supported component groups:

- `styles`
- `characters`
- `outfits`
- `poses`
- `expressions`
- `backgrounds`
- `cameras`

## Presets

Preset files define a fixed base plus variant arrays that expand into queue jobs.

## Queue

`queue/job.yaml` supports:

- direct job lists
- preset mode
- per-combination draft count
