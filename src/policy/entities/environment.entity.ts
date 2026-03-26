import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Environment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  name: string; // e.g., 'dev', 'qa', 'stage', 'prod'

  @Field(() => Int)
  @Column()
  orderIndex: number; // e.g., 1, 2, 3, 4

  @Field()
  @Column()
  branchPattern: string; // e.g., 'develop', 'qa', 'stage', 'main'
}
