import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Organization } from '../../organization/organization.entity';
import { Project } from '../../organization/project.entity';

@ObjectType()
@Entity()
export class Environment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field(() => Int)
  @Column()
  orderIndex: number;

  @Field()
  @Column()
  branchPattern: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Organization, { nullable: true, onDelete: 'SET NULL' })
  organization: Organization;

  @Field({ nullable: true })
  @Column({ nullable: true })
  organizationId: string;

  @ManyToOne(() => Project, (project) => project.environments, { nullable: true, onDelete: 'CASCADE' })
  project: Project;

  @Field({ nullable: true })
  @Column({ nullable: true })
  projectId: string;
}
