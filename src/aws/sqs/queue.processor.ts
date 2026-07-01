import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ICertificateEventSQS } from 'src/certificates/interfaces/certificates.interfaces';
import { RequestsService } from 'src/requests/requests.service';

@Processor('certificates-queue')
export class QueueProcessor extends WorkerHost {
  private readonly logger = new Logger(QueueProcessor.name);

  constructor(private readonly requestsService: RequestsService) {
    super();
  }

  async process(job: Job<ICertificateEventSQS, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} for group ${job.data?.Sign?.hash}`);
    try {
      // Dispara a requisição para a IA Python gerar a imagem do certificado
      await this.requestsService.sendLocalSqsRequest(job.data);
      this.logger.log(`Job ${job.id} processed successfully.`);
    } catch (error) {
      this.logger.error(`Error processing job ${job.id}: ${error.message}`);
      throw error; // Deixa o BullMQ lidar com os retries
    }
  }
}
