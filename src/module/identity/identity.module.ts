import { ApolloDriver } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { JwtModule } from '@nestjs/jwt'

import { BillingSubscriptionStatusApi } from '@/sharedModules/integration/interface/billing-integration.interface'
import { DomainModuleIntegrationModule } from '@/sharedModules/integration/interface/domain-integration.module'
import { PersistenceModule } from '@/sharedModules/persistence/prisma/persistence.module'

import {
  AuthService,
  jwtConstants,
} from './core/service/authentication.service'
import { UserManagementService } from './core/service/user-management.service'
import { AuthResolver } from './http/graphql/auth.resolver'
import { UserResolver } from './http/graphql/user.resolver'
import { BillingSubscriptionRepository } from './persistence/repository/external/billing-subscription.repository'
import { UserRepository } from './persistence/repository/user.repository'

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      driver: ApolloDriver,
    }),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60m' },
    }),
    PersistenceModule,
    DomainModuleIntegrationModule,
  ],
  providers: [
    AuthService,
    AuthResolver,
    UserResolver,
    UserManagementService,
    UserRepository,
    {
      provide: BillingSubscriptionStatusApi,
      useExisting: BillingSubscriptionRepository,
    },
    BillingSubscriptionRepository,
  ],
})
export class IdentityModule {}
