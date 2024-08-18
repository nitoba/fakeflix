/* eslint-disable no-use-before-define */
import { randomUUID } from 'node:crypto'

import { BaseEntity, BaseEntityProps } from './base.entity'

export type NewThumbnailEntity = Omit<
  ThumbnailEntityProps,
  keyof BaseEntityProps
>

export interface ThumbnailEntityProps extends BaseEntityProps {
  url: string
}

export class ThumbnailEntity extends BaseEntity {
  private readonly _url: ThumbnailEntityProps['url']

  private constructor(props: ThumbnailEntityProps) {
    super(props)
    this._url = props.url
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  static createNew(
    props: NewThumbnailEntity,
    id = randomUUID(),
  ): ThumbnailEntity {
    return new ThumbnailEntity({
      ...props,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  static createFrom(props: ThumbnailEntityProps): ThumbnailEntity {
    return new ThumbnailEntity(props)
  }

  serialize() {
    return {
      id: this.id,
      url: this.url,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  get url() {
    return this._url
  }
}
