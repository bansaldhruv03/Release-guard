import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Organization } from './organization.entity';

@ObjectType()
@Entity()
export class Integration {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  provider: string; // 'github' | 'gitlab' | 'jira'

  @Field()
  @Column({ default: false })
  isConnected: boolean;

  @Column({ nullable: true })
  configJson: string; // Encrypted config (token, project URL, etc.)

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;

  @Field({ nullable: true })
  @Column({ nullable: true })
  organizationId: string;
}
