import { IntegreSQLClient } from '@devoxa/integresql-client'
import { it } from '@effect/vitest'
import { VectorStore } from '@systemfsoftware/llama-index_storage'
import { Effect, Layer, pipe } from 'effect'
import {
  ContextChatEngine,
  Document,
  FaithfulnessEvaluator,
  IngestionPipeline,
  OpenAI,
  OpenAIEmbedding,
  Settings,
  VectorStoreIndex,
} from 'llamaindex'
import { beforeAll, beforeEach, describe, expect } from 'vitest'
import { PGVectorStore, PGVectorStoreConfig } from '../src/mod.js'
import { documents } from './__fixtures__/documents.js'

describe('sanity test', () => {
  const integreSQL = new IntegreSQLClient({ url: 'http://localhost:5000' })
  let hash: string
  let connectionString: string

  beforeAll(async () => {
    hash = await integreSQL.hashFiles([
      './packages/*/test/__fixtures__/**/*',
    ])

    await integreSQL.initializeTemplate(hash, async () => {})
  })

  beforeEach(async () => {
    const databaseConfig = await integreSQL.getTestDatabase(hash)
    connectionString = integreSQL.databaseConfigToConnectionUrl(databaseConfig)
  })

  it.scoped('works', () =>
    pipe(
      Effect.gen(function*() {
        const vectorStore = yield* VectorStore
        const index = yield* Effect.tryPromise(() => VectorStoreIndex.fromVectorStore(vectorStore))

        const pipeline = yield* Effect.sync(() =>
          new IngestionPipeline({
            transformations: [
              new OpenAIEmbedding({ model: 'text-embedding-3-small' }),
            ],
            vectorStore,
          })
        )

        yield* Effect.tryPromise(() => pipeline.run({ documents }))
        const queryEngine = yield* Effect.sync(() => index.asQueryEngine())
        const evaluator = yield* Effect.sync(() => new FaithfulnessEvaluator())

        const query = 'What is SystemFSoftware?'
        const response = yield* Effect.tryPromise(() =>
          queryEngine.query({
            query,
          })
        )

        expect(response.sourceNodes?.length, 'Not enough source nodes').toBeGreaterThan(0)

        const result = yield* Effect.tryPromise(() =>
          evaluator.evaluateResponse({
            query,
            response,
          })
        )

        expect(result.passing, 'Faithfulness evaluation failed').toBe(true)
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
