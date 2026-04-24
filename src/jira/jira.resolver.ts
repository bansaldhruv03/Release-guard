import { Resolver, Query, Args, ObjectType, Field } from '@nestjs/graphql';
import { JiraService } from './jira.service';

@ObjectType()
export class JiraTicketType {
  @Field()
  id: string;

  @Field()
  key: string;

  @Field()
  summary: string;

  @Field()
  status: string;

  @Field()
  assignee: string;

  @Field()
  updated: string;
}

@Resolver()
export class JiraResolver {
  constructor(private readonly jiraService: JiraService) {}

  @Query(() => [JiraTicketType])
  async syncJiraTickets(
    @Args('siteUrl') siteUrl: string,
    @Args('email') email: string,
    @Args('token') token: string,
  ): Promise<JiraTicketType[]> {
    return this.jiraService.fetchTickets(siteUrl, email, token);
  }
}
