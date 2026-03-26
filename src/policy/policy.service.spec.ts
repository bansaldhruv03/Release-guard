/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PolicyService } from './policy.service';
import { Environment } from './entities/environment.entity';
import { Repository } from 'typeorm';

describe('PolicyService', () => {
  let service: PolicyService;
  let repo: Repository<Environment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PolicyService,
        {
          provide: getRepositoryToken(Environment),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PolicyService>(PolicyService);
    repo = module.get<Repository<Environment>>(getRepositoryToken(Environment));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllEnvironments', () => {
    it('should return environments ordered by orderIndex', async () => {
      const mockEnvs: Partial<Environment>[] = [
        { name: 'dev', orderIndex: 0 },
        { name: 'prod', orderIndex: 1 },
      ];
      const findMock = repo.find as jest.Mock;
      findMock.mockResolvedValue(mockEnvs);

      const result = await service.findAllEnvironments();

      expect(findMock).toHaveBeenCalledWith({ order: { orderIndex: 'ASC' } });
      expect(result).toEqual(mockEnvs);
    });
  });
});
