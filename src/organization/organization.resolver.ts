import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { OrganizationService } from './organization.service';
import { Organization } from './organization.entity';
import { PromotionRule } from './promotion-rule.entity';

@Resolver(() => Organization)
export class OrganizationResolver {
  constructor(private readonly orgService: OrganizationService) {}

  @Query(() => Organization, { nullable: true })
  async organization(@Args('id', { type: () => ID }) id: string) {
    return this.orgService.getOrganization(id);
  }

  @Query(() => [PromotionRule])
  async promotionRules(@Args('organizationId', { type: () => ID }) orgId: string) {
    return this.orgService.getPromotionRules(orgId);
  }

  @Mutation(() => Organization)
  async updateStrictness(
    @Args('id', { type: () => ID }) id: string,
    @Args('level') level: string,
  ) {
    return this.orgService.setStrictnessLevel(id, level);
  }

  @Mutation(() => String)
  async generateApiKey(@Args('id', { type: () => ID }) id: string) {
    return this.orgService.generateApiKey(id);
  }

  @Mutation(() => PromotionRule)
  async createPromotionRule(
    @Args('organizationId', { type: () => ID }) organizationId: string,
    @Args('sourceBranch') sourceBranch: string,
    @Args('targetBranch') targetBranch: string,
    @Args('sourceEnvironment', { nullable: true }) sourceEnvironment?: string,
    @Args('targetEnvironment', { nullable: true }) targetEnvironment?: string,
    @Args('allowed', { nullable: true }) allowed?: boolean,
  ) {
    return this.orgService.createPromotionRule(
      organizationId,
      sourceBranch,
      targetBranch,
      sourceEnvironment,
      targetEnvironment,
      allowed,
    );
  }

  @Mutation(() => PromotionRule)
  async updatePromotionRule(
    @Args('id', { type: () => ID }) id: string,
    @Args('sourceBranch', { nullable: true }) sourceBranch?: string,
    @Args('targetBranch', { nullable: true }) targetBranch?: string,
    @Args('sourceEnvironment', { nullable: true }) sourceEnvironment?: string,
    @Args('targetEnvironment', { nullable: true }) targetEnvironment?: string,
    @Args('allowed', { nullable: true }) allowed?: boolean,
  ) {
    return this.orgService.updatePromotionRule(
      id,
      sourceBranch,
      targetBranch,
      sourceEnvironment,
      targetEnvironment,
      allowed,
    );
  }

  @Mutation(() => Boolean)
  async deletePromotionRule(@Args('id', { type: () => ID }) id: string) {
    return this.orgService.deletePromotionRule(id);
  }
}
