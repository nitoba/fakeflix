import { Module } from '@nestjs/common'

import { ContentModule } from '@/contentModule/content.module'
import { IdentityModule } from '@/identityModule/identity.module'

@Module({
  imports: [IdentityModule, ContentModule],
})
export class AppModule {}
