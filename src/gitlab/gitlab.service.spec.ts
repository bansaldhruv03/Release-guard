/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GitlabService } from './gitlab.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GitlabService', () => {
  let service: GitlabService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GitlabService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'GITLAB_TOKEN') return 'test-token';
              if (key === 'GITLAB_URL') return 'https://gitlab.com/api/v4';
              if (key === 'GITLAB_PROJECT_ID') return '123';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<GitlabService>(GitlabService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBranchCommits', () => {
    it('should fetch commits successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [{ id: 'commit1' }, { id: 'commit2' }],
      });

      const commits = await service.getBranchCommits('main');

      // Use mockedAxios directly to avoid unbound-method on service
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(
          '/projects/123/repository/commits?ref_name=main',
        ),
        expect.objectContaining({ headers: { 'PRIVATE-TOKEN': 'test-token' } }),
      );
      expect(commits).toEqual(['commit1', 'commit2']);
    });

    it('should return empty array on failure', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API error'));

      const commits = await service.getBranchCommits('main');

      expect(commits).toEqual([]);
    });
  });

  describe('getCommitDiff', () => {
    it('should fetch diff successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { commits: [{ id: 'commitA' }, { id: 'commitB' }] },
      });

      const diff = await service.getCommitDiff('feature', 'main');

      expect(diff).toEqual(['commitA', 'commitB']);
    });
  });

  describe('listBranches', () => {
    it('should list branches successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: [{ name: 'main' }, { name: 'dev' }],
      });

      const branches = await service.listBranches();
      expect(branches).toEqual(['main', 'dev']);
    });
  });
});
