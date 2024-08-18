import { randomUUID } from 'node:crypto'

import { BaseEntity, BaseEntityProps } from './base.entity'
import { MovieEntity } from './movie.entity'

export const ContentType = {
  MOVIE: 'MOVIE',
  TV_SHOW: 'TV_SHOW',
} as const

export type ContentType = (typeof ContentType)[keyof typeof ContentType]

export interface ContentEntityProps extends BaseEntityProps {
  media?: MovieEntity
  type: ContentType
  title: string
  description: string
}

export type NewContentEntity = Omit<ContentEntityProps, keyof BaseEntityProps>

export class ContentEntity extends BaseEntity {
  private _media: ContentEntityProps['media']
  private _type: ContentEntityProps['type']
  private _title: ContentEntityProps['title']
  private _description: ContentEntityProps['description']

  private constructor(props: ContentEntityProps) {
    super(props)
    this._media = props.media
    this._type = props.type
    this._title = props.title
    this._description = props.description
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  static createNew(props: NewContentEntity, id = randomUUID()): ContentEntity {
    return new ContentEntity({
      ...props,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  static createFrom(props: ContentEntityProps): ContentEntity {
    return new ContentEntity(props)
  }

  serialize() {
    return {
      id: this.id,
      media: this._media?.serialize(),
      type: this._type,
      title: this._title,
      description: this._description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  get media() {
    return this._media
  }

  get type() {
    return this._type
  }

  get title() {
    return this._title
  }

  get description() {
    return this._description
  }

  get isMovie() {
    return this._type === ContentType.MOVIE
  }

  get isTvShow() {
    return this._type === ContentType.TV_SHOW
  }

  addMedia(media: MovieEntity) {
    this._media = media
  }
}
