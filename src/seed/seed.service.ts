import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Environment } from '../policy/entities/environment.entity';
import { User } from '../auth/entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Environment)
    private envRepo: Repository<Environment>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    // Only seed if environments are empty
    const count = await this.envRepo.count();
    if (count === 0) {
      console.log('🌱 Seeding initial environment policies...');
      await this.envRepo.save([
        { 
          name: 'DEV', 
          branchPattern: 'feature/*', 
          orderIndex: 0,
          description: 'Local development and feature branch testing.'
        },
        { 
          name: 'QA', 
          branchPattern: 'develop', 
          orderIndex: 1, 
          description: 'Quality assurance and stability verification.'
        },
        { 
          name: 'STAGE', 
          branchPattern: 'qa', 
          orderIndex: 2, 
          description: 'Pre-production staging and UAT.'
        },
        { 
          name: 'PROD', 
          branchPattern: 'main', 
          orderIndex: 3, 
          description: 'Production live environment. Mission critical.'
        },
      ]);
    }

    const userCount = await this.userRepo.count();
    if (userCount === 0) {
      console.log('👤 Seeding initial admin user...');
      const hashedPassword = await bcrypt.hash('password', 10);
      const admin = new User();
      admin.username = 'admin';
      admin.password = hashedPassword;
      await this.userRepo.save(admin);
    }
  }
}
