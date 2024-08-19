import { Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm'

import { DefaultEntity } from '@/contentModule/infra/module/typeorm/entity/default.entity'

import { Content } from './content.entity'
import { Episode } from './episode.entity'
import { Thumbnail } from './thumbnail.entity'

@Entity({ name: 'tv_shows' })
export class TvShow extends DefaultEntity<TvShow> {
  @OneToMany(() => Episode, (episode) => episode.tvShow)
  episodes: Episode[]

  @OneToOne(() => Content)
  @JoinColumn({ name: 'content_id' })
  content: Content

  @OneToOne(() => Thumbnail)
  @JoinColumn({ name: 'thumbnail_id' })
  thumbnail: Thumbnail

  constructor(data: Partial<TvShow>) {
    super(data)
    Object.assign(this, data)
  }
}
