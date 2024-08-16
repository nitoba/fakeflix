import { config } from 'dotenv'
import { z } from 'zod'

config()

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test', override: true })
}

export const envSchema = z.object({})

export type Env = z.infer<typeof envSchema>
