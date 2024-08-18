import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { randomUUID } from 'crypto'
import request from 'supertest'

import { AppModule } from '@/app.module'
import { ContentManagementService } from '@/core/service/content.management.service'
import { VideoRepository } from '@/persistence/repository/video.repository'

describe('MediaPlayerController (e2e)', () => {
  let moduleRef: TestingModule
  let app: INestApplication
  let contentManagementService: ContentManagementService
  let videoRepository: VideoRepository

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    videoRepository = moduleRef.get<VideoRepository>(VideoRepository)
    contentManagementService = moduleRef.get<ContentManagementService>(
      ContentManagementService,
    )

    await app.init()
  })

  beforeEach(async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true }).setSystemTime(
      new Date('2023-01-01'),
    )
  })

  afterEach(async () => {
    await videoRepository.deleteAll()
  })

  afterAll(async () => {
    moduleRef.close()
  })

  test('should streams a video', async () => {
    const createContent = await contentManagementService.createMovie({
      title: 'Test Video',
      description: 'This is a test video',
      url: './test/fixtures/sample.mp4',
      thumbnailUrl: './test/fixtures/sample.jpg',
      sizeInKb: 1430145,
      durationInSeconds: 100,
    })

    const fileSize = 1430145
    const range = `bytes=0-${fileSize - 1}`

    const res = await request(app.getHttpServer())
      .get(`/stream/${createContent?.movie?.video.id}`)
      .set('Range', range)
      .expect(HttpStatus.PARTIAL_CONTENT)

    expect(res.headers['content-type']).toBe('video/mp4')
    expect(res.headers['content-length']).toBe(fileSize.toString())
    expect(res.headers['accept-ranges']).toBe('bytes')

    expect(res.headers['content-range']).toBe(
      `bytes 0-${fileSize - 1}/${fileSize}`,
    )
  })

  test('should 404 if video is not found', async () => {
    await request(app.getHttpServer())
      .get(`/stream/${randomUUID()}`)
      .expect(HttpStatus.NOT_FOUND)
  })
})
