import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { OrganizationService } from './organization.service';
import { Organization } from './organization.entity';
import { PromotionRule } from './promotion-rule.entity';
import { Project } from './project.entity';

const DEFAULT_ORG = 'def1024b-abcd-4114-1234-abcd00000001';

@Resolver(() => Organization)
export class OrganizationResolver {
  constructor(private readonly orgService: OrganizationService) {}

  // ─── Organization ─────────────────────────────────────────────────────────

  @Query(() => Organization, { nullable: true })
  async organization(@Args('id', { type: () => ID, nullable: true }) id?: string) {
    return this.orgService.getOrganization(id || DEFAULT_ORG);
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

  // ─── Projects ─────────────────────────────────────────────────────────────

  @Query(() => [Project])
  async projects(@Args('organizationId', { type: () => ID, nullable: true }) orgId?: string) {
    return this.orgService.getProjects(orgId || DEFAULT_ORG);
  }

  @Mutation(() => Project)
  async createProject(
    @Args('name') name: string,
    @Args('slug') slug: string,
    @Args('description', { nullable: true }) description?: string,
    @Args('organizationId', { type: () => ID, nullable: true }) orgId?: string,
  ) {
    return this.orgService.createProject(orgId || DEFAULT_ORG, name, slug, description);
  }

  @Mutation(() => Boolean)
  async deleteProject(
    @Args('id', { type: () => ID }) id: string,
    @Args('organizationId', { type: () => ID, nullable: true }) orgId?: string,
  ) {
    return this.orgService.deleteProject(orgId || DEFAULT_ORG, id);
  }

  // ─── Promotion Rules ───────────────────────────────────────────────────────

  @Query(() => [PromotionRule])
  async promotionRules(
    @Args('organizationId', { type: () => ID, nullable: true }) orgId?: string,
    @Args('projectId', { nullable: true }) projectId?: string,
  ) {
    return this.orgService.getPromotionRules(orgId || DEFAULT_ORG, projectId);
  }

  @Mutation(() => PromotionRule)
  async createPromotionRule(
    @Args('sourceBranch') sourceBranch: string,
    @Args('targetBranch') targetBranch: string,
    @Args('projectId', { nullable: true }) projectId?: string,
    @Args('sourceEnvironment', { nullable: true }) sourceEnvironment?: string,
    @Args('targetEnvironment', { nullable: true }) targetEnvironment?: string,
    @Args('allowed', { nullable: true }) allowed?: boolean,
    @Args('organizationId', { type: () => ID, nullable: true }) orgId?: string,
  ) {
    return this.orgService.createPromotionRule(
      orgId || DEFAULT_ORG,
      sourceBranch,
      targetBranch,
      sourceEnvironment,
      targetEnvironment,
      allowed,
      projectId,
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
      id, sourceBranch, targetBranch, sourceEnvironment, targetEnvironment, allowed,
    );
  }

  @Mutation(() => Boolean)
  async deletePromotionRule(@Args('id', { type: () => ID }) id: string) {
    return this.orgService.deletePromotionRule(id);
  }
}
