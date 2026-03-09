import { Body, Controller, Get, NotFoundException, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CertificateStatus } from '@prisma/client';
import { JwtGuard } from '../../auth/guard';
import { CertificatesService } from '../../certificates/certificates.service';
import { TCertificatesUpdateInput } from '../../certificates/types/certificates.types';
import { Roles } from '../../users/decorators';
import { RolesGuard } from '../../users/guards';
import { UsersService } from '../../users/users.service';
import { CertificatesPagQueryAdminDto, UpdateCertificateAdminDto } from '../dtos/certificates/certificates-input.dto';
import { ResponseCertificatesAdminDto } from '../dtos/certificates/certificates-response.dto';

@ApiTags('ADMIN -- Backgrounds')
@Controller('admin/certificates')
@UseGuards(JwtGuard, RolesGuard)
export class CertificatesAdminController {
  constructor(private readonly certificatesService: CertificatesService, private readonly usersService: UsersService) { }

  @Patch()
  @Roles('admin')
  async updateCertificate(@Body() dto: UpdateCertificateAdminDto): Promise<{ success: boolean }> {
    const certificate = await this.certificatesService.getCertificateById(dto.certificateId);

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    const certificateUpdateData: TCertificatesUpdateInput = {
      status: dto.status,
    };

    if (dto.status === CertificateStatus.DISABLED) {
      certificateUpdateData.habilidades.updateMany = {
        where: { certificateId: dto.certificateId },
        data: { userId: null },
      };
    }

    if (dto.status === CertificateStatus.ENABLED) {
      await this.certificatesService.createShareForSelfEmmitedCertificate(certificate);
    }

    await this.certificatesService.updateCertificateRecord(dto.certificateId, certificateUpdateData);

    return { success: true };
  }

  @Get('user/:userId')
  @Roles('admin')
  async adminGetUserCertificates(
    @Param('userId') userId: string,
    @Query() paginationQuery: CertificatesPagQueryAdminDto,
  ): Promise<ResponseCertificatesAdminDto> {
    const user = await this.usersService.getUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const data = await this.certificatesService.getUserCertificatesByIdPaginatedAdmin(userId, limit, skip);

    const hasNextPage: boolean = data.length > limit;

    if (hasNextPage) {
      data.pop();
    }

    return {
      data: {
        certificateInfo: data.map((certificate) => {
          return {
            certificateId: certificate.certificateId,
            certificateName: certificate.name,
            certificateDescription: certificate.description,
            certificateAbilities: certificate.habilidades.map((ability) => {
              return {
                ability: ability.habilidade.habilidade,
                category: ability.habilidade.tema,
              };
            }),
            certificateIssuer: certificate.emissorName,
            status: certificate.status,
            certificateCreatedAt: certificate.createdAt,
          };
        }),
        hasNextPage: hasNextPage,
      },
    };
  }
}
