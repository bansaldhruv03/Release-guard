import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ConsistencyService } from './consistency.service';
import { PromotionInput, PromotionResult } from './dto/promotion.dto';
import { DriftInput, DriftResult } from './dto/drift.dto';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver()
export class ConsistencyResolver {
  constructor(private readonly consistencyService: ConsistencyService) {}

  @Query(() => [String], { name: 'commitStatus' })
  @UseGuards(GqlAuthGuard)
  getCommitStatus(): string[] {
    // Basic mock implementation for commit status
    return ['dev', 'qa'];
  }

  @Mutation(() => PromotionResult, { name: 'checkPromotion' })
  @UseGuards(GqlAuthGuard)
  async checkPromotion(
    @CurrentUser() user: any,
    @Args('input') input: PromotionInput,
  ): Promise<PromotionResult> {
    // Inject orgId from authenticated user if not already set
    if (!input.projectId && user.orgId) {
      input.projectId = undefined; // Will use org-level rules
    }
    return this.consistencyService.checkPromotion(input);
  }

  @Query(() => DriftResult, { name: 'checkDrift' })
  @UseGuards(GqlAuthGuard)
  async checkDrift(
    @CurrentUser() user: any,
    @Args('input') input: DriftInput,
  ): Promise<DriftResult> {
    return this.consistencyService.checkDrift(input);
  }
}
