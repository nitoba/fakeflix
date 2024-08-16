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

  @Get('stream/:videoId')
  @Header('Content-Type', 'video/mp4')
  async streamVideo(
    @Param('videoId') videoId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    const video = await this.prismaService.video.findUnique({
      where: { id: videoId },
    })

    if (!video) {
      throw new NotFoundException('Video not found')
    }

    const videoPath = path.join(__dirname, '..', video.url)
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
  }
}
