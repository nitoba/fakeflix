import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

import { PlanInterval } from '@/billingModule/core/model/plan.model'
import { SubscriptionStatus } from '@/billingModule/core/model/subscription.model'

export function enumToPgEnum<T extends Record<string, any>>(
  myEnum: T,
): [T[keyof T], ...T[keyof T][]] {
  return Object.values(myEnum).map((value: any) => `${value}`) as any
}

export const status = pgEnum('status', enumToPgEnum(SubscriptionStatus))
export const planInterval = pgEnum('planInterval', enumToPgEnum(PlanInterval))

export const plansTable = pgTable('plans', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 255 }),
  amount: numeric('amount').notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  interval: planInterval('interval').notNull(),
  trialPeriod: integer('trial_period'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
})

export const subscriptionsTable = pgTable('subscriptions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  planId: varchar('plan_id', { length: 36 })
    .notNull()
    .references(() => plansTable.id),
  status: status('status').notNull().default(SubscriptionStatus.Inactive),
  startDate: timestamp('start_date').notNull().defaultNow(),
  endDate: timestamp('end_date'),
  autoRenew: boolean('auto_renew').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
})
