import { Injectable } from '@nestjs/common'

import { Content } from '@/persistence/entity/content.entity'
import { Movie } from '@/persistence/entity/movie.entity'
import { Thumbnail } from '@/persistence/entity/thumbnail.entity'
import { Video } from '@/persistence/entity/video.entity'
import { ContentRepository } from '@/persistence/repository/content.repository'

import { ContentType } from '../enum/content-type.enum'

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

  async createMovie(createMovieData: CreateContentData) {
    const contentEntity = new Content({
      title: createMovieData.title,
      description: createMovieData.description,
      type: ContentType.MOVIE,
      movie: new Movie({
        video: new Video({
          url: createMovieData.url,
          duration: 10,
          sizeInKb: createMovieData.sizeInKb,
        }),
      }),
    })

    if (createMovieData.thumbnailUrl) {
      contentEntity.movie.thumbnail = new Thumbnail({
        url: createMovieData.thumbnailUrl,
      })
    }
    const content = await this.contentRepository.save(contentEntity)

    return content
  }
}
