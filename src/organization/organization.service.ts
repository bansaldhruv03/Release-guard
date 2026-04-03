import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './organization.entity';
import { PromotionRule } from './promotion-rule.entity';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
    @InjectRepository(PromotionRule)
    private ruleRepo: Repository<PromotionRule>,
  ) {}

  async getOrganization(id: string): Promise<Organization | null> {
    return this.orgRepo.findOne({ where: { id } });
  }

  async getPromotionRules(organizationId: string): Promise<PromotionRule[]> {
    return this.ruleRepo.find({ where: { organizationId } });
  }

  async setStrictnessLevel(id: string, level: string): Promise<Organization> {
    await this.orgRepo.update(id, { strictnessLevel: level });
    const updated = await this.getOrganization(id);
    if (!updated) throw new Error('Organization not found');
    return updated;
  }

  async createPromotionRule(
    organizationId: string,
    sourceBranch: string,
    targetBranch: string,
    sourceEnvironment?: string,
    targetEnvironment?: string,
    allowed?: boolean,
  ): Promise<PromotionRule> {
    const rule = this.ruleRepo.create({
      organizationId,
      sourceBranch,
      targetBranch,
      sourceEnvironment,
      targetEnvironment,
      allowed: allowed !== undefined ? allowed : true,
    });
    return this.ruleRepo.save(rule);
  }

  async updatePromotionRule(
    id: string,
    sourceBranch?: string,
    targetBranch?: string,
    sourceEnvironment?: string,
    targetEnvironment?: string,
    allowed?: boolean,
  ): Promise<PromotionRule> {
    const rule = await this.ruleRepo.findOne({ where: { id } });
    if (!rule) throw new Error('Rule not found');
    if (sourceBranch !== undefined) rule.sourceBranch = sourceBranch;
    if (targetBranch !== undefined) rule.targetBranch = targetBranch;
    if (sourceEnvironment !== undefined) rule.sourceEnvironment = sourceEnvironment;
    if (targetEnvironment !== undefined) rule.targetEnvironment = targetEnvironment;
    if (allowed !== undefined) rule.allowed = allowed;
    return this.ruleRepo.save(rule);
  }

  async deletePromotionRule(id: string): Promise<boolean> {
    const result = await this.ruleRepo.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
}
