import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Organization } from './organization.entity';

@ObjectType()
@Entity()
export class PromotionRule {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  sourceBranch: string; // e.g., "feature/*"

  @Field()
  @Column()
  targetBranch: string; // e.g., "develop"

  @Field({ nullable: true })
  @Column({ nullable: true })
  sourceEnvironment?: string; // e.g., "DEV"

  @Field({ nullable: true })
  @Column({ nullable: true })
  targetEnvironment?: string; // e.g., "QA"

  @Field()
  @Column({ default: true })
  allowed: boolean;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;

  @Field({ nullable: true })
  @Column({ nullable: true })
  organizationId: string;
}
