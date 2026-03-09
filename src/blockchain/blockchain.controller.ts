import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guard';
import { Roles } from '../users/decorators';
import { RolesGuard } from '../users/guards';
import { BlockchainService } from './blockchain.service';
import { ApiTags } from '@nestjs/swagger';
import { QldbService } from '../aws/qldb/qldb.service';
import { ResponseBlockchainDto } from './dtos/blockchain-response.dto';

@ApiTags('PF -- Blockchain')
@Controller('blockchain')
@UseGuards(JwtGuard)
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService, private readonly qldbService: QldbService) {}

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @Get('/create/:id')
  async insertCertificate(
    @GetUser('id') userId: string,
    @Param('id') certificateId: string,
  ): Promise<ResponseBlockchainDto> {
    const certificate = await this.blockchainService.getCertificateById(certificateId);

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    if (certificate.blockchain) {
      throw new ForbiddenException('This certificate is already on the ledger');
    }

    if (!(userId == certificate.emissorId || userId == certificate.receptorId)) {
      throw new ForbiddenException('This user is not the owner or receptor of this certificate');
    }

    const certificateData = await this.blockchainService.createCertificateInfoForLedger(certificate, userId);

    const documentId = await this.qldbService.insertCertificateOnLedger(certificateData);

    await this.blockchainService.updateInternalCertificateBlockchainStatus(certificate.certificateId, documentId);

    return { documentId: documentId };
  }

  @UseGuards(RolesGuard)
  @Roles('enabled')
  @Get('/certificate/:id')
  async getEntryInfo(@GetUser('id') userId: string, @Param('id') certificateId: string) {
    const certificate = await this.blockchainService.getCertificateById(certificateId);

    if (!certificate) {
      throw new NotFoundException('certificate not found');
    }

    if (!certificate.blockchain || !certificate.blockchainUrl) {
      throw new BadRequestException('This certificate is not yet on the certifikedu blockchain');
    }

    if (!(certificate.emissorId == userId || certificate.receptorId == userId)) {
      throw new ForbiddenException('this user does not own this certificate');
    }

    return this.qldbService.getLedgerEntryInfo(certificate.blockchainUrl);
  }
}
