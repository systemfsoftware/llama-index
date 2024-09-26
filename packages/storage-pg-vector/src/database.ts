import { Context, Effect, Layer, pipe } from 'effect'
import { Kysely, PostgresDialect, sql } from 'kysely'
import type { Generated, Insertable, Selectable, Updateable } from 'kysely'
import pg from 'pg'
import { _PGVectorStoreConfig } from './config.js'

/**
 * @internal
 */
export interface Database {
  [key: string]: EmbeddingsTable
}

/**
 * @internal
 */
export interface EmbeddingsTable {
  id: Generated<number>
  node_id: string
  text: string
  metadata_: Record<string, string>
  embedding: string
}

/**
 * @internal
 */
export type Embedding = Selectable<EmbeddingsTable>
/**
 * @internal
 */
export type NewEmbedding = Insertable<EmbeddingsTable>
/**
 * @internal
 */
export type EmbeddingUpdate = Updateable<EmbeddingsTable>

/**
 * @internal
 */
export class DB extends Context.Tag('llama-index_storage-pg-vector/DB')<DB, Kysely<Database>>() {
  static Live = Layer.effect(
    this,
    Effect.gen(function*() {
      const config = yield* _PGVectorStoreConfig

      const db = yield* Effect.acquireRelease(
        pipe(
          Effect.sync(() => new PostgresDialect({ pool: new pg.Pool(config.poolConfig) })),
          Effect.andThen((dialect) => Effect.sync(() => new Kysely<Database>({ dialect }))),
        ),
        (db) =>
          pipe(
            Effect.tryPromise(() => db.destroy()),
            Effect.retry({ times: 2 }),
            Effect.catchAll(() => Effect.void),
          ),
      )

      return db
    }),
  )

  static setupTables = Effect.gen(function*() {
    const db = yield* DB
    const { schema, tableName, dimensions } = yield* _PGVectorStoreConfig

    yield* Effect.promise(() => sql`CREATE EXTENSION IF NOT EXISTS vector`.execute(db))
    yield* Effect.promise(() => db.schema.createSchema(schema).ifNotExists().execute())
    yield* Effect.promise(() =>
      db.schema
        .createTable(`${schema}.${tableName}`)
        .ifNotExists()
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('node_id', 'varchar', (col) => col.unique().notNull())
        .addColumn('text', 'varchar', (col) => col.notNull())
        .addColumn('metadata_', 'jsonb', (col) => col.notNull().defaultTo('{}'))
        .addColumn('embedding', sql`VECTOR(${sql.raw(dimensions)})`, (col) => col.notNull())
        .execute()
    )

    const rawTableName = sql.raw(tableName)
    const rawSchema = sql.raw(schema)

    yield* Effect.promise(() =>
      sql`
        CREATE INDEX IF NOT EXISTS idx_${rawTableName}_node_id 
          ON ${rawSchema}.${rawTableName} (node_id);
      `.execute(db)
    )

    yield* Effect.promise(() =>
      db.schema.createIndex(`${tableName}_embedding_idx`)
        .ifNotExists()
        .on(`${schema}.${tableName}`)
        .using('hnsw')
        .expression(sql`embedding vector_cosine_ops`)
        .execute()
    )

    yield* Effect.promise(() =>
      sql`
        CREATE INDEX IF NOT EXISTS idx_${rawTableName}_text_search 
          ON ${rawSchema}.${rawTableName} USING GIN (to_tsvector('english', text));
      `.execute(db)
    )
  })
}
