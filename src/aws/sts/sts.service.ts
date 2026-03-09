import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class STSService {
  constructor(private configService: ConfigService) { }

  async getSignedCredentials() {
    // Local mode: return mock credentials
    return {
      secretAccessKey: 'local-secret-key',
      accessKeyId: 'local-access-key',
      sessionToken: 'local-session-token',
    };
  }
}
