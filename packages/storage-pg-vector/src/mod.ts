import { Settings } from '@systemfsoftware/llama-index-settings'
import { type IVectorStore, MetadataMode, VectorStore } from '@systemfsoftware/llama-index-storage'
import { Array, Effect, Exit, Layer, pipe, Runtime } from 'effect'
import type { Scope } from 'effect/Scope'
import pg from 'pg'
import { _PGVectorStoreConfig, type IPGVectorStoreConfig, PGVectorStoreConfig } from './config.js'
import { DB, type NewEmbedding } from './database.js'
import { Pool } from './pool.js'

export type PoolConfig = pg.PoolConfig
export { type IPGVectorStoreConfig, PGVectorStoreConfig }

export const PGVectorStore: Layer.Layer<VectorStore, never, PGVectorStoreConfig | Settings | Scope> = Layer.effect(
  VectorStore,
  Effect.gen(function*() {
    const runtime = yield* Effect.runtime()
    const settings = yield* Settings
    const config = yield* PGVectorStoreConfig
    if (config.performSetup) {
      yield* Pool.setupPgVectorExtension
      yield* DB.setupTables
    }

    const pool = yield* Pool
    const db = yield* DB

    const add: IVectorStore['add'] = async (embeddingResults) =>
      pipe(
        Effect.gen(function*() {
          if (embeddingResults.length === 0) {
            return []
          }

          const values: NewEmbedding[] = Array.map(
            embeddingResults,
            (embedding) => ({
              node_id: embedding.id_,
              text: embedding.getContent(MetadataMode.NONE),
              metadata_: embedding.metadata,
            }),
          )

          const result = yield* Effect.tryPromise(() =>
            db.insertInto(`${config.schema}.${config.tableName}`)
              .values(values)
              .returning('id')
              .execute()
              .then((rows) => rows.map(({ id }) => `${id}`))
          )

          return result
        }),
        Runtime.runPromiseExit(runtime),
      ).then(
        Exit.match({
          onFailure: Promise.reject,
          onSuccess: (x) => Promise.resolve(x),
        }),
      )

    const _delete: IVectorStore['delete'] = async () => {
      throw new Error('not implemented')
    }

    const query: IVectorStore['query'] = async () => {
      throw new Error('not implemented')
    }

    return {
      storesText: true,
      embedModel: settings.embedModel,
      client: () => pool,
      add,
      delete: _delete,
      query,
    }
  }),
).pipe(
  Layer.provide(DB.Live),
  Layer.provide(Pool.Live),
  Layer.provide(_PGVectorStoreConfig.Live),
)
