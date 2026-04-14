import { Test, TestingModule } from '@nestjs/testing';
import { ConsistencyService } from './consistency.service';
import { GitlabService } from '../gitlab/gitlab.service';
import { PolicyService } from '../policy/policy.service';
import { PromotionInput } from './dto/promotion.dto';
import { AiService } from './ai.service';

describe('ConsistencyService', () => {
  let service: ConsistencyService;
  let gitlabService: GitlabService;
  let policyService: PolicyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsistencyService,
        {
          provide: GitlabService,
          useValue: {
            getBranchCommits: jest.fn(),
            getCommitDiff: jest.fn(),
          },
        },
        {
          provide: PolicyService,
          useValue: {
            findAllEnvironments: jest.fn(),
          },
        },
        {
          provide: AiService,
          useValue: {
            evaluateCommitMessage: jest.fn().mockResolvedValue({ isAcceptable: true, reason: 'Valid' }),
          },
        },
      ],
    }).compile();

    service = module.get<ConsistencyService>(ConsistencyService);
    gitlabService = module.get<GitlabService>(GitlabService);
    policyService = module.get<PolicyService>(PolicyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkPromotion', () => {
    const input: PromotionInput = {
      sourceBranch: 'feature/abc',
      targetBranch: 'qa',
    };

    it('should allow promotion if target branch is not protected', async () => {
      const mockEnvs = [{ name: 'dev', branchPattern: 'dev' }];
      (policyService.findAllEnvironments as jest.Mock).mockResolvedValue(
        mockEnvs,
      );

      const result = await service.checkPromotion(input);
      expect(result.allowed).toBe(true);
      expect(result.message).toContain('not a protected environment');
    });

    it('should allow promotion if it is the first environment', async () => {
      const mockEnvs = [{ name: 'dev', branchPattern: 'qa' }];
      (policyService.findAllEnvironments as jest.Mock).mockResolvedValue(
        mockEnvs,
      );

      const result = await service.checkPromotion(input);
      expect(result.allowed).toBe(true);
      expect(result.message).toContain('lowest environment');
    });

    it('should block promotion if commits are missing in the previous environment', async () => {
      const mockEnvs = [
        { name: 'dev', branchPattern: 'dev' },
        { name: 'qa', branchPattern: 'qa' },
      ];
      (policyService.findAllEnvironments as jest.Mock).mockResolvedValue(
        mockEnvs,
      );
      (gitlabService.getCommitDiff as jest.Mock).mockResolvedValue([
        'commit-missing',
      ]);
      (gitlabService.getBranchCommits as jest.Mock).mockResolvedValue([
        'commit-other',
      ]);

      const result = await service.checkPromotion(input);

      expect(result.allowed).toBe(false);
      expect(result.status).toBe('BLOCKED');
    });

    it('should allow promotion if all commits exist in previous environment', async () => {
      const mockEnvs = [
        { name: 'dev', branchPattern: 'dev' },
        { name: 'qa', branchPattern: 'qa' },
      ];
      (policyService.findAllEnvironments as jest.Mock).mockResolvedValue(
        mockEnvs,
      );
      (gitlabService.getCommitDiff as jest.Mock).mockResolvedValue([
        'commit-ok',
      ]);
      (gitlabService.getBranchCommits as jest.Mock).mockResolvedValue([
        'commit-ok',
        'commit-other',
      ]);

      const result = await service.checkPromotion(input);

      expect(result.allowed).toBe(true);
      expect(result.status).toBe('SUCCESS');
    });
  });
});
