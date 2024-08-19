import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'

import { PrismaClient } from '@prisma/client'

import { factory } from '@/contentModule/infra/module/config/util/config.factory'

const env = factory()

const prisma = new PrismaClient()

function generateUniqueDatabaseURL(schemaId: string) {
  const url = new URL(env.database.url)
  url.searchParams.set('schema', schemaId)
  return url.toString()
}

const schemaId = randomUUID()

beforeAll(async () => {
  const databaseURL = generateUniqueDatabaseURL(schemaId)
  process.env.DATABASE_URL = databaseURL
  await new Promise((resolve) => setTimeout(resolve, 500))
  execSync('pnpm prisma db push')
})

afterAll(async () => {
  // await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()
})
