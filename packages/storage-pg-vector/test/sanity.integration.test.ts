import { IntegreSQLClient } from '@devoxa/integresql-client'
import { it } from '@effect/vitest'
import { VectorStore } from '@systemfsoftware/llama-index_storage'
import { PGVectorStore, PGVectorStoreConfig } from '@systemfsoftware/llama-index_storage-pg-vector'
import { Effect, Layer, pipe } from 'effect'
import { OpenAI, OpenAIEmbedding, Settings } from 'llamaindex'
import { beforeAll, beforeEach, describe } from 'vitest'

describe('sanity test', () => {
  const integreSQL = new IntegreSQLClient({ url: 'http://localhost:5000' })
  let hash: string
  let connectionString: string

  beforeAll(async () => {
    hash = await integreSQL.hashFiles([])

    await integreSQL.initializeTemplate(hash, async () => {})
  })

  beforeEach(async () => {
    const databaseConfig = await integreSQL.getTestDatabase(hash)
    connectionString = integreSQL.databaseConfigToConnectionUrl(databaseConfig)
  })

  it.scoped('works', () =>
    pipe(
      Effect.gen(function*() {
        yield* VectorStore
      }),
      Effect.provide(PGVectorStore),
      Effect.provideServiceEffect(
        PGVectorStoreConfig,
        Effect.gen(function*() {
          return {
            poolConfig: {
              connectionString,
            },
          }
        }),
      ),
      Effect.provide(
        Layer.effectDiscard(
          Effect.gen(function*() {
            yield* Effect.sync(() => {
              Settings.llm = new OpenAI({ model: 'gpt-3.5-turbo' })

              Settings.embedModel = new OpenAIEmbedding({
                model: 'text-embedding-3-small',
              })
            })
          }),
        ),
      ),
    ))
})
