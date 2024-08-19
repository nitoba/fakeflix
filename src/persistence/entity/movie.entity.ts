import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'

import { DefaultEntity } from '@/infra/module/typeorm/entity/default.entity'

import { Content } from './content.entity'
import { Thumbnail } from './thumbnail.entity'
import { Video } from './video.entity'

@Entity({ name: 'movies' })
export class Movie extends DefaultEntity<Movie> {
  @OneToOne(() => Video, (video) => video.movie, {
    cascade: true,
  })
  video: Video

  @Column({ type: 'float', name: 'external_rating', nullable: true })
  externalRating: number | null

  @OneToOne(() => Content, (content) => content.movie)
  @JoinColumn({ name: 'content_id' })
  content: Content

  @OneToOne(() => Thumbnail, {
    cascade: true,
  })
  @JoinColumn({ name: 'thumbnail_id' })
  thumbnail: Thumbnail

  constructor(data: Partial<Movie>) {
    super(data)
    Object.assign(this, data)
  }
}
