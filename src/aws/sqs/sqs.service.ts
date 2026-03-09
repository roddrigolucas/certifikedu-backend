import { Injectable } from '@nestjs/common';
import { ICertificateEventSQS } from 'src/certificates/interfaces/certificates.interfaces';

@Injectable()
export class SQSService {
  constructor() { }

  async sendEvent(data: ICertificateEventSQS, messageGroupId: string) {
    // Local mode: process event synchronously (log it)
    console.log(`[LocalQueue] Event received for group "${messageGroupId}":`, JSON.stringify(data));
    // In production, this would be processed by a queue consumer
    // For local dev, the event is logged and can be picked up by the calling service directly
  }
}
