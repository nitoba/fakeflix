import { Injectable } from '@nestjs/common'

import { VideoRepository } from '@/persistence/repository/video.repository'

import { VideoNotFoundException } from '../exception/video-not-found.exception'

@Injectable()
export class MediaPlayerService {
  constructor(private readonly videoRepository: VideoRepository) {}

  async prepareStreaming(videoId: string): Promise<string> {
    const video = await this.videoRepository.findById(videoId)
    if (!video) {
      throw new VideoNotFoundException(videoId)
    }
    return video.url
  }
}
