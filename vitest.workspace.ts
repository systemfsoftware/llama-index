import { config } from 'dotenv'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineWorkspace } from 'vitest/config'

config({ path: '.env.test' })

export default defineWorkspace([
  {
    plugins: [tsconfigPaths()],
    test: {
      env: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      },
    },
  },
])
