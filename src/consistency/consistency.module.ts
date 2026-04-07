import { Module } from '@nestjs/common';
import { ConsistencyService } from './consistency.service';
import { ConsistencyResolver } from './consistency.resolver';
import { GitlabModule } from '../gitlab/gitlab.module';
import { PolicyModule } from '../policy/policy.module';
import { AiService } from './ai.service';

@Module({
  imports: [GitlabModule, PolicyModule],
  providers: [ConsistencyService, ConsistencyResolver, AiService],
  exports: [ConsistencyService, AiService]
})
export class ConsistencyModule {}
