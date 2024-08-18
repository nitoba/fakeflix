import { Module } from '@nestjs/common'

import { ContentManagementService } from './core/service/content.management.service'
import { MediaPlayerService } from './core/service/media-player.service'
import { MediaPlayerController } from './http/rest/controllers/media-player.controller'
import { VideoUploadController } from './http/rest/controllers/video-upload.controller'
import { PersistenceModule } from './persistence/persistence.module'
import { ContentRepository } from './persistence/repository/content.repository'
import { VideoRepository } from './persistence/repository/video.repository'

@Module({
  imports: [PersistenceModule.forRoot()],
  controllers: [VideoUploadController, MediaPlayerController],
  providers: [
    ContentManagementService,
    MediaPlayerService,
    VideoRepository,
    ContentRepository,
  ],
})
export class AppModule {}
