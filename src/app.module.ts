import { Module } from '@nestjs/common'

import { ContentManagementService } from './core/service/content.management.service'
import { MediaPlayerService } from './core/service/media-player.service'
import { ExternalMovieClient } from './http/rest/client/external-movie-rating/external-movie-rating.client'
import { MediaPlayerController } from './http/rest/controllers/media-player.controller'
import { VideoUploadController } from './http/rest/controllers/video-upload.controller'
import { HttpClient } from './infra/http/http.client'
import { ConfigModule } from './infra/module/config/config.module'
import { PersistenceModule } from './persistence/persistence.module'
import { ContentRepository } from './persistence/repository/content.repository'
import { VideoRepository } from './persistence/repository/video.repository'

@Module({
  imports: [ConfigModule.forRoot(), PersistenceModule.forRoot()],
  controllers: [VideoUploadController, MediaPlayerController],
  providers: [
    ContentManagementService,
    MediaPlayerService,
    VideoRepository,
    ContentRepository,
    ExternalMovieClient,
    HttpClient,
  ],
})
export class AppModule {}
