import { DomainException } from '@/sharedLibs/exception/domain.exception'

export class VideoNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Video with id ${id} not found`)
  }
}
