import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ICertificateEventSQS } from 'src/certificates/interfaces/certificates.interfaces';

@Injectable()
export class SQSService {
  private readonly logger = new Logger(SQSService.name);

  constructor(@InjectQueue('certificates-queue') private readonly certificatesQueue: Queue) { }

  async sendEvent(data: ICertificateEventSQS, messageGroupId: string) {
    this.logger.log(`[Queue] Adding event to queue for group "${messageGroupId}"`);
    await this.certificatesQueue.add('process-certificate', data, {
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}
