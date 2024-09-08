import { Context, Effect, Layer } from 'effect'
import pg from 'pg'

export type PoolConfig = pg.PoolConfig

export type IPGVectorStoreConfig = {
  poolConfig?: PoolConfig
  /**
   * @default "public"
   */
  schema?: string
  /**
   * @default "data_llamaindex_embedding"
   */
  tableName?: string
  /**
   * @default "1536"
   */
  dimensions?: string
  /**
   * @default true
   */
  performSetup?: boolean
}

export class PGVectorStoreConfig extends Context.Tag('llama-index_storage-pg-vector/PGVectorStoreConfig')<
  PGVectorStoreConfig,
  IPGVectorStoreConfig
>() {}

/**
 * @internal
 */
export class _PGVectorStoreConfig extends Context.Tag('llama-index_storage-pg-vector/_PGVectorStoreConfig')<
  _PGVectorStoreConfig,
  IPGVectorStoreConfig & Required<Pick<IPGVectorStoreConfig, 'schema' | 'tableName' | 'dimensions'>>
>() {
  static Live = Layer.effect(
    this,
    Effect.gen(function*() {
      const config = yield* PGVectorStoreConfig

      return {
        poolConfig: config.poolConfig,
        schema: config.schema ?? 'public',
        tableName: config.tableName ?? 'data_llamaindex_embedding',
        dimensions: config.dimensions ?? '1536',
        performSetup: config.performSetup ?? true,
      }
    }),
  )
}
