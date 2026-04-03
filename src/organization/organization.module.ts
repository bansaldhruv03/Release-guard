import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './organization.entity';
import { PromotionRule } from './promotion-rule.entity';
import { Integration } from './integration.entity';
import { OrganizationService } from './organization.service';
import { OrganizationResolver } from './organization.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, PromotionRule, Integration])],
  providers: [OrganizationService, OrganizationResolver],
  exports: [OrganizationService],
})
export class OrganizationModule implements OnModuleInit {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
  ) {}

  async onModuleInit() {
    const orgId = "def1024b-abcd-4114-1234-abcd00000001";
    const existing = await this.orgRepo.findOne({ where: { id: orgId } });
    if (!existing) {
      await this.orgRepo.save(this.orgRepo.create({
        id: orgId,
        name: "Default Demo Org",
        slug: "demo-org",
        strictnessLevel: "STRICT",
        requireMfa: false
      }));
    }
  }
}
