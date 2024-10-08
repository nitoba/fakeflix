import fs from 'node:fs'

import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import nock from 'nock'
import request from 'supertest'

import { AppModule } from '@/app.module'
import { ContentRepository } from '@/contentModule/persistence/repository/content.repository'
import { MovieRepository } from '@/contentModule/persistence/repository/movie.repository'
import { VideoRepository } from '@/contentModule/persistence/repository/video.repository'

describe('VideoUploadController (e2e)', () => {
  let moduleRef: TestingModule
  let app: INestApplication
  let contentRepository: ContentRepository
  let videoRepository: VideoRepository
  let movieRepository: MovieRepository

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    contentRepository = moduleRef.get<ContentRepository>(ContentRepository)
    videoRepository = moduleRef.get<VideoRepository>(VideoRepository)
    movieRepository = moduleRef.get<MovieRepository>(MovieRepository)

    await app.init()

    // nock has support to native fetch only in 14.0.0-beta.6
    // https://github.com/nock/nock/issues/2397
    nock('https://api.themoviedb.org/3', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get(`/search/keyword`)
      .query({
        query: 'Test Video',
        page: '1',
      })
      .reply(200, {
        results: [
          {
            id: '1',
          },
        ],
      })

    nock('https://api.themoviedb.org/3', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get(`discover/movie`)
      .query({
        with_keywords: '1',
      })
      .reply(200, {
        results: [
          {
            vote_average: 8.5,
          },
        ],
      })
  })

  beforeEach(async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true }).setSystemTime(
      new Date('2023-01-01'),
    )
  })

  afterEach(async () => {
    await videoRepository.deleteAll()
    await movieRepository.deleteAll()
    await contentRepository.deleteAll()
  })

  afterAll(async () => {
    moduleRef.close()
    fs.rmSync('./uploads', { recursive: true, force: true })
    nock.cleanAll()
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
})
