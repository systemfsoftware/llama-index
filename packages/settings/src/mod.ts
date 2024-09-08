import { Context, Effect, Layer } from 'effect'
import type { Config } from 'llamaindex/Settings'

export interface ISettings
  extends Omit<Config, 'llm' | 'promptHelper' | 'embedModel' | 'nodeParser' | 'callbackManager'>
{
  llm: NonNullable<Config['llm']>
  promptHelper: NonNullable<Config['promptHelper']>
  embedModel: NonNullable<Config['embedModel']>
  nodeParser: NonNullable<Config['nodeParser']>
  callbackManager: NonNullable<Config['callbackManager']>
}

export class Settings extends Context.Tag('llama-index_settings/Settings')<
  Settings,
  ISettings
>() {
  static Live = Layer.effect(
    this,
    Effect.gen(function*() {
      const { Settings } = yield* Effect.promise(() => import('llamaindex/Settings'))

      return Settings
    }),
  )
}
