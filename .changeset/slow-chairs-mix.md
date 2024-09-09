---
"@systemfsoftware/llama-index_storage-pg-vector": patch
---

fix(storage-pg-vector): empty text template

text template defaulting to empty string is a bug. It should match whats in the python version which is `{metadata_str}\n\n{content}`.
