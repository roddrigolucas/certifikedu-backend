/**
 * RequestsService — Serviço de comunicação com lambdas/microserviços externos.
 *
 * Versão cloud-free: remove assinatura AWS4 e faz chamadas HTTP diretas.
 * Para dev local, as lambdas podem ser substituídas por mocks ou serviços locais.
 */
import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IBakeOpenBadge,
  ICreateAbilityEmbeddings,
  ICreateResumePdfLambda,
  ICreateEmailLambdaTemplate,
  ICreatePdi,
  ICreateTemplateLambda,
  IIssueSelfCertificateLambda,
  ILambdaValidateText,
  ISignCertificateLambda,
  IResponseResumePdf,
  ICreateCertificatePreview,
  Is3OperationsLambdaTemplate,
} from './requests.interfaces';
import {
  IJobCandidateResponse,
  IJobCandidateResponseTreated,
  INewJobLambda,
} from '../corporate/interfaces/corporate.interfaces';
import {
  IProfessionalProfileLambda,
  IUpdateProfileAbilitiesLambda,
} from '../candidate/interfaces/candidate.interfaces';
import { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { HttpService } from '@nestjs/axios';
import { CustomLogger } from '../logger/custom-logger.service';
import { STSService } from '../aws/sts/sts.service';
import { randomUUID } from 'crypto';
import { AuxService } from '../aux/aux.service';
import { ICertificateEventSQS } from 'src/certificates/interfaces/certificates.interfaces';

@Injectable()
export class RequestsService implements OnModuleInit {
  private axiosClient: AxiosInstance;

  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
    private readonly loggerService: CustomLogger,
    private readonly stsService: STSService,
    private readonly auxService: AuxService,
  ) { }

  async onModuleInit() {
    this.axiosClient = this.httpService.axiosRef;

    // Em modo local, usa URL configurável ou localhost
    const lambdaUrl = this.config.get('LAMBDA_BASE_URL') || 'http://localhost:3013';
    this.axiosClient.defaults.baseURL = lambdaUrl;

    if (this.auxService.localLambda) {
      this.axiosClient.defaults.baseURL = `http://192.168.1.101:8080`;
    }

    // Interceptor de request — sem assinatura AWS4, apenas logging
    this.axiosClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
      const lambdaRequestId = randomUUID();
      config.headers['_requestId'] = lambdaRequestId;
      config.headers['Content-Type'] = 'application/json';

      this.loggerService.info({
        message: `Lambda Request`,
        method: config.method?.toUpperCase(),
        baseUrl: config.baseURL,
        url: config.url,
        lamdaRequestId: lambdaRequestId,
        requestBody: config?.data ?? null,
      });

      return config;
    });

    // Interceptor de response — mantém lógica original
    this.axiosClient.interceptors.response.use(
      (response: AxiosResponse) => {
        this.loggerService.info({
          message: `Lambda Response`,
          method: response.config.method?.toUpperCase(),
          url: response.config.url,
          status: response.status,
          lambdaRequestId: response.config.headers['_requestId'] ?? 'Axios RequestId not found',
          responseBody: response.data ?? null,
        });

        if (this.auxService.localLambda) {
          response.status = response?.data?.statusCode ?? response.status;
          console.log(response.status);
        }

        if (response.status > 300 && response.config.url !== '/approveTextAutomatically') {
          throw new InternalServerErrorException(
            `Error calling lambda: Status: ${response.status}, message: ${response?.data?.message ?? ''}`,
          );
        }

        return response;
      },
      (error) => {
        if (error.response) {
          this.loggerService.info({
            message: `Making request to Lambda`,
            lambdaRequestId: error.config?.headers['axios_requestId'],
            method: error.config?.method?.toUpperCase(),
            url: error.config?.url,
            status: error.response?.status,
            data: JSON.stringify(error.response?.data ?? {}),
          });

          if (!error.response.status) {
            this.loggerService.error(error);
            throw new InternalServerErrorException('Error calling lambda');
          }

          throw new HttpException(
            `Lambda threw Error on response: ${error.response?.data ?? ''}`,
            error.response.status as HttpStatus,
          );
        } else {
          this.loggerService.error(error);
          throw new InternalServerErrorException(`Error sending request to lambda: ${error.message}`);
        }
      },
    );
  }

  private async requestWithRetry<T = void>(lambda: string, data: any, tries = 3): Promise<T> {
    let attempts = 0;
    let success = false;
    while (attempts < tries && !success) {
      try {
        attempts++;
        const response = await this.axiosClient.post(lambda, data);
        success = true;
        return response.data;
      } catch (err) {
        if (attempts >= tries) {
          throw new ServiceUnavailableException('Error calling model');
        }
      }
    }
  }

  async getOverlapImages(
    data: ICreateTemplateLambda | ISignCertificateLambda | IIssueSelfCertificateLambda | ICreateCertificatePreview,
  ) {
    await this.axiosClient.post('/OverlapImages', data);
  }

  async getApproveText(data: ILambdaValidateText): Promise<boolean> {
    const response = await this.axiosClient.post('/approveTextAutomatically', data);
    return response.status === 200;
  }

  async bakeOpenBadge(data: IBakeOpenBadge) {
    await this.axiosClient.post('/OpenBadge', data);
  }

  async emailTemplateLambda(data: ICreateEmailLambdaTemplate) {
    await this.axiosClient.post('/SaveEmailTemplate', data);
  }

  async s3OperationsLambda(data: Is3OperationsLambdaTemplate) {
    return await this.axiosClient.post('/s3Operations', data);
  }

  async resumePdfLambda(data: ICreateResumePdfLambda): Promise<Boolean> {
    const response = await this.axiosClient.post<IResponseResumePdf>('/SaveEmailTemplate', data);
    return response.data?.success ?? false;
  }

  async jobOpportunityLambda(data: INewJobLambda): Promise<Array<IJobCandidateResponse>> {
    if (this.auxService.localLambda) {
      const response = await this.requestWithRetry<{ body: string }>('/GenerateEmbeddingsProfessionalProfile', data);
      return JSON.parse(response.body).data as Array<IJobCandidateResponse>;
    }

    const response = await this.requestWithRetry<IJobCandidateResponseTreated>(
      '/GenerateEmbeddingsProfessionalProfile',
      data,
    );
    return response.data;
  }

  async createProfessionalProfileLamdba(data: IProfessionalProfileLambda) {
    return await this.axiosClient.post('/GenerateEmbeddingsProfessionalProfile', data);
  }

  async generateAbilitiesEmbeddings(data: ICreateAbilityEmbeddings) {
    return await this.requestWithRetry('/GenerateEmbeddingsProfessionalProfile', data);
  }

  async updateProfileAbilitiesLambda(data: IUpdateProfileAbilitiesLambda) {
    return await this.axiosClient.post('/QDrantAbilities', data);
  }

  async sendLocalSqsRequest(data: ICertificateEventSQS) {
    if (!this.auxService.localLambda) {
      return null;
    }
    return await this.axiosClient.post('/SQS', data);
  }

  async triggerPdiService(data: ICreatePdi): Promise<boolean> {
    try {
      await this.requestWithRetry(`${this.auxService.pdiServiceUrl}/generate_plan`, data);
      return true;
    } catch (err) {
      return false;
    }
  }
}
