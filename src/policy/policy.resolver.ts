import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { Environment } from './entities/environment.entity';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => Environment)
export class PolicyResolver {
  constructor(private readonly policyService: PolicyService) {}

  @Query(() => [Environment], { name: 'environments' })
  @UseGuards(GqlAuthGuard)
  async getEnvironments(
    @CurrentUser() user: any,
    @Args('projectId', { nullable: true }) projectId?: string,
  ) {
    return this.policyService.findAllEnvironments(projectId);
  }
}
