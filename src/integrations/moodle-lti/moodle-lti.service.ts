import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class MoodleLtiService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async getLTIAuthRedirectUrl(body: any): Promise<string> {
    const { iss, client_id, target_link_uri, login_hint, lti_message_hint } = body;

    // Find the configuration by Issuer and Client ID
    const config = await this.prismaService.moodleLtiConfiguration.findUnique({
      where: {
        issuer_clientId: {
          issuer: iss,
          clientId: client_id,
        },
      },
    });

    if (!config) {
      throw new NotFoundException('Moodle LTI Configuration not found for this issuer/clientId.');
    }

    const state = randomUUID();
    const nonce = randomUUID();

    // In a full implementation, we should store the state/nonce locally 
    // to verify it upon launch. For now, we will pass them along.

    const authUrl = new URL(config.authUrl);
    
    // Construct OIDC auth request to Moodle
    const redirectParams = new URLSearchParams({
      scope: 'openid',
      response_type: 'id_token',
      response_mode: 'form_post',
      prompt: 'none',
      client_id: config.clientId,
      redirect_uri: target_link_uri, // The launch URL
      login_hint: login_hint,
      state: state,
      nonce: nonce,
    });

    if (lti_message_hint) {
      redirectParams.append('lti_message_hint', lti_message_hint);
    }

    authUrl.search = redirectParams.toString();
    return authUrl.toString();
  }

  getPublicJwks() {
    const isHomolog = this.configService.get('ENVIRONMENT_TYPE') === 'homolog';
    const key = isHomolog ? this.publicHomologJwk() : this.publicProdJwk();
    return { keys: [key] };
  }

  private publicHomologJwk() {
    return {
      e: 'AQAB',
      kid: 'yLJ6xexa-pGo5zo45lHV5_MA85ftV1EAq5YcvFb5JWo',
      kty: 'RSA',
      n: 'wtKIIGLeaviD2DIjQ8BWkt8C730Tn13MnaYgICPlLHKVFpOdlu0Ehj9F2IRYpHMeCzU4exlXEZbi28CtInBdMeddFwX_ndzx-XunJsKvkw5d26ckliFCGBYHAtZ2uTYZqLo1Zj3II8zDznEqwJSdnKeGAKH5B7S3_uNSYOHsomd2ThAd8q978zdvjIJEIanKi34W6f0E9Ih_yX7TixChBb1NJqcxF4lj3A-8LGazz5KRPrfSca0sd8v1o4bAmHmyR5ulF-7-vElyeoMq6od2qVKxLX2gCjFKojfyryJNiPIqunD3V_4c3bh9xPXAoeybNL7ZXbTzQ7fVCCi-1UrTTQ',
      alg: 'RS256',
      use: 'sig',
    };
  }

  private publicProdJwk() {
    return {
      e: 'AQAB',
      kid: 'RaTC5VN7YjUZWTgcVqx665vWMZ-zyL9MEm3qS2pnXPQ',
      kty: 'RSA',
      n: 'zgn-WU68jVgOfz37XcDHkcxxEf_k5c3fGnP_hfVBguXH14LuqbxvY8DAY504PI-HgqWQN2SpN-fU29fOqLtioDJpkg_VNsWpZCezGTTPD-o-Y0R-nFUnsWqCl1pbtPrVHKnIwthUm09DBzaHt4Bp6kVGl1m9d7pWArZNwshISFlEjPbNIAXA7EkizWlQ1zAHpjI3I2feAqUD7VlIQQL0NJg4pcMDUnxjLFPpdlACa_qLUiPQkpf33TevqfHF58IKB_c8SQRnKrHY4GV7jIDOoPsdLD5pS0KOJHz7ksaWpWeR-07G5JsN8QKa5MRrfkC_Oq8ZRUR-g1siCBQgUIIvXw',
      alg: 'RS256',
      use: 'sig',
    };
  }
}
