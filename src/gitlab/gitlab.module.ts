import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GitlabService } from './gitlab.service';

@Module({
  imports: [ConfigModule],
  providers: [GitlabService],
  exports: [GitlabService],
})
export class GitlabModule {}
