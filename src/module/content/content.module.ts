import { Module } from '@nestjs/common'

import { HttpClient } from '@/contentModule/infra/http/http.client'

import { ContentManagementService } from './core/service/content.management.service'
import { MediaPlayerService } from './core/service/media-player.service'
import { ExternalMovieClient } from './http/rest/client/external-movie-rating/external-movie-rating.client'
import { MediaPlayerController } from './http/rest/controllers/media-player.controller'
import { VideoUploadController } from './http/rest/controllers/video-upload.controller'
import { ConfigModule } from '../../shared/module/config/config.module'
import { PersistenceModule } from './persistence/persistence.module'
import { ContentRepository } from './persistence/repository/content.repository'
import { VideoRepository } from './persistence/repository/video.repository'

@Module({
  imports: [PersistenceModule.forRoot(), ConfigModule.forRoot()],
  controllers: [VideoUploadController, MediaPlayerController],
  providers: [
    ContentManagementService,
    MediaPlayerService,
    VideoRepository,
    ContentRepository,
    HttpClient,
    ExternalMovieClient,
  ],
})
export class ContentModule {}
