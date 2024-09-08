import { config } from 'dotenv'
import { defineWorkspace } from 'vitest/config'

config({ path: '.env.test' })

export default defineWorkspace([
  {
    test: {
      env: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      },
    },
  },
])
