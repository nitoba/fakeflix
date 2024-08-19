import { randomUUID } from 'node:crypto'
import { extname } from 'node:path'

import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import type { Request } from 'express'
import { diskStorage } from 'multer'

import { ContentManagementService } from '@/contentModule/core/service/content.management.service'

import { CreateVideoResponseDto } from '../dto/response/create-video-response.dto'
import { RestResponseInterceptor } from '../interceptors/rest-response.interceptor'

@Controller()
export class VideoUploadController {
  constructor(
    private readonly contentManagementService: ContentManagementService,
  ) {}

  @Post('video')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    new RestResponseInterceptor(CreateVideoResponseDto),
    FileFieldsInterceptor(
      [
        {
          name: 'video',
          maxCount: 1,
        },
        {
          name: 'thumbnail',
          maxCount: 1,
        },
      ],
      {
        dest: './uploads',
        storage: diskStorage({
          destination: './uploads',
          filename: (_req, file, cb) => {
            const filename = `${Date.now()}-${randomUUID()}${extname(file.originalname)}`
            cb(null, filename)
          },
        }),
        fileFilter: (_req, file, cb) => {
          if (file.mimetype.match(/\/(mp4|jpeg)$/)) {
            cb(null, true)
          } else {
            cb(
              new BadRequestException(
                'Invalid file type. Only video/mp4 and image/jpeg are supported.',
              ),
              false,
            )
          }
        },
      },
    ),
  )
  async uploadVideo(
    @Req() _req: Request,
    @Body()
    currentData: {
      title: string
      description: string
    },
    @UploadedFiles()
    files: { video?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] },
  ): Promise<CreateVideoResponseDto> {
    const videoFile = files.video?.[0]
    const thumbnailFile = files.thumbnail?.[0]

    if (!videoFile || !thumbnailFile) {
      throw new BadRequestException(
        'Both video and thumbnail files are required.',
      )
    }

    const MAX_FILE_SIZE = 1024 * 1024 * 1024 // 1 gigabyte

    if (videoFile.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds the limit.')
    }
    const MAX_THUMBNAIL_SIZE = 1024 * 1024 * 10 // 10 megabytes

    if (thumbnailFile.size > MAX_THUMBNAIL_SIZE) {
      throw new BadRequestException('Thumbnail size exceeds the limit.')
    }

    const createdMovie = await this.contentManagementService.createMovie({
      title: currentData.title,
      description: currentData.description,
      thumbnailUrl: thumbnailFile.path,
      url: videoFile.path,
      durationInSeconds: 10,
      sizeInKb: videoFile.size,
    })
    return {
      id: createdMovie.id,
      title: createdMovie.title,
      description: createdMovie.description,
      url: createdMovie.movie.video.url,
      thumbnailUrl: createdMovie.movie.thumbnail?.url,
      sizeInKb: createdMovie.movie.video.sizeInKb,
      duration: createdMovie.movie.video.duration,
      createdAt: createdMovie.createdAt,
      updatedAt: createdMovie.updatedAt,
    }
  }
}
