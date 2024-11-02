import { Module } from '@nestjs/common'

import { SubscriptionService } from '@/billingModule/core/service/subscription.service'
import { SubscriptionController } from '@/billingModule/http/rest/controller/subscription.controller'
import { BillingPersistenceModule } from '@/billingModule/persistence/billing-persistence.module'

@Module({
  imports: [BillingPersistenceModule],
  providers: [SubscriptionService],
  controllers: [SubscriptionController],
  exports: [],
})
export class BillingModule {}
