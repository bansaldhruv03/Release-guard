import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@ObjectType()
@Entity()
export class ExternalAccount {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  provider: string; // 'github' | 'gitlab' | 'google'

  @Field()
  @Column()
  externalId: string; // Provider's user ID

  @Field({ nullable: true })
  @Column({ nullable: true })
  email: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  displayName: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ nullable: true })
  userId: number;
}
