import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { CanvasRepository } from './repository/canvas.repository';
import { CustomLogger } from '../logger/custom-logger.service';
import { ICanvasEnrollmentsResponse } from './types/canvas-enrollments-response.interface';
import { ICanvasCourseUsersResponse } from './types/canvas-course-users-response.interface';
import { LTILaunchInfo } from './lti/auth/lti-launch-info.interface';
import { ICanvasAuthResponse } from './types/canvas-auth-response.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CanvasApiClient {
  private token: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly repository: CanvasRepository,
    private readonly logger: CustomLogger,
    private readonly configService: ConfigService,
  ) {
    this.token = '';
  }

  async getOauth2RedirectUrl(
    ltiLaunchInfo: LTILaunchInfo,
    ltiConfigurationOptions: { canvasDomain: string; canvasClientIdDevKey: string; id: string },
    state: string,
  ): Promise<string> {
    const canvasClientId = ltiConfigurationOptions.canvasClientIdDevKey;
    const canvasOauth2Url = new URL(`${ltiConfigurationOptions.canvasDomain}/login/oauth2/auth`);
    canvasOauth2Url.search = new URLSearchParams({
      client_id: canvasClientId,
      response_type: 'code',
      state: state,
      scope: this.scopes,
      redirect_uri: this.configService.getOrThrow('CANVAS_OAUTH2_REDIRECT_URI'),
    }).toString();
    await this.repository.createLoginIntent(state, ltiConfigurationOptions.id, ltiLaunchInfo);
    return canvasOauth2Url.toString();
  }

  async generateNewUserToken(
    code: string,
    ltiConfigurationOptions: {
      canvasDomain: string;
      canvasClientIdDevKey: string;
      decryptedCanvasClientSecretDevKey: string;
    },
  ): Promise<void> {
    const url = new URL(`${ltiConfigurationOptions.canvasDomain}/login/oauth2/token`);
    url.search = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: ltiConfigurationOptions.canvasClientIdDevKey,
      client_secret: ltiConfigurationOptions.decryptedCanvasClientSecretDevKey,
      redirect_uri: this.configService.getOrThrow('CANVAS_OAUTH2_REDIRECT_URI'),
      code,
    }).toString();
    const response = await this.httpService.axiosRef.post<ICanvasAuthResponse>(url.toString());
    if (response.status !== HttpStatus.OK) {
      this.logger.error({ message: 'batata,' });
      throw new UnauthorizedException('Canvas authorization failed');
    }
    const token = await this.repository.saveToken(response.data, ltiConfigurationOptions.canvasDomain);
    this.token = token.token;
  }

  async getToken(
    ltiLaunchInfo: LTILaunchInfo,
    ltiConfigurationOptions: {
      canvasClientIdDevKey: string;
      decryptedCanvasClientSecretDevKey: string;
      domain: string;
    },
  ): Promise<string | undefined> {
    this.logger.info({ message: 'Getting canvas token' });
    const tokenOffset = 60 * 1000;
    const userId = ltiLaunchInfo.canvasCustomParameters.canvasUserId;
    const canvasToken = await this.repository.getToken(userId, ltiConfigurationOptions.domain);

    if (!canvasToken) {
      this.logger.error({ message: 'Canvas token not found' });
      return undefined;
    }

    // const now = new Date().getTime(); //15:00:10

    // if (canvasToken.tokenExpiration.getTime() <= now + tokenOffset) {
    //   this.logger.info({ message: 'Canvas token is valid' });
    //   this.token = canvasToken.token;
    //   return canvasToken.token;
    // }

    this.logger.info({ message: 'Canvas token is expired, refreshing token' });

    const url = new URL(`${ltiConfigurationOptions.domain}/login/oauth2/token`);
    url.search = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: ltiConfigurationOptions.canvasClientIdDevKey,
      client_secret: ltiConfigurationOptions.decryptedCanvasClientSecretDevKey,
      refresh_token: canvasToken.refreshToken,
    }).toString();

    const response = await this.httpService.axiosRef.post<ICanvasAuthResponse>(url.toString());
    if (response.status !== HttpStatus.OK) {
      throw new UnauthorizedException('Canvas authorization failed');
    }
    const newCanvastoken = await this.repository.updateToken(response.data, ltiConfigurationOptions.domain);
    this.token = newCanvastoken.token;
    return newCanvastoken.token;
  }

  async getAllCourseUsers(courseId: string, domain: string): Promise<ICanvasCourseUsersResponse[]> {
    this.logger.info({ message: 'Fetching all course users' });
    const result: ICanvasCourseUsersResponse[] = [];
    const url = new URL(`${domain}/api/v1/courses/${courseId}/users`);
    url.searchParams.append('per_page', '100');
    url.searchParams.append('enrollment_state', 'active');

    let response = await this.httpService.axiosRef.get(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    result.push(...response.data);
    let hasNextPage = this.hasNextPage(response.headers.link);
    while (hasNextPage) {
      this.logger.info({ message: 'Fetching next page of users' });
      const nextPageUrl = this.extractNextPageUrl(response.headers.link);
      response = await this.httpService.axiosRef.get(nextPageUrl, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      hasNextPage = this.hasNextPage(response.headers.link);
      result.push(...response.data);
    }
    this.logger.info({ message: `Found ${result.length} users in course` });
    return result;
  }

  async getAllEnrollments(courseId: string, domain: string): Promise<ICanvasEnrollmentsResponse[]> {
    this.logger.info({ message: 'Fetching all course enrollments' });
    const result: ICanvasEnrollmentsResponse[] = [];
    const url = new URL(`${domain}/api/v1/courses/${courseId}/enrollments`);
    url.searchParams.append('per_page', '100');
    url.searchParams.append('type[]', 'StudentEnrollment');
    url.searchParams.append('type[]', 'TeacherEnrollment');
    let response = await this.httpService.axiosRef.get(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    result.push(...response.data);
    let hasNextPage = this.hasNextPage(response.headers.link);
    while (hasNextPage) {
      this.logger.info({ message: 'Fetching next page of enrollments' });
      const nextPageUrl = this.extractNextPageUrl(response.headers.link);
      response = await this.httpService.axiosRef.get(nextPageUrl, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      hasNextPage = this.hasNextPage(response.headers.link);
      result.push(...response.data);
    }
    this.logger.info({ message: `Found ${result.length} enrollments` });
    return result;
  }

  private hasNextPage(linkHeader: string | undefined): boolean {
    if (!linkHeader) {
      return false;
    }
    return linkHeader.includes('rel="next"');
  }

  private extractNextPageUrl(linkHeader: string): string {
    return linkHeader
      .split(',')
      .find((link) => link.includes('rel="next"'))
      .split(';')[0]
      .replace(/<|>/g, '');
  }

  private get scopes() {
    const scopes = [
      'url:GET|/api/v1/courses/:course_id/enrollments',
      'url:GET|/api/v1/courses/:course_id/users',
      'url:GET|/api/v1/accounts/:account_id/users',
      '/auth/userinfo',
    ];
    return scopes.join(' ');
  }
}
