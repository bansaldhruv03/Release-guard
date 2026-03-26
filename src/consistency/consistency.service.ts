import { Injectable, Logger } from '@nestjs/common';
import { GitlabService } from '../gitlab/gitlab.service';
import { PolicyService } from '../policy/policy.service';
import {
  PromotionInput,
  PromotionResult,
  ReasonDetail,
} from './dto/promotion.dto';

@Injectable()
export class ConsistencyService {
  private readonly logger = new Logger(ConsistencyService.name);

  constructor(
    private readonly gitlabService: GitlabService,
    private readonly policyService: PolicyService,
  ) {}

  async checkPromotion(input: PromotionInput): Promise<PromotionResult> {
    this.logger.log(
      `Checking promotion from ${input.sourceBranch} to ${input.targetBranch}`,
    );

    // 1. Fetch environments
    const environments = await this.policyService.findAllEnvironments();

    // Quick validation: is targetBranch an environment branch?
    const targetEnvIndex = environments.findIndex(
      (e) => e.branchPattern === input.targetBranch,
    );

    if (targetEnvIndex === -1 && environments.length > 0) {
      // If no target env match, it's just a regular branch push (like bugfix -> feature), allow.
      return {
        allowed: true,
        status: 'SUCCESS',
        message: 'Target branch is not a protected environment.',
      };
    }

    if (environments.length === 0) {
      this.logger.warn(
        'No environments defined in policy. Proceeding with dummy logic.',
      );
      return {
        allowed: true,
        status: 'SUCCESS',
        message: 'No policy configured. Promotion allowed.',
      };
    }

    // Identify previous environment (E-1)
    if (targetEnvIndex === 0) {
      // E.g. pushing to 'dev', maybe from feature branch. Allowed by default
      return {
        allowed: true,
        status: 'SUCCESS',
        message: 'Promotion to lowest environment allowed.',
      };
    }

    const previousEnvironment = environments[targetEnvIndex - 1];

    // 2. Fetch commits to be promoted
    let commitsToPromote = input.commitRange;
    if (!commitsToPromote || commitsToPromote.length === 0) {
      commitsToPromote = await this.gitlabService.getCommitDiff(
        input.sourceBranch,
        input.targetBranch,
      );
    }

    // 3. Verify commits exist in E-1 branch
    const previousEnvCommits = await this.gitlabService.getBranchCommits(
      previousEnvironment.branchPattern,
    );

    const missingCommits: ReasonDetail[] = [];

    for (const commitId of commitsToPromote) {
      if (!previousEnvCommits.includes(commitId)) {
        missingCommits.push({
          commitId,
          missingInEnvironments: [previousEnvironment.name],
        });
      }
    }

    if (missingCommits.length > 0) {
      return {
        allowed: false,
        status: 'BLOCKED',
        message: `Consistency check failed. Commits not present in lower environment (${previousEnvironment.name}).`,
        reasons: missingCommits,
      };
    }

    return {
      allowed: true,
      status: 'SUCCESS',
      message: 'All commits present in required environments.',
    };
  }
}
