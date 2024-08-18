import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { ContentEntity } from '@/core/entity/content.entity'
import { MovieEntity } from '@/core/entity/movie.entity'
import { ThumbnailEntity } from '@/core/entity/thumbnail.entity'
import { VideoEntity } from '@/core/entity/video.entity'

import { PrismaService } from '../prisma/prisma.service'

type ContentInclude = Prisma.ContentGetPayload<{
  include: { Movie: { include: { Video: true; Thumbnail: true } } }
}>

@Injectable()
export class ContentRepository {
  private readonly model: PrismaService['content']
  constructor(prismaService: PrismaService) {
    this.model = prismaService.content
  }

  async create(content: ContentEntity) {
    try {
      const movie = content.media
      if (!movie) {
        throw new Error('Movie is required')
      }

      const video = movie.video

      await this.model.create({
        data: {
          id: content.id,
          title: content.title,
          description: content.description,
          type: content.type,
          createdAt: content.createdAt,
          updatedAt: content.updatedAt,
          Movie: {
            create: {
              id: movie.id,
              Video: {
                create: video.serialize(),
              },
              createdAt: movie.createdAt,
              updatedAt: movie.updatedAt,
              Thumbnail: {
                create: movie.thumbnail?.serialize(),
              },
            },
          },
        },
      })
      return content
    } catch (error) {
      console.error(error)
      this.handleAndThrowError(error)
    }
  }

  async findById(id: string) {
    try {
      const content = await this.model.findUnique({
        where: {
          id,
        },
        include: {
          Movie: {
            include: {
              Video: true,
              Thumbnail: true,
            },
          },
        },
      })
      if (!content) {
        throw new Error('Content not found')
      }
      return this.mapToEntity(content)
    } catch (error) {
      console.error(error)
      this.handleAndThrowError(error)
    }
  }

  private mapToEntity<T extends ContentInclude>(
    content: T | null,
  ): ContentEntity {
    if (!content || !content.Movie) {
      throw new Error('Movie and Video are required')
    }

    const contentEntity = ContentEntity.createFrom({
      id: content.id,
      title: content.title,
      description: content.description,
      type: content.type,
      createdAt: new Date(content.createdAt),
      updatedAt: new Date(content.updatedAt),
    })

    if (this.isMovie(content) && content.Movie.Video) {
      contentEntity.addMedia(
        MovieEntity.createFrom({
          id: content.Movie.id,
          video: VideoEntity.createFrom({
            id: content.Movie.Video.id,
            durationInSeconds: content.Movie.Video.durationInSeconds,
            sizeInKb: content.Movie.Video.sizeInKb,
            url: content.Movie.Video.url,
            createdAt: new Date(content.Movie.Video.createdAt),
            updatedAt: new Date(content.Movie.Video.updatedAt),
          }),
          createdAt: new Date(content.Movie.createdAt),
          updatedAt: new Date(content.Movie.updatedAt),
        }),
      )

      if (content.Movie.Thumbnail) {
        contentEntity.media?.addThumbnail(
          ThumbnailEntity.createFrom({
            id: content.Movie.Thumbnail.id,
            url: content.Movie.Thumbnail.url,
            createdAt: new Date(content.Movie.Thumbnail.createdAt),
            updatedAt: new Date(content.Movie.Thumbnail.updatedAt),
          }),
        )
      }
    }
    return contentEntity
  }

  private isMovie(content: unknown): content is Prisma.ContentGetPayload<{
    include: { Movie: { include: { Video: true } } }
  }> {
    if (typeof content === 'object' && content !== null && 'Movie' in content) {
      return true
    }

    return false
  }

  async clear() {
    try {
      await this.model.deleteMany()
    } catch (error) {
      console.error(error)
      this.handleAndThrowError(error)
    }
  }

  private extractErrorMessage(error: unknown) {
    if (error instanceof Error && 'message' in error) {
      return error.message
    }
    return 'An unknown error occurred'
  }

  protected handleAndThrowError(error: unknown) {
    const errorMessage = this.extractErrorMessage(error)
    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new Error(error.message)
    }
    throw new Error(`Failed to save content: ${errorMessage}`)
  }
}
