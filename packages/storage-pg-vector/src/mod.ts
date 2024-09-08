import { Settings } from '@systemfsoftware/llama-index_settings'
import { type IVectorStore, VectorStore } from '@systemfsoftware/llama-index_storage'
import { Array, Effect, Exit, Layer, pipe, Runtime } from 'effect'
import type { Scope } from 'effect/Scope'
import pg from 'pg'
import { _PGVectorStoreConfig, type IPGVectorStoreConfig, PGVectorStoreConfig } from './config.js'
import { DB, type NewEmbedding } from './database.js'

export type PoolConfig = pg.PoolConfig
export { type IPGVectorStoreConfig, PGVectorStoreConfig, Settings }

export namespace PGVectorStore {
  export type Dependencies = PGVectorStoreConfig | Settings | Scope
}

export const PGVectorStore: Layer.Layer<VectorStore, never, PGVectorStore.Dependencies> = Layer.effect(
  VectorStore,
  Effect.gen(function*() {
    const runtime = yield* Effect.runtime()

    const settings = yield* Settings
    const config = yield* _PGVectorStoreConfig
    if (config.performSetup) {
      yield* DB.setupTables
    }

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
              text: embedding.getContent(config.metadataMode),
              metadata_: embedding.metadata,
              embedding: embedding.getEmbedding(),
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

    return Object.freeze({
      storesText: true,
      embedModel: settings.embedModel,
      client: () => db,
      add,
      delete: _delete,
      query,
    })
  }),
).pipe(
  Layer.provide(DB.Live),
  Layer.provide(_PGVectorStoreConfig.Live),
)
