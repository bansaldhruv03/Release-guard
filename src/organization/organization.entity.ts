import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';

@ObjectType()
@Entity()
export class Organization {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field()
  @Column({ unique: true })
  slug: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  strictnessLevel: string; // 'standard' | 'strict'

  @Field()
  @Column({ default: false })
  requireMfa: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
