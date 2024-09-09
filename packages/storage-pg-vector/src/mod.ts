import { Schema as S } from '@effect/schema'
import { type IVectorStore, VectorStore } from '@systemfsoftware/llama-index_storage'
import { Array, Cause, Effect, Exit, Layer, pipe, Runtime } from 'effect'
import type { Scope } from 'effect/Scope'
import { Document, Settings } from 'llamaindex'
import pg from 'pg'
import pgvector from 'pgvector/kysely'
import { _PGVectorStoreConfig, type IPGVectorStoreConfig, PGVectorStoreConfig } from './config.js'
import { DB, type NewEmbedding } from './database.js'

export type PoolConfig = pg.PoolConfig
export { type IPGVectorStoreConfig, type IVectorStore, PGVectorStoreConfig, Settings, VectorStore }

export namespace PGVectorStore {
  export type Dependencies = PGVectorStoreConfig | Scope
}

export const PGVectorStore: Layer.Layer<VectorStore, never, PGVectorStoreConfig | Scope> = Layer.effect(
  VectorStore,
  Effect.gen(function*() {
    const runtime = yield* Effect.runtime()

    const settings = yield* Effect.sync(() => Settings)
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

          const values: NewEmbedding[] = yield* Effect.promise(() =>
            Promise.all(Array.map(
              embeddingResults,
              async (embedding) => ({
                node_id: embedding.id_,
                text: embedding.getContent(config.metadataMode),
                metadata_: embedding.metadata,
                embedding: await pipe(
                  pgvector.toSql(embedding.getEmbedding()),
                  S.decodeUnknownPromise(S.String),
                ),
              }),
            ))
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
          onFailure: (c) => Promise.reject(Cause.squash(c)),
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

          const result = yield* Effect.promise(async () => ({
            nodes: await Promise.all(Array.map(rows, async (row) =>
              new Document({
                id_: row.node_id,
                text: row.text,
                metadata: row.metadata_,
                embedding: await pipe(
                  pgvector.fromSql(row.embedding),
                  S.decodeUnknownPromise(S.mutable(S.Array(S.Number))),
                ),
              }))),
            similarities: Array.map(rows, (row) => 1 - row.s),
            ids: Array.map(rows, (row) => row.node_id),
          }))

          return result
        }),
        Runtime.runPromiseExit(runtime),
      ).then(
        Exit.match({
          onFailure: (c) => Promise.reject(Cause.squash(c)),
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
