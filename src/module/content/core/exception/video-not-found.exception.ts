import { DomainException } from '@/sharedLibs/core/exception/domain.exception'

export class VideoNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Video with id ${id} not found`)
  }
}
