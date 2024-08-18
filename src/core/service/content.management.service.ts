import { Injectable } from '@nestjs/common'

import { ContentRepository } from '@/persistence/repository/content.repository'

import { ContentEntity } from '../entity/content.entity'
import { MovieEntity } from '../entity/movie.entity'
import { ThumbnailEntity } from '../entity/thumbnail.entity'
import { VideoEntity } from '../entity/video.entity'
export interface CreateContentData {
  title: string
  description: string
  url: string
  thumbnailUrl: string
  sizeInKb: number
  durationInSeconds: number
}

@Injectable()
export class ContentManagementService {
  constructor(private readonly contentRepository: ContentRepository) {}

  async createContent(data: CreateContentData) {
    const content = ContentEntity.createNew({
      title: data.title,
      description: data.description,
      type: 'MOVIE',
      media: MovieEntity.createNew({
        video: VideoEntity.createNew({
          durationInSeconds: data.durationInSeconds,
          sizeInKb: data.sizeInKb,
          url: data.url,
        }),
        thumbnail: ThumbnailEntity.createNew({
          url: data.thumbnailUrl,
        }),
      }),
    })

    // return this.contentRepository.create(content)
  }
}
