import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Organization } from './organization.entity';
import { PromotionRule } from './promotion-rule.entity';
import { Project } from './project.entity';
import * as crypto from 'crypto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
    @InjectRepository(PromotionRule)
    private ruleRepo: Repository<PromotionRule>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
  ) {}

  async getOrganization(id: string): Promise<Organization | null> {
    return this.orgRepo.findOne({ where: { id } });
  }

  async setStrictnessLevel(id: string, level: string): Promise<Organization> {
    await this.orgRepo.update(id, { strictnessLevel: level });
    const updated = await this.getOrganization(id);
    if (!updated) throw new Error('Organization not found');
    return updated;
  }

  async generateApiKey(id: string): Promise<string> {
    const rawKey = crypto.randomBytes(32).toString('hex');
    const apiKey = `rg_org_${rawKey}`;
    await this.orgRepo.update(id, { apiKey });
    return apiKey;
  }

  // ─── Projects ─────────────────────────────────────────────────────────────

  async getProjects(organizationId: string): Promise<Project[]> {
    return this.projectRepo.find({ where: { organizationId }, order: { createdAt: 'ASC' } });
  }

  async createProject(
    organizationId: string,
    name: string,
    slug: string,
    description?: string,
  ): Promise<Project> {
    const project = this.projectRepo.create({
      organizationId,
      name,
      slug,
      description,
    });
    return this.projectRepo.save(project);
  }

  async deleteProject(organizationId: string, id: string): Promise<boolean> {
    const project = await this.projectRepo.findOne({ where: { id, organizationId } });
    if (!project) throw new Error('Project not found or access denied');
    const result = await this.projectRepo.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  // ─── Promotion Rules ──────────────────────────────────────────────────────

  async getPromotionRules(organizationId: string, projectId?: string): Promise<PromotionRule[]> {
    const where: any = { organizationId };
    if (projectId) {
      where.projectId = projectId;
    } else {
      where.projectId = IsNull();
    }
    return this.ruleRepo.find({ where });
  }

  async createPromotionRule(
    organizationId: string,
    sourceBranch: string,
    targetBranch: string,
    sourceEnvironment?: string,
    targetEnvironment?: string,
    allowed?: boolean,
    projectId?: string,
  ): Promise<PromotionRule> {
    const rule = this.ruleRepo.create({
      organizationId,
      sourceBranch,
      targetBranch,
      sourceEnvironment,
      targetEnvironment,
      allowed: allowed !== undefined ? allowed : true,
      projectId,
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
