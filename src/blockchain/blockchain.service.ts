import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TCertificatesWithAbilitiesOutput } from '../certificates/types/certificates.types';
import { ICertificateLedger } from './interfaces/blockchain.interfaces';

@Injectable()
export class BlockchainService {
  constructor(private readonly prismaService: PrismaService) {}

  async getCertificateById(certificateId: string): Promise<TCertificatesWithAbilitiesOutput> {
    return await this.prismaService.certificates.findUnique({
      where: { certificateId: certificateId },
      include: { habilidades: { include: { habilidade: true } } },
    });
  }

  async updateInternalCertificateBlockchainStatus(certificateId: string, documentId: string | null) {
    await this.prismaService.certificates.update({
      where: { certificateId: certificateId },
      data: { blockchain: false, blockchainUrl: documentId },
    });
  }

  async createCertificateInfoForLedger(
    certificate: TCertificatesWithAbilitiesOutput,
    userId: string,
  ): Promise<ICertificateLedger> {
    return {
      createdAt: new Date(),
      userId: userId,
      certificateId: certificate.certificateId,
      certificateCreationDate: certificate.createdAt,
      receptorDoc: certificate.receptorDoc,
      receptorName: certificate.receptorName ? certificate.receptorName : '',
      certificateName: certificate.name,
      certificateDescription: certificate.description,
      certificateHoursWorkload: certificate.cargaHoraria,
      associatedAbilities: certificate.habilidades.map((a) => a.habilidade.habilidade),
      emissorName: certificate.emissorName,
      emissorDoc: certificate.emissorDoc,
    };
  }

  async insertNewCertificate(userId: string, certificate: TCertificatesWithAbilitiesOutput) {
    const certificateLedgerData = await this.createCertificateInfoForLedger(certificate, userId);

    // Gera um Hash SHA-256 local contendo as informações críticas do certificado
    const dataString = JSON.stringify(certificateLedgerData);
    const documentId = createHash('sha256').update(dataString).digest('hex');

    await this.updateInternalCertificateBlockchainStatus(certificate.certificateId, documentId);
  }
}
