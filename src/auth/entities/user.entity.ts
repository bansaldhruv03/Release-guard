import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Organization } from '../../organization/organization.entity';

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column({ unique: true })
  @Field()
  username: string;

  @Column({ nullable: true })
  password?: string; // Nullable for social logins

  @Field({ nullable: true })
  @Column({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phoneNumber?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  githubId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  gitlabId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  googleId?: string;

  @Field()
  @Column({ default: 'admin' })
  role: string; // 'admin' | 'user'

  @Field({ nullable: true })
  @Column({ nullable: true })
  mfaSecret?: string;

  @Field()
  @Column({ default: false })
  mfaEnabled: boolean;

  @ManyToOne(() => Organization, { nullable: true, onDelete: 'SET NULL' })
  organization: Organization;

  @Field({ nullable: true })
  @Column({ nullable: true })
  organizationId?: string;

  @Column({ nullable: true })
  resetToken?: string;

  @Column({ nullable: true, type: 'datetime' })
  resetTokenExpiry?: Date;
}
