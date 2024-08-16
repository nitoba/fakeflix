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
import { diskStorage } from 'multer'

import { PrismaService } from './prisma.service'

@Controller()
export class AppController {
  constructor(private readonly prismaService: PrismaService) {}

  @Post('video')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
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
            const filename = `${Date.now()}-${randomUUID()}-${extname(file.originalname)}`
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
  ) {
    const videoFile = files.video?.[0]
    const thumbnailFile = files.thumbnail?.[0]

    if (!videoFile || !thumbnailFile) {
      throw new BadRequestException(
        'Both video and thumbnail files are required.',
      )
    }

    return await this.prismaService.video.create({
      data: {
        id: randomUUID(),
        title: currentData.title,
        description: currentData.description,
        url: videoFile.path,
        thumbnailUrl: thumbnailFile.path,
        sizeInKb: videoFile.size,
        durationInSeconds: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
  }
}
