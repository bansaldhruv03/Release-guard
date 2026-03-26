import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { Environment } from './entities/environment.entity';
import { GqlAuthGuard } from '../auth/gql-auth.guard';

@Resolver(() => Environment)
export class PolicyResolver {
  constructor(private readonly policyService: PolicyService) {}

  @Query(() => [Environment], { name: 'environments' })
  @UseGuards(GqlAuthGuard)
  async getEnvironments() {
    return this.policyService.findAllEnvironments();
  }
}
