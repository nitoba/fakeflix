import { Module } from '@nestjs/common'

import { ContentManagementService } from './core/service/content.management.service'
import { MediaPlayerService } from './core/service/media-player.service'
import { ContentController } from './http/rest/controllers/content.controller'
import { PrismaService } from './persistence/prisma/prisma.service'

@Module({
  imports: [],
  controllers: [ContentController],
  providers: [PrismaService, ContentManagementService, MediaPlayerService],
})
export class AppModule {}
