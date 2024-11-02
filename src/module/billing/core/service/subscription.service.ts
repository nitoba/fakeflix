import { Injectable } from '@nestjs/common'

import {
  SubscriptionModel,
  SubscriptionStatus,
} from '@/billingModule/core/model/subscription.model'
import { PlanRepository } from '@/billingModule/persistence/repository/plan.repository'
import { SubscriptionRepository } from '@/billingModule/persistence/repository/subscription.repository'
import { NotFoundDomainException } from '@/sharedLibs/core/exception/not-found-domain.exception'

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async createSubscription({
    planId,
  }: {
    planId: string
  }): Promise<SubscriptionModel> {
    const plan = await this.planRepository.findById(planId)
    if (!plan) {
      throw new NotFoundDomainException(`Plan with id ${planId} not found`)
    }
    const subscription = SubscriptionModel.create({
      planId,
      // TODO replace with user id from the JWT
      userId: 'user-id',
      status: SubscriptionStatus.Active,
      startDate: new Date(),
      autoRenew: true,
    })
    await this.subscriptionRepository.create(subscription)
    return subscription
  }

  async getSubscriptionByUserId(
    userId: string,
  ): Promise<SubscriptionModel | null> {
    return this.subscriptionRepository.findByUserId(userId)
  }
}
