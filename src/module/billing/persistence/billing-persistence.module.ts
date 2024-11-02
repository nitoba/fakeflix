import { Module } from '@nestjs/common'

import * as billingSchema from '@/billingModule/persistence/database.schema'
import { PlanRepository } from '@/billingModule/persistence/repository/plan.repository'
import { SubscriptionRepository } from '@/billingModule/persistence/repository/subscription.repository'
import { DrizzlePersistenceModule } from '@/sharedModules/persistence/drizzle/drizzle-persistence.module'

@Module({
  imports: [DrizzlePersistenceModule.forRoot(billingSchema)],
  providers: [PlanRepository, SubscriptionRepository],
  exports: [PlanRepository, SubscriptionRepository],
})
export class BillingPersistenceModule {}
