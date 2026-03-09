import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { SecretManagerService } from 'src/aws/secrets-manager/secrets-manager.service';

@Injectable()
export class MetabaseService implements OnModuleInit {
  METABASE_SITE_URL: string = null;
  METABASE_SECRET_KEY: string = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly smsService: SecretManagerService,
  ) { }

  async onModuleInit() {
    this.METABASE_SITE_URL = this.configService.get('METABASE_SITE_URL');
    this.METABASE_SECRET_KEY = await this.smsService.getSecretFromKey('METABASE_SECRET_KEY');

    if (!this.METABASE_SECRET_KEY || !this.METABASE_SITE_URL) {
      console.warn('[Metabase] METABASE_SECRET_KEY or METABASE_SITE_URL not configured. Metabase reports will be disabled.');
    }
  }

  async getPJReports(cnpj: string) {
    const payload = {
      resource: { dashboard: 3 },
      params: {
        cnpj: cnpj,
      },
      exp: Math.round(Date.now() / 1000) + 10 * 60,
    };

    const token = jwt.sign(payload, this.METABASE_SECRET_KEY);

    const iframeUrl = this.METABASE_SITE_URL + '/embed/dashboard/' + token + '#bordered=false&titled=false';
    return iframeUrl;
  }
}
