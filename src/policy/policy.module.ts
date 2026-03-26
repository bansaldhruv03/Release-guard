import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyService } from './policy.service';
import { PolicyResolver } from './policy.resolver';
import { Environment } from './entities/environment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Environment])],
  providers: [PolicyService, PolicyResolver],
  exports: [PolicyService],
})
export class PolicyModule {}
