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

import { ContentManagementService } from '@/core/service/content.management.service'

import { CreateVideoResponseDto } from '../dto/response/create-video-response.dto'
import { RestResponseInterceptor } from '../interceptors/rest-response.interceptor'

@Controller()
export class ContentController {
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

    const createdContent = await this.contentManagementService.createContent({
      title: currentData.title,
      description: currentData.description,
      thumbnailUrl: thumbnailFile.path,
      url: videoFile.path,
      durationInSeconds: 100,
      sizeInKb: videoFile.size,
    })
    const video = createdContent?.media?.video
    if (!video) {
      throw new BadRequestException('Video must be present')
    }
    return {
      id: createdContent.id,
      title: createdContent.title,
      description: createdContent.description,
      url: video.url,
      createdAt: createdContent.createdAt,
      updatedAt: createdContent.updatedAt,
    }
  }
}
