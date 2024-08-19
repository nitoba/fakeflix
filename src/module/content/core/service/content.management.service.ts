import { Injectable } from '@nestjs/common'

import { ExternalMovieClient } from '@/contentModule/http/rest/client/external-movie-rating/external-movie-rating.client'
import { Content } from '@/contentModule/persistence/entity/content.entity'
import { Movie } from '@/contentModule/persistence/entity/movie.entity'
import { Thumbnail } from '@/contentModule/persistence/entity/thumbnail.entity'
import { Video } from '@/contentModule/persistence/entity/video.entity'
import { ContentRepository } from '@/contentModule/persistence/repository/content.repository'

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
  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly externalMovieRatingClient: ExternalMovieClient,
  ) {}

  async createMovie(createMovieData: CreateContentData) {
    const externalRating = await this.externalMovieRatingClient.getRating(
      createMovieData.title,
    )
    const contentEntity = new Content({
      title: createMovieData.title,
      description: createMovieData.description,
      type: ContentType.MOVIE,
      movie: new Movie({
        externalRating,
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