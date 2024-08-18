import { randomUUID } from 'node:crypto'

import { Injectable } from '@nestjs/common'

import { CreateContentData } from '@/core/service/content.management.service'

import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class VideoDao {
  constructor(private readonly prismaService: PrismaService) {}

  async createVideo(videoData: CreateContentData) {
    return await this.prismaService.video.create({
      data: {
        id: randomUUID(),
        title: videoData.title,
        description: videoData.description,
        url: videoData.url,
        thumbnailUrl: videoData.thumbnailUrl,
        sizeInKb: videoData.sizeInKb,
        durationInSeconds: videoData.durationInSeconds,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
  }
}
