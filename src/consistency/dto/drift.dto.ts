import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class DriftInput {
  @Field()
  @IsString()
  upperBranch: string;

  @Field()
  @IsString()
  lowerBranch: string;
}

@ObjectType()
export class DriftResult {
  @Field()
  hasDrift: boolean;

  @Field(() => [String])
  missingCommits: string[];

  @Field()
  message: string;
}
