# @systemfsoftware/llama-index_storage-pg-vector

## 0.5.0

### Minor Changes

- 788a7b9: feat: improve hybrid search with Reciprocal Rank Fusion (RRF)
  Implementation ripped from https://raw.githubusercontent.com/neondatabase/examples/refs/heads/main/ai/hybrid-search-nextjs/app/api/learn/route.ts.
- 3e744c6: chore: update dependencies

### Patch Changes

- Updated dependencies [3e744c6]
  - @systemfsoftware/llama-index_storage@0.2.0

## 0.4.1

### Patch Changes

- b6c2fea: fix: do not destroy db

## 0.4.0

### Minor Changes

- breaking: require a pg.pool in the config so that it can be optimized for serverless environments

## 0.3.0

### Minor Changes

- 8253508: feat: hybrid search

## 0.2.1

### Patch Changes

- 8909a16: fix: hnsw index

## 0.2.0

### Minor Changes

- 652464c: feat: hnsw indexing

### Patch Changes

- b3ab28c: chore: update llamaindex
- Updated dependencies [b3ab28c]
  - @systemfsoftware/llama-index_storage@0.1.2

## 0.1.1

### Patch Changes

- f357a4e: chore: update llamaindex
- Updated dependencies [f357a4e]
  - @systemfsoftware/llama-index_storage@0.1.1

## 1.0.0

### Minor Changes

- 81f135b: chore: update llamaindex

### Patch Changes

- Updated dependencies [81f135b]
  - @systemfsoftware/llama-index_storage@0.1.0

## 0.0.12

### Patch Changes

- 282d0c3: fix(storage-pg-vector): empty text template

  text template defaulting to empty string is a bug. It should match whats in the python version which is `{metadata_str}\n\n{content}`.

## 0.0.11

### Patch Changes

- 83aff7c: fix: Document -> TextNode

## 0.0.10

### Patch Changes

- 298d966: fix: query row embedding decoding

## 0.0.9

### Patch Changes

- 25ce63d: fix: remove peer dependencies meta since they are on my default
- Updated dependencies [25ce63d]
  - @systemfsoftware/llama-index_storage@0.0.4

## 0.0.8

### Patch Changes

- 55e5d06: fix: throw original error instead of fiber error
- 33784b0: refactor: nuke settings and core packages
- c80767a: fix: embeddings insertion
- 591cd86: fix: creating indices on columns that don't exist
- Updated dependencies [33784b0]
  - @systemfsoftware/llama-index_storage@0.0.3

## 0.0.7

### Patch Changes

- ff6f155: support upserts

## 0.0.6

### Patch Changes

- 4f2892c: chore: freeze PGVectorStore
- fc0b14e: client now returns a KyselyDatabase

## 0.0.5

### Patch Changes

- 7704a09: fix: busted type imports

## 0.0.4

### Patch Changes

- 541d243: fix: missing Settings type export

## 0.0.3

### Patch Changes

- 7d86de5: chore: make peer dependencies required
- Updated dependencies [28d39f0]
- Updated dependencies [a6cab65]
  - @systemfsoftware/llama-index_storage@0.0.2
  - @systemfsoftware/llama-index_settings@0.0.2

## 0.0.2

### Patch Changes

- c5b803c: feat: add config for metamata mode

## 0.0.1

### Patch Changes

- 9e1c9e1: initial release
- Updated dependencies [9e1c9e1]
  - @systemfsoftware/llama-index_settings@0.0.1
  - @systemfsoftware/llama-index_storage@0.0.1
