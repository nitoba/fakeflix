import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'

import { DefaultEntity } from '@/infra/module/typeorm/entity/default.entity'

import { Episode } from './episode.entity'
import { Movie } from './movie.entity'

@Entity({ name: 'videos' })
export class Video extends DefaultEntity<Video> {
  @Column()
  url: string

  @Column()
  sizeInKb: number

  @Column()
  duration: number

  @OneToOne(() => Movie, (movie) => movie.video)
  @JoinColumn({ name: 'movie_id' })
  movie: Movie

  @OneToOne(() => Episode, (episode) => episode.video)
  @JoinColumn({ name: 'episode_id' })
  episode: Episode
}
