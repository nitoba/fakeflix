import { Test, TestingModule } from '@nestjs/testing'

import { UserRepository } from '@/identityModule/persistence/repository/user.repository'
import { ConfigModule } from '@/sharedModules/config/config.module'
import { PrismaService } from '@/sharedModules/persistence/prisma/prisma.service'

import { UserManagementService } from '../../user-management.service'

describe('UserManagementService', () => {
  let service: UserManagementService
  let userRepository: UserRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [UserManagementService, UserRepository, PrismaService],
    }).compile()

    service = module.get<UserManagementService>(UserManagementService)
    userRepository = module.get<UserRepository>(UserRepository)
  })

  describe('create', () => {
    it('creates a new user', async () => {
      const user = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
      }

      vi.spyOn(userRepository, 'save').mockResolvedValueOnce()

      const createdUser = await service.create(user)
      const { email, firstName, lastName } = createdUser

      expect(email).toEqual(user.email)
      expect(firstName).toEqual(user.firstName)
      expect(lastName).toEqual(user.lastName)
    })
  })
})
