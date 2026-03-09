import { Injectable, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { SecretManagerService } from '../../../aws/secrets-manager/secrets-manager.service';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from '../../../logger/custom-logger.service';
import { randomUUID } from 'crypto';

@Injectable()
export class PagarmeService implements OnModuleInit {
  private axiosClient: AxiosInstance;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly smsService: SecretManagerService,
    private readonly loggerService: CustomLogger,
  ) { }

  async onModuleInit() {
    const envirnoment = await this.configService.getOrThrow('ENVIRONMENT_TYPE');
    const key = await this.smsService.getSecretFromKey(`API_PAGARME_${envirnoment}`);

    this.axiosClient = this.httpService.axiosRef;
    this.axiosClient.defaults.baseURL = 'https://api.pagar.me/core/v5';
    this.axiosClient.defaults.headers.Authorization = 'Basic ' + Buffer.from(`${key}:`).toString('base64');
    this.axiosClient.defaults.headers.Accept = 'application/json';
    this.axiosClient.defaults.headers['Content-Type'] = 'application/json';

    this.axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const axiosRequestId = randomUUID();
      config.headers['_requestId'] = axiosRequestId;

      this.loggerService.info({
        message: `Pagar.me API Request`,
        method: config.method?.toUpperCase(),
        url: config.url,
        axiosRequestId: axiosRequestId,
        requestBody: config?.data ?? null,
      });

      return config;
    });

    this.axiosClient.interceptors.response.use(
      (response: AxiosResponse) => {
        this.loggerService.info({
          message: `Pagar.me API Response`,
          method: response?.config?.method?.toUpperCase() ?? 'Method not Found',
          url: response?.config?.url ?? 'Url not Found',
          status: response?.status,
          axiosRequestId: response?.config?.headers['_requestId'] ?? 'Axios RequestId not Found',
          responseBody: response?.data ?? null,
        });

        return response;
      },
      (error) => {
        if (error.response) {
          this.loggerService.error({
            message: `Making request to Pagar.me API`,
            axiosRequestId: error?.config?.headers['axios_requestId'] ?? 'Axios RequestId not Found.',
            method: error?.config?.method?.toUpperCase() ?? 'Method not Found.',
            url: error?.config?.url ?? 'Url not Found.',
            status: error?.response?.status ?? 'Status not Found',
            data: error.response?.data ?? {},
            error: error,
          });

          if (!error.response.status) {
            this.loggerService.error(error);
            return { status: 500 };
          }

          return { status: error.response.status };
        } else {
          this.loggerService.error({
            message: 'Error sending request to Pagar.me',
            error: error,
          });

          return { status: 500 };
        }
      },
    );
  }

  get axios() {
    return this.axiosClient;
  }
}
