import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { instanceToPlain, plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { switchMap } from 'rxjs'

@Injectable()
export class RestResponseInterceptor<T extends object>
  implements NestInterceptor<any, T>
{
  constructor(private readonly dto: new () => T) {}

  intercept(_context: ExecutionContext, next: CallHandler): any {
    return next.handle().pipe(
      switchMap(async (data: T) => {
        const transformeData = plainToInstance(
          this.dto,
          instanceToPlain(data),
          {
            excludeExtraneousValues: true,
          },
        )
        const errors = await validate(transformeData)

        if (errors.length > 0) {
          throw new BadRequestException({
            message: 'Response validation failed',
            errors,
          })
        }

        return transformeData
      }),
    )
  }
}
