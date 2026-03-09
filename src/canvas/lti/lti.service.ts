import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { LTILoginDto } from './dto/lti-login.dto';
import { LTILaunchInfo } from './auth/lti-launch-info.interface';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LtiService {
  constructor(private readonly configService: ConfigService, private readonly prismaService: PrismaService) {}

  async getLTIAuthRedirectUrl(ltiLoginDto: LTILoginDto): Promise<string> {
    const state = randomUUID();

    await this.prismaService.canvasEphemeralLogin.create({
      data: { state: state, expiresAt: new Date(new Date().getTime() + 2 * 60000) },
    });

    const canvasAuthLtiUrl = new URL(this.configService.getOrThrow('CANVAS_AUTH_LTI_URL'));
    const redirectParams = new URLSearchParams({
      client_id: ltiLoginDto.client_id,
      login_hint: ltiLoginDto.login_hint,
      redirect_uri: ltiLoginDto.target_link_uri,
      state,
      scope: 'openid',
      nonce: randomUUID(),
      response_mode: 'form_post',
      response_type: 'id_token',
      prompt: 'none',
    });
    canvasAuthLtiUrl.search = redirectParams.toString();
    return canvasAuthLtiUrl.toString();
  }

  isInstructor(ltiLaunchInfo: LTILaunchInfo): boolean {
    return ltiLaunchInfo.roles.includes('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor');
  }

  isStudent(ltiLaunchInfo: LTILaunchInfo): boolean {
    return ltiLaunchInfo.roles.includes('http://purl.imsglobal.org/vocab/lis/v2/membership#Learner');
  }

  isCourseNavigation(ltiLaunchInfo: LTILaunchInfo): boolean {
    return ltiLaunchInfo.placement === 'course_navigation';
  }

  getPublicJwk() {
    this.configService.getOrThrow('ENVIRONMENT_TYPE') === 'homolog' ? this.publicHomologJwk() : this.publicProdJwk();
  }

  getLTIConfiguration() {
    return {
      title: 'CertifikEDU',
      scopes: [
        'https://purl.imsglobal.org/spec/lti-ags/scope/score',
        'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
        'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly',
        'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly',
        'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly',
        'https://canvas.instructure.com/lti/public_jwk/scope/update',
        'https://canvas.instructure.com/lti/account_lookup/scope/show',
        'https://canvas.instructure.com/lti-ags/progress/scope/show',
      ],
      extensions: [
        {
          platform: 'canvas.instructure.com',
          settings: {
            platform: 'instructure.com',
            placements: [
              {
                text: 'CertifikEDU',
                default: 'enabled',
                enabled: true,
                placement: 'course_navigation',
                message_type: 'LtiResourceLinkRequest',
              },
              {
                text: 'CertifikEDU',
                placement: 'user_navigation',
                message_type: 'LtiResourceLinkRequest',
              },
            ],
          },
          privacy_level: 'public',
        },
      ],
      public_jwk: {},
      description: 'CertifikEDU LTI 1.3 Tool',
      custom_fields: {
        canvas_sis_id: '$Canvas.user.sisid',
        canvas_user_id: '$Canvas.user.id',
        canvas_course_id: '$Canvas.course.id',
        canvas_course_start_at: '$Canvas.course.startAt',
        canvas_course_end_at: '$Canvas.course.endAt',
        canvas_course_grading_scheme: 'com.instructure.Course.gradingScheme',
        canvas_account_id: '$Canvas.account.id',
        canvas_api_domain: '$Canvas.api.domain',
        membership_role: '$Membership.role',
        com_membership_roles: '$com.Instructure.membership.roles',
        canvas_membership_roles: '$Canvas.membership.roles',
      },
      public_jwk_url: this.configService.getOrThrow('LTI_PUBLIC_JWK_URL'),
      target_link_uri: this.configService.getOrThrow('LTI_TARGET_LINK_URI'),
      oidc_initiation_url: this.configService.getOrThrow('LTI_OIDC_INITIATION_URL'),
    };
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
