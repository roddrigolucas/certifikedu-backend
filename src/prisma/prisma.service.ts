import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }

  //This is only used for e2e testing.
  cleanDb() {
    return this.$transaction([
      this.apiKeys.deleteMany({}),
      this.certificates.deleteMany({}),
      this.schools.deleteMany({}),
    ]);
  }
}
