import {
  Controller,
  Get,
  Header,
  HttpStatus,
  NotFoundException,
  Param,
  Req,
  Res,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

import { VideoNotFoundException } from '@/core/exception/video-not-found.exception'
import { MediaPlayerService } from '@/core/service/media-player.service'

@Controller('stream')
export class MediaPlayerController {
  constructor(private readonly mediaPlayerService: MediaPlayerService) {}

  @Get(':videoId')
  @Header('Content-Type', 'video/mp4')
  async streamVideo(
    @Param('videoId') videoId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const url = await this.mediaPlayerService.prepareStreaming(videoId)

      const videoPath = path.join('.', url)
      const fileSize = fs.statSync(videoPath).size

      const range = req.headers.range

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

        const chunksize = end - start + 1
        const file = fs.createReadStream(videoPath, { start, end })

        res.writeHead(HttpStatus.PARTIAL_CONTENT, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        })

        file.pipe(res)
      } else {
        res.writeHead(HttpStatus.OK, {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        })
        fs.createReadStream(videoPath).pipe(res)
      }
    } catch (error) {
      if (error instanceof VideoNotFoundException) {
        throw new NotFoundException(error.message)
      }
      throw error
    }
  }
}
