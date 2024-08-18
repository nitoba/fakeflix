import { Column, Entity } from 'typeorm'

import { DefaultEntity } from '@/infra/module/typeorm/entity/default.entity'

@Entity({ name: 'thumbnails' })
export class Thumbnail extends DefaultEntity<Thumbnail> {
  @Column()
  url: string
}
