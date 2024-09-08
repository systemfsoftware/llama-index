import { Context, Effect, Layer, pipe } from 'effect'
import pg from 'pg'
import pgvector from 'pgvector/pg'
import { _PGVectorStoreConfig } from './config.js'

/**
 * @internal
 */
export class Pool extends Context.Tag('llama-index_storage-pg-vector/Pool')<
  Pool,
  pg.Pool
>() {
  static Live = Layer.effect(
    this,
    Effect.gen(function*() {
      const config = yield* _PGVectorStoreConfig

      const pool = yield* Effect.acquireRelease(
        Effect.sync(() => new pg.Pool(config.poolConfig)),
        (pool) =>
          pipe(
            Effect.tryPromise(() => pool.end()),
            Effect.retry({ times: 2 }),
            Effect.catchAll(() => Effect.void),
          ),
      )

      return pool
    }),
  )

  static setupPgVectorExtension = pipe(
    Pool,
    Effect.andThen((pool) =>
      Effect.acquireUseRelease(
        Effect.promise(() => pool.connect()),
        (client) =>
          Effect.gen(function*() {
            yield* Effect.promise(() => client.query('CREATE EXTENSION IF NOT EXISTS vector'))
            yield* Effect.promise(() => pgvector.registerType(client))
          }),
        (client) =>
          pipe(
            Effect.try(() => client.release()),
            Effect.retry({ times: 2 }),
            Effect.catchAll(() => Effect.void),
          ),
      )
    ),
  )
}
