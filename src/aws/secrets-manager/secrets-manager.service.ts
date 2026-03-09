import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecretManagerService {
  constructor(private configService: ConfigService) { }

  async getSecretFromKey(key: string): Promise<string> {
    // Local mode: read secrets from .env via ConfigService
    const value = this.configService.get(key);
    if (!value) {
      console.warn(`[LocalSecrets] Secret "${key}" not found in .env`);
      return '';
    }
    return value;
  }
}
