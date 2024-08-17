import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path, { extname } from 'node:path'

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import type { Request, Response } from 'express'
import { diskStorage } from 'multer'

import { VideoNotFoundException } from '@/core/exception/video-not-found.exception'
import { ContentManagementService } from '@/core/service/content.management.service'
import { MediaPlayerService } from '@/core/service/media-player.service'

import { CreateVideoResponseDto } from '../dto/response/create-video-response.dto'
import { RestResponseInterceptor } from '../interceptors/rest-response.interceptor'

@Controller()
export class ContentController {
  constructor(
    private readonly contentManagementService: ContentManagementService,
    private readonly mediaPlayerService: MediaPlayerService,
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

    return await this.contentManagementService.createContent({
      title: currentData.title,
      description: currentData.description,
      thumbnailUrl: thumbnailFile.path,
      url: videoFile.path,
      durationInSeconds: 100,
      sizeInKb: videoFile.size,
    })
  }

  @Get('stream/:videoId')
  @Header('Content-Type', 'video/mp4')
  async streamVideo(
    @Param('videoId') videoId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const videoUrl = await this.mediaPlayerService.prepareStreaming(videoId)

      if (!videoUrl) {
        throw new NotFoundException('Video not found')
      }

      const videoPath = path.join(__dirname, '..', '..', '..', '..', videoUrl)
      const fileSize = fs.statSync(videoPath).size
      const range = req.headers.range

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
        const chunkSize = end - start + 1
        const file = fs.createReadStream(videoPath, { start, end })

        res.writeHead(HttpStatus.PARTIAL_CONTENT, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'video/mp4',
        })

        return file.pipe(res)
      }

      return res.writeHead(HttpStatus.OK, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      })
    } catch (error) {
      if (error instanceof VideoNotFoundException) {
        throw new NotFoundException(error.message)
      }

      throw error
    }
  }
}
