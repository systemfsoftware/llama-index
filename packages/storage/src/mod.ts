import { Context } from 'effect'
import type { VectorStore as IVectorStore } from 'llamaindex'

export type { IVectorStore }
export type { BaseEmbedding } from '@systemfsoftware/llama-index_core/embeddings'
export { MetadataMode, NodeRelationship, ObjectType } from '@systemfsoftware/llama-index_core/schema'
export type {
  BaseNode,
  IEmbedModel,
  MessageContentDetail,
  Metadata,
  RelatedNodeInfo,
  RelatedNodeType,
  TransformComponent,
  VectorStoreNoEmbedModel,
  VectorStoreQuery,
  VectorStoreQueryResult,
} from 'llamaindex'

export class VectorStore extends Context.Tag('llama-index_storage/VectorStore')<
  VectorStore,
  IVectorStore
>() {}
