/* eslint-disable no-use-before-define */
import { randomUUID } from 'node:crypto'

import { BaseEntity, BaseEntityProps } from './base.entity'

export type NewVideoEntity = Omit<VideoEntityProps, keyof BaseEntityProps>

export interface VideoEntityProps extends BaseEntityProps {
  url: string
  sizeInKb: number
  durationInSeconds: number
}

export class VideoEntity extends BaseEntity {
  private readonly _url: VideoEntityProps['url']
  private readonly _sizeInKb: VideoEntityProps['sizeInKb']
  private readonly _durationInSeconds: VideoEntityProps['durationInSeconds']

  private constructor(props: VideoEntityProps) {
    super(props)
    this._url = props.url
    this._sizeInKb = props.sizeInKb
    this._durationInSeconds = props.durationInSeconds
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  static createNew(props: NewVideoEntity, id = randomUUID()): VideoEntity {
    return new VideoEntity({
      id,
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  static createFrom(props: VideoEntityProps): VideoEntity {
    return new VideoEntity(props)
  }

  static getMaxFileSizeInKb(): number {
    const MAX_FILE_SIZE_IN_KB = 1024 * 1024 * 1024 // 1 GB
    return MAX_FILE_SIZE_IN_KB
  }

  static getMaxThumbnailSizeInKb(): number {
    const MAX_THUMBNAIL_SIZE_IN_KB = 1024 * 1024 * 10 // 10 MB
    return MAX_THUMBNAIL_SIZE_IN_KB
  }

  serialize() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      url: this.url,
      sizeInKb: this.sizeInKb,
      durationInSeconds: this.durationInSeconds,
    }
  }

  get url() {
    return this._url
  }

  get sizeInKb() {
    return this._sizeInKb
  }

  get durationInSeconds() {
    return this._durationInSeconds
  }
}
