import { randomUUID } from 'node:crypto'

import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/persistence/prisma/prisma.service'
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
  constructor(private readonly prismaService: PrismaService) {}

  async createContent(data: CreateContentData) {
    return await this.prismaService.video.create({
      data: {
        id: randomUUID(),
        title: data.title,
        description: data.description,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl,
        sizeInKb: data.sizeInKb,
        durationInSeconds: data.durationInSeconds,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
  }
}
