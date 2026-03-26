import { Module } from '@nestjs/common';
import { ConsistencyService } from './consistency.service';
import { ConsistencyResolver } from './consistency.resolver';
import { GitlabModule } from '../gitlab/gitlab.module';
import { PolicyModule } from '../policy/policy.module';

@Module({
  imports: [GitlabModule, PolicyModule],
  providers: [ConsistencyService, ConsistencyResolver],
})
export class ConsistencyModule {}
