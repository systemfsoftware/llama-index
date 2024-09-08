import { Document } from '@systemfsoftware/llama-index_core/schema'
import { Settings } from '@systemfsoftware/llama-index_settings'
import { type IVectorStore, VectorStore } from '@systemfsoftware/llama-index_storage'
import { Array, Effect, Exit, Layer, pipe, Runtime } from 'effect'
import type { Scope } from 'effect/Scope'
import pg from 'pg'
import pgvector from 'pgvector/kysely'
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
              .onConflict((oc) =>
                oc
                  .column('node_id')
                  .doUpdateSet({
                    text: (eb) => eb.ref('excluded.text'),
                    metadata_: (eb) => eb.ref('excluded.metadata_'),
                    embedding: (eb) => eb.ref('excluded.embedding'),
                  })
              )
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

    const query: IVectorStore['query'] = async (query) =>
      pipe(
        Effect.gen(function*() {
          const embedding = query.queryEmbedding ?? []
          const max = query.similarityTopK ?? 2

          const rows = yield* Effect.tryPromise(() =>
            db.selectFrom(`${config.schema}.${config.tableName}`)
              .selectAll()
              .select((eb) =>
                eb
                  .cast<number>(
                    pgvector
                      .cosineDistance('embedding', embedding),
                    'double precision',
                  )
                  .as('s')
              )
              .orderBy('s')
              .limit(max)
              .execute()
          )

          const result = yield* Effect.sync(() => ({
            nodes: Array.map(rows, (row) =>
              new Document({
                id_: row.node_id,
                text: row.text,
                metadata: row.metadata_,
                embedding: row.embedding,
              })),
            similarities: Array.map(rows, (row) => 1 - row.s),
            ids: Array.map(rows, (row) => row.node_id),
          }))

          return result
        }),
        Runtime.runPromiseExit(runtime),
      ).then(
        Exit.match({
          onFailure: Promise.reject,
          onSuccess: (x) => Promise.resolve(x),
        }),
      )

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
