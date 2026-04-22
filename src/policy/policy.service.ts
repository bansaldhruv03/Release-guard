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

  async findAllEnvironments(projectId?: string): Promise<Environment[]> {
    const where = projectId ? { projectId } : {};
    return this.environmentRepository.find({ 
      where,
      order: { orderIndex: 'ASC' } 
    });
  }
}
