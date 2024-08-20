import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy, OnApplicationShutdown
{
  private logger = new Logger(PrismaService.name)
  constructor() {
    super({
      log: ['warn', 'error'],
    })
  }

  onModuleInit() {
    this.logger.log({
      message: 'Connecting to Prisma on database module initialization',
    })
    return this.$connect()
  }

  onModuleDestroy() {
    this.logger.log({
      message: 'Disconnecting from Prisma on module destroy',
    })

    return this.$disconnect()
  }

  onApplicationShutdown(signal: string) {
    this.logger.log({
      message: 'Disconnecting from Prisma on application shutdown',
      signal,
    })
    this.$disconnect()
  }
}
