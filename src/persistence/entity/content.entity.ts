import { Column, Entity, OneToOne } from 'typeorm'

import { ContentType } from '@/core/enum/content-type.enum'
import { DefaultEntity } from '@/infra/module/typeorm/entity/default.entity'

import { Movie } from './movie.entity'
import { TvShow } from './tv-show.entity'

@Entity({ name: 'contents' })
export class Content extends DefaultEntity<Content> {
  @Column({ nullable: false, type: 'enum', enum: ContentType })
  type: ContentType

  @Column({ type: 'varchar', nullable: false })
  title: string

  @Column({ type: 'varchar', nullable: false })
  description: string

  @OneToOne(() => Movie, (movie) => movie.content, {
    cascade: true,
  })
  movie: Movie

  @OneToOne(() => TvShow, (tvShow) => tvShow.content, {
    cascade: true,
  })
  tvShow?: TvShow

  constructor(data: Partial<Content>) {
    super(data)
    Object.assign(this, data)
  }
}
