import { DomainException } from './domain.exception'

export class VideoNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Video with id ${id} not found`)
  }
}
