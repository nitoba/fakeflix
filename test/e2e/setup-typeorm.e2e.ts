import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'

import { factory } from '@/infra/module/config/util/config.factory'

const env = factory()

function generateUniqueDatabaseURL(schemaId: string) {
  const url = new URL(env.database.url)
  url.searchParams.set('schema', schemaId)
  return url.toString()
}

const schemaId = randomUUID()

beforeAll(async () => {
  const databaseURL = generateUniqueDatabaseURL(schemaId)
  process.env.DATABASE_URL = databaseURL
  await new Promise((resolve) => setTimeout(resolve, 1000))
  execSync('pnpm db:migrate:up')
})

afterAll(async () => {
  //   const dataSource = await getDataSource()
  //   await dataSource.destroy()
})
