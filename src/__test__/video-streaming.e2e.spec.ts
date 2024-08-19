import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { randomUUID } from 'crypto'
import nock from 'nock'
import request from 'supertest'

import { AppModule } from '@/app.module'
import { ContentManagementService } from '@/core/service/content.management.service'
import { ContentRepository } from '@/persistence/repository/content.repository'
import { MovieRepository } from '@/persistence/repository/movie.repository'
import { VideoRepository } from '@/persistence/repository/video.repository'

describe('MediaPlayerController (e2e)', () => {
  let moduleRef: TestingModule
  let app: INestApplication
  let contentManagementService: ContentManagementService
  let videoRepository: VideoRepository
  let contentRepository: ContentRepository
  let movieRepository: MovieRepository

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    videoRepository = moduleRef.get<VideoRepository>(VideoRepository)
    contentManagementService = moduleRef.get<ContentManagementService>(
      ContentManagementService,
    )
    contentRepository = moduleRef.get<ContentRepository>(ContentRepository)
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
    nock.cleanAll()
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
