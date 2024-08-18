import { NestFactory } from '@nestjs/core'
import { DataSourceOptions } from 'typeorm'
import { createPostgresDatabase } from 'typeorm-extension'

import { ConfigService } from '@/infra/module/config/service/config.service'
import { TypeOrmMigrationService } from '@/infra/module/typeorm/service/typeorm-migration.service'
import { PersistenceModule } from '@/persistence/persistence.module'

const createDatabaseModule = async () => {
  return await NestFactory.createApplicationContext(
    PersistenceModule.forRoot({
      // eslint-disable-next-line n/no-path-concat
      migrations: [__dirname + '/migrations/**/*.{ts,js}'],
    }),
  )
}

export const migrate = async () => {
  const migrationModule = await createDatabaseModule()
  await migrationModule.init()
  const configService = migrationModule.get<ConfigService>(ConfigService)
  const options = {
    type: 'postgres',
    ...configService.get('database'),
  } as DataSourceOptions
  await createPostgresDatabase({
    ifNotExist: true,
    options,
  })
  await migrationModule.get(TypeOrmMigrationService).migrate()
  return await migrationModule.get(TypeOrmMigrationService).getDataSource()
}

export const getDataSource = async () => {
  const migrationModule = await createDatabaseModule()
  return migrationModule.get(TypeOrmMigrationService).getDataSource()
}
