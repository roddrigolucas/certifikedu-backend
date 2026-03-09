import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ICertificateLedger } from '../../blockchain/interfaces/blockchain.interfaces';
import * as crypto from 'crypto';

@Injectable()
export class QldbService {
  constructor(private readonly prismaService: PrismaService) { }

  async insertCertificateOnLedger(certificateData: ICertificateLedger): Promise<string> {
    // Get the last entry's hash to create a chain
    const lastEntry = await this.prismaService.$queryRawUnsafe<any[]>(
      `SELECT document_hash FROM certificate_ledger ORDER BY created_at DESC LIMIT 1`,
    );

    const previousHash = lastEntry?.length > 0 ? lastEntry[0].document_hash : '0';

    // Create a hash of the certificate data + previous hash
    const dataString = JSON.stringify(certificateData) + previousHash;
    const documentHash = crypto.createHash('sha256').update(dataString).digest('hex');
    const documentId = crypto.randomUUID();

    await this.prismaService.$executeRawUnsafe(
      `INSERT INTO certificate_ledger (document_id, certificate_data, document_hash, previous_hash, created_at) VALUES ($1, $2, $3, $4, NOW())`,
      documentId,
      JSON.stringify(certificateData),
      documentHash,
      previousHash,
    );

    return documentId;
  }

  async getLedgerEntryInfo(documentId: string) {
    const result = await this.prismaService.$queryRawUnsafe<any[]>(
      `SELECT * FROM certificate_ledger WHERE document_id = $1`,
      documentId,
    );

    if (!result || result.length === 0) return null;

    return [{
      data: JSON.parse(result[0].certificate_data),
      metadata: {
        id: result[0].document_id,
        hash: result[0].document_hash,
        previousHash: result[0].previous_hash,
      },
    }];
  }
}
