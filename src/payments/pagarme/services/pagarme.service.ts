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

    const isMock = this.configService.get('PAGARME_MOCK') === 'true';
    if (isMock) {
      this.axiosClient.defaults.adapter = async (config: any) => {
        const url = config.url || '';
        const method = config.method?.toUpperCase() || 'GET';
        let data: any = null;
        try {
          data = config.data ? JSON.parse(config.data) : null;
        } catch (e) {
          data = config.data;
        }

        const mockResponse = (status: number, responseData: any) => ({
          data: responseData,
          status,
          statusText: 'OK',
          headers: {},
          config,
          request: {},
        });

        // POST /customers
        if (method === 'POST' && url === '/customers') {
          const customerId = 'cus_' + Math.random().toString(36).substring(7);
          return mockResponse(200, {
            id: customerId,
            name: data?.name || 'Cliente Mock',
            email: data?.email || 'mock@email.com',
            code: data?.code || 'code_mock',
            document: data?.document || '00000000000',
            document_type: 'CPF',
            delinquent: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            address: {
              id: 'addr_' + Math.random().toString(36).substring(7),
              line_1: data?.address?.line_1 || 'Rua Mock, 123',
              line_2: data?.address?.line_2 || '',
              zip_code: data?.address?.zip_code || '00000000',
              city: data?.address?.city || 'Cidade Mock',
              state: data?.address?.state || 'SP',
              country: data?.address?.country || 'BR',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          });
        }

        // GET /customers/:id/addresses
        if (method === 'GET' && url.includes('/customers/') && url.endsWith('/addresses')) {
          return mockResponse(200, {
            data: [
              {
                id: 'addr_mock_id',
                line_1: 'Rua Mock, 123',
                line_2: '',
                zip_code: '00000000',
                city: 'Cidade Mock',
                state: 'SP',
                country: 'BR',
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            ],
            paging: {
              total: 1
            }
          });
        }

        // GET /customers/:id
        if (method === 'GET' && url.startsWith('/customers/')) {
          const customerId = url.split('/').pop();
          return mockResponse(200, {
            id: customerId,
            name: 'Cliente Mock',
            email: 'customer_mock@email.com',
            code: 'code_mock',
            document: '12345678909',
            document_type: 'CPF',
            delinquent: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            address: {
              id: 'addr_mock_id',
              line_1: 'Rua Mock, 123',
              line_2: '',
              zip_code: '00000000',
              city: 'Cidade Mock',
              state: 'SP',
              country: 'BR',
              status: 'active',
            },
          });
        }

        // PUT /customers/:id
        if (method === 'PUT' && url.startsWith('/customers/')) {
          const customerId = url.split('/').pop();
          return mockResponse(200, {
            id: customerId,
            name: data?.name || 'Cliente Mock',
            email: data?.email || 'customer_mock@email.com',
            code: data?.code || 'code_mock',
            document: data?.document || '12345678909',
            document_type: 'CPF',
            delinquent: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        // POST /customers/:id/cards
        if (method === 'POST' && url.includes('/customers/') && url.endsWith('/cards')) {
          return mockResponse(200, {
            id: 'card_' + Math.random().toString(36).substring(7),
            brand: 'Visa',
            last_four_digits: data?.number ? data.number.slice(-4) : '4321',
            exp_month: data?.exp_month || 12,
            exp_year: data?.exp_year || 30,
            holder_name: data?.holder_name || 'TITULAR MOCK',
            holder_document: data?.holder_document || '12345678909',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        // GET /customers/:id/cards
        if (method === 'GET' && url.includes('/customers/') && url.endsWith('/cards')) {
          return mockResponse(200, {
            data: [
              {
                id: 'card_mock_id',
                brand: 'Visa',
                last_four_digits: '4321',
                exp_month: 12,
                exp_year: 30,
                holder_name: 'TITULAR MOCK',
                holder_document: '12345678909',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            ],
            paging: {
              total: 1
            }
          });
        }

        // DELETE /customers/:id/cards/:cardId
        if (method === 'DELETE' && url.includes('/cards/')) {
          return mockResponse(200, {
            id: url.split('/').pop(),
            deleted: true,
          });
        }

        // POST /subscriptions
        if (method === 'POST' && (url === '/subscriptions' || url === '/subscriptions/')) {
          const subId = 'sub_' + Math.random().toString(36).substring(7);
          return mockResponse(200, {
            id: subId,
            created_at: new Date().toISOString(),
            start_at: new Date().toISOString(),
            payment_method: data?.payment_method || 'credit_card',
            currency: 'BRL',
            interval: 'month',
            interval_count: 1,
            minimum_price: 100,
            billing_type: 'prepaid',
            status: 'active',
            plan: { id: data?.plan_id || 'plan_mock_id' },
            customer: { id: data?.customer_id || 'cus_mock_id' },
            card: { id: data?.card_id || 'card_mock_id' },
            items: (data?.items || []).map((item: any) => ({
              id: 'si_' + Math.random().toString(36).substring(7),
              name: item.name || 'Item Assinatura Mock',
              description: item.description || 'Assinatura Mock',
              quantity: item.quantity || 1,
              cycles: item.cycles || 0,
              pricing_scheme: {
                price: item.pricing_scheme?.price || 1150,
                scheme_type: item.pricing_scheme?.scheme_type || 'Unit',
              },
            })),
            current_cycle: {
              start_at: new Date().toISOString(),
              end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            },
          });
        }

        // GET /subscriptions/:id
        if (method === 'GET' && url.startsWith('/subscriptions/')) {
          const subId = url.split('/').pop();
          return mockResponse(200, {
            id: subId,
            created_at: new Date().toISOString(),
            start_at: new Date().toISOString(),
            payment_method: 'credit_card',
            currency: 'BRL',
            interval: 'month',
            interval_count: 1,
            minimum_price: 100,
            billing_type: 'prepaid',
            status: 'active',
            plan: { id: 'plan_mock_id' },
            customer: { id: 'cus_mock_id' },
            card: { id: 'card_mock_id' },
            items: [
              {
                id: 'si_mock_id',
                name: 'Item Assinatura Mock',
                description: 'Assinatura Mock',
                quantity: 1,
                cycles: 0,
                pricing_scheme: {
                  price: 1150,
                  scheme_type: 'Unit',
                },
              }
            ],
            current_cycle: {
              start_at: new Date().toISOString(),
              end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            },
          });
        }

        // DELETE /subscriptions/:id
        if (method === 'DELETE' && url.startsWith('/subscriptions/')) {
          const subId = url.split('/').pop();
          return mockResponse(200, {
            id: subId,
            status: 'canceled',
          });
        }

        // POST /plans
        if (method === 'POST' && (url === '/plans' || url === '/plans/')) {
          const planId = 'plan_' + Math.random().toString(36).substring(7);
          return mockResponse(200, {
            id: planId,
            name: data?.name,
            description: data?.description,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            interval: data?.interval,
            interval_count: data?.interval_count,
            billing_type: data?.billing_type,
            payment_methods: data?.payment_methods,
            items: (data?.items || []).map((item: any) => ({
              id: 'pi_' + Math.random().toString(36).substring(7),
              name: item.name,
              description: item.description,
              quantity: item.quantity,
              cycles: item.cycles || 0,
              pricing_scheme: {
                price: item.pricing_scheme?.price || 1000,
                scheme_type: item.pricing_scheme?.scheme_type || 'Unit',
              },
            })),
          });
        }

        // GET /plans/:id
        if (method === 'GET' && url.startsWith('/plans/')) {
          const planId = url.split('/').pop();
          return mockResponse(200, {
            id: planId,
            name: 'Plano Mock',
            description: 'Plano Mock',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            interval: 'month',
            interval_count: 1,
            billing_type: 'prepaid',
            payment_methods: ['credit_card'],
            items: [],
          });
        }

        // GET /plans
        if (method === 'GET' && (url === '/plans' || url === '/plans/')) {
          return mockResponse(200, {
            data: [],
            paging: { total: 0 },
          });
        }

        return mockResponse(200, {});
      };
    }

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

        if (response.status !== 200) {
          return null;
        }

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
