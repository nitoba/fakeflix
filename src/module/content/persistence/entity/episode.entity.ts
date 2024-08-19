import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm'

import { DefaultEntity } from '@/contentModule/infra/module/typeorm/entity/default.entity'

import { Thumbnail } from './thumbnail.entity'
import { TvShow } from './tv-show.entity'
import { Video } from './video.entity'

@Entity('episodes')
export class Episode extends DefaultEntity<Episode> {
  @Column()
  title: string

  @Column()
  description: string

  @Column()
  season: number

  @Column()
  number: number

  @ManyToOne(() => TvShow, (tvShow) => tvShow.episodes)
  @JoinColumn({ name: 'tv_show_id' })
  tvShow: TvShow

  @OneToOne(() => Thumbnail)
  @JoinColumn({ name: 'thumbnail_id' })
  thumbnail: Thumbnail

  @OneToOne(() => Video, (video) => video.episode)
  video: Video

  constructor(data: Partial<Episode>) {
    super(data)
    Object.assign(this, data)
  }
}
