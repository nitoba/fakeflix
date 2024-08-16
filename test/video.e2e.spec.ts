import fs from 'node:fs'

import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma.service'

describe('VideoController (e2e)', () => {
  let moduleRef: TestingModule
  let app: INestApplication
  let prismaService: PrismaService

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prismaService = moduleRef.get<PrismaService>(PrismaService)

    await app.init()
  })

  beforeEach(async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true }).setSystemTime(
      new Date('2023-01-01'),
    )
  })

  afterEach(async () => {
    await prismaService.video.deleteMany()
  })

  afterAll(async () => {
    moduleRef.close()
    fs.rmSync('./uploads', { recursive: true, force: true })
  })

  test('should upload a video', async () => {
    const video = {
      title: 'Test Video',
      description: 'Test Description',
      videoUrl: 'uploads/test.mp4',
      sizeInKb: 1430145,
      duration: 100,
    }

    const res = await request(app.getHttpServer())
      .post('/video')
      .attach('video', './test/fixtures/sample.mp4')
      .attach('thumbnail', './test/fixtures/sample.jpg')
      .field('title', video.title)
      .field('description', video.description)

    expect(res.statusCode).toBe(HttpStatus.CREATED)

    expect(res.body).toMatchObject({
      title: video.title,
      description: video.description,
      url: expect.stringContaining('mp4'),
      thumbnailUrl: expect.stringContaining('jpg'),
      durationInSeconds: video.duration,
      sizeInKb: video.sizeInKb,
    })
  })

  test('throws an error when the thumbnail is not provided', async () => {
    const video = {
      title: 'Test Video',
      description: 'This is a test video',
      videoUrl: 'uploads/test.mp4',
      thumbnailUrl: 'uploads/test.jpg',
      sizeInKb: 1430145,
      duration: 100,
    }

    await request(app.getHttpServer())
      .post('/video')
      .attach('video', './test/fixtures/sample.mp4')
      .field('title', video.title)
      .field('description', video.description)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((response) => {
        expect(response.body).toMatchObject({
          message: 'Both video and thumbnail files are required.',
          error: 'Bad Request',
          statusCode: 400,
        })
      })
  })
  test('does not allow non mp4 files', async () => {
    const video = {
      title: 'Test Video',
      description: 'This is a test video',
      videoUrl: 'uploads/test.mp4',
      thumbnailUrl: 'uploads/test.jpg',
      sizeInKb: 100,
      duration: 100,
    }

    await request(app.getHttpServer())
      .post('/video')
      .attach('video', './test/fixtures/sample.mp3')
      .attach('thumbnail', './test/fixtures/sample.jpg')
      .field('title', video.title)
      .field('description', video.description)
      .expect(HttpStatus.BAD_REQUEST)
      .expect({
        message:
          'Invalid file type. Only video/mp4 and image/jpeg are supported.',
        error: 'Bad Request',
        statusCode: 400,
      })
  })

  describe('VideoController (e2e) Streaming', () => {
    test('should streams a video', async () => {
      const { body: sampleVideo } = await request(app.getHttpServer())
        .post('/video')
        .attach('video', './test/fixtures/sample.mp4')
        .attach('thumbnail', './test/fixtures/sample.jpg')
        .field('title', 'Test Video')
        .field('description', 'This is a test video')
        .expect(HttpStatus.CREATED)

      const fileSize = 1430145
      const range = `bytes=0-${fileSize - 1}`

      const res = await request(app.getHttpServer())
        .get(`/stream/${sampleVideo.id}`)
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
        .get(`/stream/invalid-video-id`)
        .expect(HttpStatus.NOT_FOUND)
    })
  })
})
