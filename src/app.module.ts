import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PolicyModule } from './policy/policy.module';
import { ConsistencyModule } from './consistency/consistency.module';
import { GitlabModule } from './gitlab/gitlab.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';
import { Environment } from './policy/entities/environment.entity';
import { User } from './auth/entities/user.entity';
import { ExternalAccount } from './auth/entities/external-account.entity';
import { OrganizationModule } from './organization/organization.module';
import { Organization } from './organization/organization.entity';
import { PromotionRule } from './organization/promotion-rule.entity';
import { Project } from './organization/project.entity';
import { Integration } from './organization/integration.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // Use in-memory schema for Cloud Run (zero-config, faster)
        autoSchemaFile: true,
        context: ({ req }: { req: Request }) => ({ req }),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbHost = config.get('DB_HOST');
        if (!dbHost) {
          // Zero-config fallback for cloud demos
          const isProduction = process.env.NODE_ENV === 'production';
          return {
            type: 'sqlite',
            database: isProduction ? '/tmp/release-guard.sqlite' : 'release-guard.sqlite',
            entities: [Environment, User, ExternalAccount, Organization, PromotionRule, Integration, Project],
            synchronize: true,
            logging: false,
          };
        }
        return {
          type: 'postgres',
          host: dbHost,
          port: parseInt(config.get('DB_PORT') ?? '5432'),
          username: config.get('DB_USERNAME'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_NAME'),
          entities: [Environment, User, ExternalAccount, Organization, PromotionRule, Integration, Project],
          synchronize: true,
        };
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveStaticOptions: {
        index: ['index.html'],
      },
    }),
    HealthModule,
    AuthModule,
    PolicyModule,
    ConsistencyModule,
    GitlabModule,
    OrganizationModule,
    // SeedModule, // Disabled temporarily for faster Cloud Run startup
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
