import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Environment } from './entities/environment.entity';

@Injectable()
export class PolicyService {
  constructor(
    @InjectRepository(Environment)
    private readonly environmentRepository: Repository<Environment>,
  ) {}

  async findAllEnvironments(): Promise<Environment[]> {
    return this.environmentRepository.find({ order: { orderIndex: 'ASC' } });
  }
}
