import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class PromotionRule {
  @Field()
  sourceBranch: string;

  @Field()
  targetBranch: string;

  @Field()
  allowed: boolean;
}
