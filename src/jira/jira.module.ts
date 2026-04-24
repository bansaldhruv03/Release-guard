import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JiraService } from './jira.service';
import { JiraResolver } from './jira.resolver';

@Module({
  imports: [HttpModule],
  providers: [JiraService, JiraResolver],
  exports: [JiraService],
})
export class JiraModule {}
