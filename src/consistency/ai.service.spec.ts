import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import axios from 'axios';

jest.mock('axios');

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should skip if no OPENAI_API_KEY is available', async () => {
    const originalEnv = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const result = await service.evaluateCommitMessage('wip');
    
    expect(result.isAcceptable).toBe(true);
    expect(result.reason).toContain('skipped');
    expect(axios.post).not.toHaveBeenCalled();

    process.env.OPENAI_API_KEY = originalEnv;
  });

  it('should call OpenAI API and return acceptable result', async () => {
    process.env.OPENAI_API_KEY = 'test-key';

    (axios.post as jest.Mock).mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: JSON.stringify({ isAcceptable: true, reason: 'Good description' }),
            },
          },
        ],
      },
    });

    const result = await service.evaluateCommitMessage('feat: add AI check');
    
    expect(result.isAcceptable).toBe(true);
    expect(result.reason).toBe('Good description');
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('should return allowed default if OpenAI API fails', async () => {
    process.env.OPENAI_API_KEY = 'test-key';

    (axios.post as jest.Mock).mockRejectedValue(new Error('Network Error'));

    const result = await service.evaluateCommitMessage('feat: stuff');
    
    expect(result.isAcceptable).toBe(true);
    expect(result.reason).toContain('defaulting to allow');
  });
});
