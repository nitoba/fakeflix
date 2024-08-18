export type BaseEntityProps = {
  id: string
  createdAt: Date
  updatedAt: Date
}

export abstract class BaseEntity {
  protected readonly _id: BaseEntityProps['id']
  protected _createdAt: BaseEntityProps['createdAt']
  protected _updatedAt: BaseEntityProps['updatedAt']

  constructor(props: BaseEntityProps) {
    this._id = props.id
    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt
  }

  abstract serialize(): Record<string, unknown>

  get id(): string {
    return this._id
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }
}
