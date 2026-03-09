import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QldbService } from '../aws/qldb/qldb.service';
import { TCertificatesWithAbilitiesOutput } from '../certificates/types/certificates.types';
import { ICertificateLedger } from './interfaces/blockchain.interfaces';

@Injectable()
export class BlockchainService {
  constructor(private readonly prismaService: PrismaService, private readonly qldbService: QldbService) {}

  async getCertificateById(certificateId: string): Promise<TCertificatesWithAbilitiesOutput> {
    return await this.prismaService.certificates.findUnique({
      where: { certificateId: certificateId },
      include: { habilidades: { include: { habilidade: true } } },
    });
  }

  async updateInternalCertificateBlockchainStatus(certificateId: string, documentId: string) {
    await this.prismaService.certificates.update({
      where: { certificateId: certificateId },
      data: { blockchain: true, blockchainUrl: documentId },
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

    const documentId = await this.qldbService.insertCertificateOnLedger(certificateLedgerData);

    await this.updateInternalCertificateBlockchainStatus(certificate.certificateId, documentId);
  }
}
