import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Organization } from './organization.entity';
import { Environment } from '../policy/entities/environment.entity';
import { PromotionRule } from './promotion-rule.entity';

@ObjectType()
@Entity()
export class Project {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  slug: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;

  @Field()
  @Column()
  organizationId: string;

  @OneToMany(() => Environment, (env) => env.project)
  environments: Environment[];

  @OneToMany(() => PromotionRule, (rule) => rule.project)
  promotionRules: PromotionRule[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
