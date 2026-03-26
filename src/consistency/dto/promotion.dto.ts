import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsString, IsArray, IsOptional } from 'class-validator';

@InputType()
export class PromotionInput {
  @Field()
  @IsString()
  sourceBranch: string;

  @Field()
  @IsString()
  targetBranch: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  commitRange?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  ticketIds?: string[];
}

@ObjectType()
export class ReasonDetail {
  @Field()
  commitId: string;

  @Field(() => [String])
  missingInEnvironments: string[];
}

@ObjectType()
export class PromotionResult {
  @Field()
  allowed: boolean;

  @Field()
  status: string; // e.g., 'SUCCESS', 'BLOCKED'

  @Field(() => [ReasonDetail], { nullable: true })
  reasons?: ReasonDetail[];

  @Field(() => String, { nullable: true })
  message?: string;
}
