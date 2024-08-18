import { randomUUID } from 'node:crypto'

import { BaseEntity, BaseEntityProps } from './base.entity'
import { ThumbnailEntity } from './thumbnail.entity'
import { VideoEntity } from './video.entity'

export interface MovieEntityProps extends BaseEntityProps {
  video: VideoEntity
  thumbnail?: ThumbnailEntity
}

export type NewMovieEntity = Omit<MovieEntityProps, keyof BaseEntityProps>

export class MovieEntity extends BaseEntity {
  private _video: MovieEntityProps['video']
  private _thumbnail?: MovieEntityProps['thumbnail']

  private constructor(props: MovieEntityProps) {
    super(props)
    this._video = props.video
    this._thumbnail = props.thumbnail
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  static createNew(props: NewMovieEntity, id = randomUUID()): MovieEntity {
    return new MovieEntity({
      id,
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  static createFrom(props: MovieEntityProps): MovieEntity {
    return new MovieEntity(props)
  }

  serialize() {
    return {
      id: this.id,
      video: this.video.serialize(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  get video() {
    return this._video
  }

  addVideo(video: VideoEntity) {
    this._video = video
  }

  get thumbnail() {
    return this._thumbnail
  }

  addThumbnail(thumbnail: ThumbnailEntity | undefined) {
    this._thumbnail = thumbnail
  }
}
