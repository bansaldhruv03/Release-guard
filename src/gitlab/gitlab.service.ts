import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface GitLabCommit {
  id: string;
}

interface GitLabCompare {
  commits: GitLabCommit[];
}

interface GitLabBranch {
  name: string;
}

@Injectable()
export class GitlabService {
  private readonly logger = new Logger(GitlabService.name);
  private readonly gitlabToken: string;
  private readonly gitlabUrl: string;
  private readonly projectId: string;

  private readonly isMock: boolean;

  constructor(private readonly config: ConfigService) {
    this.gitlabToken = this.config.get<string>('GITLAB_TOKEN') ?? '';
    this.gitlabUrl =
      this.config.get<string>('GITLAB_URL') ?? 'https://gitlab.com/api/v4';
    this.projectId = this.config.get<string>('GITLAB_PROJECT_ID') ?? '';
    this.isMock = this.config.get<string>('GITLAB_MOCK') === 'true';
  }

  private get headers() {
    return { 'PRIVATE-TOKEN': this.gitlabToken };
  }

  async getBranchCommits(branchName: string): Promise<string[]> {
    if (this.isMock) {
      this.logger.log(`[MOCK] Fetching commits for branch: ${branchName}`);
      if (branchName === 'develop') return ['commit-1', 'commit-2'];
      if (branchName === 'qa') return ['commit-1', 'commit-2', 'commit-3'];
      return ['commit-1'];
    }
    try {
      this.logger.log(`Fetching commits for branch: ${branchName}`);
      const response = await axios.get<GitLabCommit[]>(
        `${this.gitlabUrl}/projects/${this.projectId}/repository/commits?ref_name=${encodeURIComponent(branchName)}&per_page=100`,
        { headers: this.headers },
      );
      return response.data.map((commit) => commit.id);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to fetch commits for branch ${branchName}: ${message}`,
      );
      return [];
    }
  }

  async getCommitDiff(
    sourceBranch: string,
    targetBranch: string,
  ): Promise<string[]> {
    if (this.isMock) {
      this.logger.log(`[MOCK] Fetching diff: ${sourceBranch} vs ${targetBranch}`);
      // Simulate that any feature branch push contains 'commit-X' which is NOT in develop
      return ['commit-feature-1', 'commit-feature-2'];
    }
    try {
      this.logger.log(`Fetching diff: ${sourceBranch} vs ${targetBranch}`);
      const response = await axios.get<GitLabCompare>(
        `${this.gitlabUrl}/projects/${this.projectId}/repository/compare?from=${encodeURIComponent(targetBranch)}&to=${encodeURIComponent(sourceBranch)}`,
        { headers: this.headers },
      );
      return response.data.commits.map((commit) => commit.id);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch commit diff: ${message}`);
      return [];
    }
  }

  async listBranches(): Promise<string[]> {
    try {
      this.logger.log(`Listing all branches for project ${this.projectId}`);
      const response = await axios.get<GitLabBranch[]>(
        `${this.gitlabUrl}/projects/${this.projectId}/repository/branches?per_page=100`,
        { headers: this.headers },
      );
      return response.data.map((branch) => branch.name);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to list branches: ${message}`);
      return [];
    }
  }
}
